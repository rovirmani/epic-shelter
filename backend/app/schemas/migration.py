from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class MigrationType(str, Enum):
    SINGLESTORE = "singlestore"
    #TODO ADD Future connectors
    AWS_S3 = "aws_s3"
    AZURE_BLOB = "azure_blob"
    GCS = "gcs"
    SNOWFLAKE = "snowflake"
    DATABRICKS = "databricks"

class DestinationType(str, Enum):
    """Supported destination types"""
    DEFAULT = "default"

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
    source_config: Dict[str, Any]
    destination_type: DestinationType
    destination_config: Dict[str, Any]
    source_query: str
    destination_table: str
    primary_key: Optional[List[str]] = None
    partition_cols: Optional[List[str]] = None
    chunk_size: Optional[int] = None

class Migration(BaseModel):
    id: str
    name: str
    source_type: MigrationType
    destination_type: DestinationType
    status: str
    progress: float
    current_step: str = "Initializing"
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
