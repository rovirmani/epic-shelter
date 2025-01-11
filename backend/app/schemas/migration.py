from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class MigrationType(str, Enum):
    AWS_S3 = "aws_s3"
    AZURE_BLOB = "azure_blob"
    GCS = "gcs"
    SNOWFLAKE = "snowflake"
    DATABRICKS = "databricks"

class MigrationStatus(BaseModel):
    status: str
    progress: float
    current_step: str
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

class MigrationCreate(BaseModel):
    name: str
    source_type: MigrationType
    source_config: dict
    destination_type: MigrationType
    destination_config: dict
    transform_query: Optional[str] = None

class Migration(BaseModel):
    id: str
    name: str
    source_type: MigrationType
    destination_type: MigrationType
    status: str
    progress: float
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
