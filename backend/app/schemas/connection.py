from uuid import UUID, uuid4
from pydantic import BaseModel
from typing import Dict, Any
from app.schemas.database_types import DatabaseType

class ConnectionBase(BaseModel):
    db_type: DatabaseType
    db_name: str  # display name for the connection
    db_variables: Dict[str, Any]  # flexible dictionary for any connection variables

class ConnectionCreate(ConnectionBase):
    pass

class Connection(ConnectionBase):
    db_uuid: UUID
    
    class Config:
        from_attributes = True
