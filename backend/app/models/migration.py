from sqlalchemy import Column, String, Float, DateTime, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from app.schemas.migration import MigrationType

Base = declarative_base()

class MigrationModel(Base):
    __tablename__ = "migrations"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    source_type = Column(SQLEnum(MigrationType), nullable=False)
    source_config = Column(Text, nullable=False)  # JSON string
    destination_type = Column(SQLEnum(MigrationType), nullable=False)
    destination_config = Column(Text, nullable=False)  # JSON string
    source_query = Column(Text, nullable=False)
    destination_table = Column(String, nullable=False)
    status = Column(String, nullable=False)
    progress = Column(Float, nullable=False, default=0.0)
    current_step = Column(String, nullable=False, default="Initializing")
    error_message = Column(Text)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Additional fields for recovery
    last_successful_step = Column(String)
    checkpoint_data = Column(Text)  # JSON string for storing progress data
