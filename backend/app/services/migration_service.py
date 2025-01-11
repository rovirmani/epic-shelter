from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import asyncio
import tempfile
import os

from app.schemas.migration import Migration, MigrationCreate, MigrationStatus
from app.connectors.singlestore import SingleStoreConnector
from app.connectors.hydrolix import HydrolixConnector
from app.services.parquet_service import ParquetService, ParquetConfig
from app.services.schema_service import SchemaService

class MigrationService:
    def __init__(self):
        self.migrations: List[Migration] = []
        self.parquet_service = ParquetService()
        self.schema_service = SchemaService()
    
    def get_all_migrations(self) -> List[Migration]:
        return self.migrations
    
    def get_migration(self, migration_id: str) -> Optional[Migration]:
        return next((m for m in self.migrations if m.id == migration_id), None)
    
    def create_migration(self, migration_create: MigrationCreate) -> Migration:
        migration = Migration(
            id=str(uuid.uuid4()),
            name=migration_create.name,
            source_type=migration_create.source_type,
            destination_type=migration_create.destination_type,
            status="pending",
            progress=0.0,
            created_at=datetime.utcnow()
        )
        self.migrations.append(migration)
        
        # Start migration process asynchronously
        asyncio.create_task(self._run_migration(migration, migration_create))
        return migration
    
    def get_migration_status(self, migration_id: str) -> Optional[MigrationStatus]:
        migration = self.get_migration(migration_id)
        if not migration:
            return None
            
        return MigrationStatus(
            status=migration.status,
            progress=migration.progress,
            current_step=migration.current_step,
            started_at=migration.started_at or datetime.utcnow(),
            completed_at=migration.completed_at,
            error_message=migration.error_message
        )
    
    async def _run_migration(self, migration: Migration, config: MigrationCreate):
        """Execute the migration process"""
        try:
            migration.status = "running"
            migration.started_at = datetime.utcnow()
            migration.current_step = "Connecting to source"
            migration.progress = 0.1
            
            # Connect to source
            source = SingleStoreConnector(config.source_config)
            await source.connect()
            
            # Get schema from source
            migration.current_step = "Reading source schema"
            migration.progress = 0.2
            source_schema = await source.get_schema()
            
            # Connect to destination
            migration.current_step = "Connecting to destination"
            migration.progress = 0.3
            destination = HydrolixConnector(config.destination_config)
            await destination.connect()
            
            # Create table in destination
            migration.current_step = "Creating destination table"
            migration.progress = 0.4
            
            # Translate schema
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
            migration.current_step = "Reading source data"
            migration.progress = 0.5
            data = await source.read_data(config.source_query)
            
            # Convert to Parquet
            migration.current_step = "Converting to Parquet"
            migration.progress = 0.7
            
            # Create temporary directory for Parquet files
            with tempfile.TemporaryDirectory() as temp_dir:
                parquet_path = os.path.join(temp_dir, f"{migration.id}.parquet")
                
                # Convert to Parquet with config
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
                migration.current_step = "Uploading to destination"
                migration.progress = 0.9
                rows_written = await destination.write_data(
                    parquet_path,
                    config.destination_table
                )
            
            # Cleanup
            await source.disconnect()
            await destination.disconnect()
            
            # Mark as complete
            migration.status = "completed"
            migration.progress = 1.0
            migration.current_step = f"Completed - {rows_written} rows migrated"
            migration.completed_at = datetime.utcnow()
            
        except Exception as e:
            migration.status = "failed"
            migration.error_message = str(e)
            migration.completed_at = datetime.utcnow()
            
            # Cleanup on error
            try:
                await source.disconnect()
                await destination.disconnect()
            except:
                pass
