from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from uuid import UUID4, uuid4
from app.schemas.migration import Migration, MigrationCreate, MigrationStatus
from app.schemas.job import Job, JobChunk
from app.schemas.connection import Connection, ConnectionCreate

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
        **migration.dict(),
        migration_uuid=uuid4(),
        status=MigrationStatus.SCHEDULED,
        creation_time=datetime.utcnow()
    )
    db.add(db_migration)
    db.commit()
    db.refresh(db_migration)
    return db_migration

@router.get("/migrations/{migration_uuid}", response_model=Migration)
def get_migration(migration_uuid: UUID4, db: Session = Depends(get_db)):
    migration = db.query(Migration).filter(Migration.migration_uuid == migration_uuid).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    return migration

@router.delete("/migrations/{migration_uuid}")
def delete_migration(migration_uuid: UUID4, db: Session = Depends(get_db)):
    migration = db.query(Migration).filter(Migration.migration_uuid == migration_uuid).first()
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    db.delete(migration)
    db.commit()
    return {"status": "success"}

@router.get("/connections", response_model=List[Connection])
def list_connections(db: Session = Depends(get_db)):
    return db.query(Connection).all()

@router.post("/connections", response_model=Connection)
def create_connection(connection: ConnectionCreate, db: Session = Depends(get_db)):
    db_connection = Connection(**connection.dict(), db_uuid=uuid4())
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

@router.get("/jobs/{migration_uuid}", response_model=Job)
def get_job_status(migration_uuid: UUID4, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.migration_uuid == migration_uuid).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
