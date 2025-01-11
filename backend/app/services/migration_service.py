from typing import List, Optional
from datetime import datetime
import uuid
from app.schemas.migration import Migration, MigrationCreate, MigrationStatus

class MigrationService:
    def __init__(self):
        # TODO: Replace with actual database
        self.migrations: List[Migration] = []
    
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
        return migration
    
    def get_migration_status(self, migration_id: str) -> Optional[MigrationStatus]:
        migration = self.get_migration(migration_id)
        if not migration:
            return None
            
        return MigrationStatus(
            status=migration.status,
            progress=migration.progress,
            current_step="Initializing" if migration.progress == 0 else "Processing",
            started_at=migration.started_at or datetime.utcnow(),
            completed_at=migration.completed_at,
            error_message=migration.error_message
        )
