from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import asyncio
import tempfile
import os
import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.migration import Migration, MigrationCreate, MigrationStatus
from app.models.migration import MigrationModel
from app.connectors.singlestore import SingleStoreConnector
from app.connectors.hydrolix import HydrolixConnector
from app.services.parquet_service import ParquetService, ParquetConfig
from app.services.schema_service import SchemaService
from app.core.monitoring import metrics, log_step, monitor_migration_progress

class MigrationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.parquet_service = ParquetService()
        self.schema_service = SchemaService()
    
    async def get_all_migrations(self) -> List[Migration]:
        """Get all migrations from database"""
        query = select(MigrationModel)
        result = await self.db.execute(query)
        models = result.scalars().all()
        return [self._model_to_schema(model) for model in models]
    
    async def get_migration(self, migration_id: str) -> Optional[Migration]:
        """Get a specific migration by ID"""
        model = await self.db.get(MigrationModel, migration_id)
        return self._model_to_schema(model) if model else None
    
    async def create_migration(self, migration_create: MigrationCreate) -> Migration:
        """Create a new migration"""
        migration_id = str(uuid.uuid4())
        
        # Create model
        model = MigrationModel(
            id=migration_id,
            name=migration_create.name,
            source_type=migration_create.source_type,
            source_config=json.dumps(migration_create.source_config),
            destination_type=migration_create.destination_type,
            destination_config=json.dumps(migration_create.destination_config),
            source_query=migration_create.source_query,
            destination_table=migration_create.destination_table,
            status="pending",
            progress=0.0,
            created_at=datetime.utcnow()
        )
        
        self.db.add(model)
        await self.db.commit()
        await self.db.refresh(model)
        
        # Start migration process asynchronously
        asyncio.create_task(self._run_migration(migration_id, migration_create))
        
        return self._model_to_schema(model)
    
    async def get_migration_status(self, migration_id: str) -> Optional[MigrationStatus]:
        """Get migration status"""
        model = await self.db.get(MigrationModel, migration_id)
        if not model:
            return None
            
        return MigrationStatus(
            status=model.status,
            progress=model.progress,
            current_step=model.current_step,
            started_at=model.started_at or datetime.utcnow(),
            completed_at=model.completed_at,
            error_message=model.error_message
        )
    
    @log_step("run_migration")
    async def _run_migration(self, migration_id: str, config: MigrationCreate):
        """Execute the migration process with monitoring and error recovery"""
        model = await self.db.get(MigrationModel, migration_id)
        source = None
        destination = None
        start_time = datetime.utcnow()
        
        try:
            metrics.record_migration_start(migration_id)
            model.status = "running"
            model.started_at = start_time
            await self.db.commit()
            
            # Start progress monitoring
            monitor_task = asyncio.create_task(
                monitor_migration_progress(
                    migration_id,
                    self.get_migration_status
                )
            )
            
            # Connect to source
            await self._update_status(model, "Connecting to source", 0.1)
            source = SingleStoreConnector(config.source_config)
            await source.connect()
            
            # Get schema from source
            await self._update_status(model, "Reading source schema", 0.2)
            source_schema = await source.get_schema()
            
            # Connect to destination
            await self._update_status(model, "Connecting to destination", 0.3)
            destination = HydrolixConnector(config.destination_config)
            await destination.connect()
            
            # Create table in destination
            await self._update_status(model, "Creating destination table", 0.4)
            hydrolix_schema = self.schema_service.translate_to_hydrolix_schema(
                source_schema=source_schema,
                primary_key=config.primary_key,
                partition_cols=config.partition_cols
            )
            
            await destination.create_table(
                config.destination_table,
                hydrolix_schema
            )
            
            # Read data from source
            await self._update_status(model, "Reading source data", 0.5)
            data = await source.read_data(config.source_query)
            
            # Convert to Parquet
            await self._update_status(model, "Converting to Parquet", 0.7)
            with tempfile.TemporaryDirectory() as temp_dir:
                parquet_path = os.path.join(temp_dir, f"{migration_id}.parquet")
                
                parquet_config = ParquetConfig(
                    partition_cols=config.partition_cols,
                    chunk_size=config.chunk_size or 100000
                )
                
                await self.parquet_service.convert_to_parquet(
                    data=data,
                    schema=source_schema,
                    output_path=parquet_path,
                    config=parquet_config
                )
                
                # Upload to Hydrolix
                await self._update_status(model, "Uploading to destination", 0.9)
                rows_written = await destination.write_data(
                    parquet_path,
                    config.destination_table
                )
            
            # Success
            duration = (datetime.utcnow() - start_time).total_seconds()
            metrics.record_migration_success(migration_id, rows_written, duration)
            
            await self._update_status(
                model,
                f"Completed - {rows_written} rows migrated",
                1.0,
                "completed",
                completed_at=datetime.utcnow()
            )
            
        except Exception as e:
            metrics.record_migration_failure(migration_id, str(e))
            await self._update_status(
                model,
                "Failed",
                model.progress,
                "failed",
                error_message=str(e),
                completed_at=datetime.utcnow()
            )
        finally:
            # Cleanup
            if source:
                await source.disconnect()
            if destination:
                await destination.disconnect()
            
            # Cancel monitoring
            monitor_task.cancel()
            
            await self.db.commit()
    
    async def _update_status(
        self,
        model: MigrationModel,
        step: str,
        progress: float,
        status: Optional[str] = None,
        error_message: Optional[str] = None,
        completed_at: Optional[datetime] = None
    ):
        """Update migration status in database"""
        model.current_step = step
        model.progress = progress
        
        if status:
            model.status = status
        if error_message:
            model.error_message = error_message
        if completed_at:
            model.completed_at = completed_at
            
        await self.db.commit()
    
    def _model_to_schema(self, model: MigrationModel) -> Migration:
        """Convert database model to Pydantic schema"""
        return Migration(
            id=model.id,
            name=model.name,
            source_type=model.source_type,
            destination_type=model.destination_type,
            status=model.status,
            progress=model.progress,
            current_step=model.current_step,
            created_at=model.created_at,
            started_at=model.started_at,
            completed_at=model.completed_at,
            error_message=model.error_message
        )
