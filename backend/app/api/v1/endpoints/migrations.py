from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.migration import Migration, MigrationCreate, MigrationStatus
from app.services.migration_service import MigrationService

router = APIRouter()
migration_service = MigrationService()

@router.get("", response_model=List[Migration])
async def list_migrations():
    """List all migrations"""
    return migration_service.get_all_migrations()

@router.post("", response_model=Migration)
async def create_migration(migration: MigrationCreate):
    """Create a new migration"""
    return migration_service.create_migration(migration)

@router.get("/{migration_id}", response_model=Migration)
async def get_migration(migration_id: str):
    """Get a specific migration"""
    migration = migration_service.get_migration(migration_id)
    if not migration:
        raise HTTPException(status_code=404, detail="Migration not found")
    return migration

@router.get("/{migration_id}/status", response_model=MigrationStatus)
async def get_migration_status(migration_id: str):
    """Get the status of a specific migration"""
    status = migration_service.get_migration_status(migration_id)
    if not status:
        raise HTTPException(status_code=404, detail="Migration not found")
    return status
