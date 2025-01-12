from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional
from enum import Enum
from app.schemas.database_types import DatabaseType

class MigrationStatus(str, Enum):
    SCHEDULED = "scheduled"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class MigrationBase(BaseModel):
    source_uuid: UUID4
    target_uuid: UUID4
    source_type: DatabaseType
    target_type: DatabaseType
    migration_name: str
    is_recurring: bool = False
    scheduled_time: Optional[datetime] = None

class MigrationCreate(MigrationBase):
    pass

class Migration(MigrationBase):
    migration_uuid: UUID4
    status: MigrationStatus
    time_start: Optional[datetime] = None
    time_finish: Optional[datetime] = None
    last_run: Optional[datetime] = None
    creation_time: datetime
    time_until_next_run: Optional[int] = None
    
    class Config:
        from_attributes = True
