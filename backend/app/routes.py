from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

# Models
class MigrationBase(BaseModel):
    source_db: str
    target_db: str
    scheduled_time: Optional[datetime] = None
    is_recurring: bool = False

class MigrationCreate(MigrationBase):
    pass

class Migration(MigrationBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Router
router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.get("/migrations", response_model=List[Migration])
def list_migrations(db: Session = Depends(get_db)):
    return db.query(Migration).all()

@router.post("/migrations", response_model=Migration)
def create_migration(migration: MigrationCreate, db: Session = Depends(get_db)):
    db_migration = Migration(
        source_db=migration.source_db,
        target_db=migration.target_db,
        scheduled_time=migration.scheduled_time,
        is_recurring=migration.is_recurring,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(db_migration)
    db.commit()
    db.refresh(db_migration)
    return db_migration

@router.get("/migrations/{migration_id}", response_model=Migration)
def get_migration(migration_id: int, db: Session = Depends(get_db)):
    migration = db.query(Migration).filter(Migration.id == migration_id).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    return migration

@router.delete("/migrations/{migration_id}")
def delete_migration(migration_id: int, db: Session = Depends(get_db)):
    migration = db.query(Migration).filter(Migration.id == migration_id).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    db.delete(migration)
    db.commit()
    return {"status": "success"}
