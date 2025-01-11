from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.migration import Migration, MigrationCreate, MigrationStatus
from app.services.migration_service import MigrationService
from app.api.deps import get_db

router = APIRouter()

@router.get("", response_model=List[Migration])
async def list_migrations(db: Session = Depends(get_db)):
    """List all migrations"""
    migration_service = MigrationService(db)
    return await migration_service.get_all_migrations()

@router.post("", response_model=Migration)
async def create_migration(
    migration: MigrationCreate,
    db: Session = Depends(get_db)
):
    """Create a new migration"""
    migration_service = MigrationService(db)
    return await migration_service.create_migration(migration)

@router.get("/{migration_id}", response_model=Migration)
async def get_migration(
    migration_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific migration"""
    migration_service = MigrationService(db)
    migration = await migration_service.get_migration(migration_id)
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    return migration

@router.get("/{migration_id}/status", response_model=MigrationStatus)
async def get_migration_status(
    migration_id: str,
    db: Session = Depends(get_db)
):
    """Get the status of a specific migration"""
    migration_service = MigrationService(db)
    status = await migration_service.get_migration_status(migration_id)
    if not status:
        raise HTTPException(status_code=404, detail="Migration not found")
    return status
