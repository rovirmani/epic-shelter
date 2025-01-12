from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from uuid import UUID
from datetime import datetime
from app.db import execute_query, execute_single, execute_write, test_connection
from app.schemas.connection import ConnectionCreate, Connection
from app.schemas.migration import MigrationCreate, Migration, MigrationStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Database Migration API"],
    responses={404: {"description": "Not found"}},
)

# Health check
@router.get("/health", tags=["Health"])
def health_check():
    """
    Check if the API is running.
    
    Returns:
        dict: Status message indicating the API is healthy
    """
    return {"status": "healthy"}

# Database Routes
@router.get("/databases", response_model=List[Connection])
async def list_databases():
    """List all database connections"""
    try:
        results = execute_query("""
            SELECT HEX(db_uuid) as db_uuid, db_name, db_type, db_variables
            FROM connections 
            ORDER BY created_at DESC
        """)
        
        # Convert hex string UUIDs to UUID objects and normalize database types
        normalized_results = []
        for result in results:
            try:
                # Convert hex string to UUID
                hex_uuid = result['db_uuid']
                uuid_str = f"{hex_uuid[0:8]}-{hex_uuid[8:12]}-{hex_uuid[12:16]}-{hex_uuid[16:20]}-{hex_uuid[20:32]}"
                result['db_uuid'] = UUID(uuid_str.lower())
                
                # Normalize postgresql to postgres
                if result['db_type'] == 'postgresql':
                    result['db_type'] = 'postgres'
                normalized_results.append(result)
            except (ValueError, AttributeError) as e:
                logger.error(f"Invalid database record: {result}, Error: {str(e)}")
                continue
                
        return normalized_results
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch database connections: {str(e)}")

@router.post("/databases", response_model=Connection)
async def create_database(connection: ConnectionCreate):
    """Create a new database connection"""
    try:
        db_uuid = uuid.uuid4()
        created_at = datetime.utcnow()
        
        execute_write("""
            INSERT INTO connections (db_uuid, db_name, db_type, db_variables, created_at)
            VALUES (UNHEX(REPLACE(%s, '-', '')), %s, %s, %s, %s)
        """, (str(db_uuid), connection.db_name, connection.db_type, connection.db_variables, created_at))
        
        return {
            "db_uuid": db_uuid,
            "db_name": connection.db_name,
            "db_type": connection.db_type,
            "db_variables": connection.db_variables
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/databases/{db_uuid}", response_model=Connection)
async def get_database(db_uuid: UUID):
    """Get a specific database connection"""
    try:
        result = execute_single("""
            SELECT HEX(db_uuid) as db_uuid, db_name, db_type, db_variables
            FROM connections 
            WHERE db_uuid = UNHEX(REPLACE(%s, '-', ''))
        """, (str(db_uuid),))
        
        if not result:
            raise HTTPException(status_code=404, detail="Database connection not found")
        
        # Convert hex string to UUID
        hex_uuid = result['db_uuid']
        uuid_str = f"{hex_uuid[0:8]}-{hex_uuid[8:12]}-{hex_uuid[12:16]}-{hex_uuid[16:20]}-{hex_uuid[20:32]}"
        result['db_uuid'] = UUID(uuid_str.lower())
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Migration Routes
@router.get("/migrations", response_model=List[Migration])
async def list_migrations():
    """List all migrations"""
    try:
        results = execute_query("""
            SELECT 
                HEX(m.migration_uuid) as migration_uuid,
                m.migration_name,
                HEX(m.source_uuid) as source_uuid,
                HEX(m.target_uuid) as target_uuid,
                m.source_type,
                m.target_type,
                LOWER(m.status) as status,
                m.is_recurring,
                m.scheduled_time,
                m.time_start,
                m.time_finish,
                m.creation_time,
                m.last_run,
                CASE 
                    WHEN m.scheduled_time IS NOT NULL 
                    THEN TIMESTAMPDIFF(SECOND, NOW(), m.scheduled_time) 
                    ELSE NULL 
                END as time_until_next_run
            FROM migrations m
            ORDER BY m.creation_time DESC
        """)
        
        # Convert hex UUIDs to string format
        normalized_results = []
        for result in results:
            try:
                # Convert hex to UUID string format
                for uuid_field in ['migration_uuid', 'source_uuid', 'target_uuid']:
                    hex_str = result[uuid_field]
                    uuid_str = f"{hex_str[0:8]}-{hex_str[8:12]}-{hex_str[12:16]}-{hex_str[16:20]}-{hex_str[20:32]}".lower()
                    result[uuid_field] = uuid_str
                
                normalized_results.append(result)
            except (ValueError, AttributeError) as e:
                logger.error(f"Invalid migration record: {result}, Error: {str(e)}")
                continue
                
        return normalized_results
    except Exception as e:
        logger.error(f"Failed to list migrations: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch migrations: {str(e)}"
        )

@router.post("/migrations", response_model=Migration)
async def create_migration(migration: MigrationCreate):
    """Create a new migration"""
    try:
        # Validate source and target databases exist
        source = execute_single("SELECT db_type FROM connections WHERE db_uuid = UNHEX(REPLACE(%s, '-', ''))", (migration.source_uuid,))
        target = execute_single("SELECT db_type FROM connections WHERE db_uuid = UNHEX(REPLACE(%s, '-', ''))", (migration.target_uuid,))
        
        if not source or not target:
            raise HTTPException(status_code=404, detail="Source or target database not found")
        
        migration_uuid = uuid.uuid4()
        creation_time = datetime.utcnow()
        
        execute_write("""
            INSERT INTO migrations (
                migration_uuid, migration_name, source_uuid, target_uuid,
                source_type, target_type, status, is_recurring,
                scheduled_time, creation_time
            )
            VALUES (UNHEX(REPLACE(%s, '-', '')), %s, UNHEX(REPLACE(%s, '-', '')), UNHEX(REPLACE(%s, '-', '')),
                    %s, %s, %s, %s, %s, %s)
        """, (
            str(migration_uuid), migration.migration_name, str(migration.source_uuid), str(migration.target_uuid),
            migration.source_type, migration.target_type, MigrationStatus.SCHEDULED, migration.is_recurring,
            migration.scheduled_time, creation_time
        ))
        
        return {
            "migration_uuid": migration_uuid,
            "migration_name": migration.migration_name,
            "source_uuid": migration.source_uuid,
            "target_uuid": migration.target_uuid,
            "source_type": migration.source_type,
            "target_type": migration.target_type,
            "status": MigrationStatus.SCHEDULED,
            "is_recurring": migration.is_recurring,
            "scheduled_time": migration.scheduled_time,
            "time_start": None,
            "time_finish": None,
            "creation_time": creation_time,
            "last_run": None,
            "time_until_next_run": None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/migrations/{migration_uuid}", response_model=Migration)
async def get_migration(migration_uuid: UUID):
    """Get a specific migration"""
    try:
        result = execute_single("""
            SELECT 
                HEX(m.migration_uuid) as migration_uuid,
                m.migration_name,
                HEX(m.source_uuid) as source_uuid,
                HEX(m.target_uuid) as target_uuid,
                m.source_type,
                m.target_type,
                m.status,
                m.is_recurring,
                m.scheduled_time,
                m.time_start,
                m.time_finish,
                m.creation_time,
                m.last_run,
                EXTRACT(EPOCH FROM (m.scheduled_time - NOW())) as time_until_next_run
            FROM migrations m
            WHERE m.migration_uuid = UNHEX(REPLACE(%s, '-', ''))
        """, (str(migration_uuid),))
        
        if not result:
            raise HTTPException(status_code=404, detail="Migration not found")
        
        # Convert hex string to UUID
        hex_uuid = result['migration_uuid']
        uuid_str = f"{hex_uuid[0:8]}-{hex_uuid[8:12]}-{hex_uuid[12:16]}-{hex_uuid[16:20]}-{hex_uuid[20:32]}"
        result['migration_uuid'] = UUID(uuid_str.lower())
        
        hex_uuid = result['source_uuid']
        uuid_str = f"{hex_uuid[0:8]}-{hex_uuid[8:12]}-{hex_uuid[12:16]}-{hex_uuid[16:20]}-{hex_uuid[20:32]}"
        result['source_uuid'] = UUID(uuid_str.lower())
        
        hex_uuid = result['target_uuid']
        uuid_str = f"{hex_uuid[0:8]}-{hex_uuid[8:12]}-{hex_uuid[12:16]}-{hex_uuid[16:20]}-{hex_uuid[20:32]}"
        result['target_uuid'] = UUID(uuid_str.lower())
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/migrations/{migration_uuid}/status", response_model=MigrationStatus)
async def get_migration_status(migration_uuid: UUID):
    """Get the current status of a migration"""
    try:
        result = execute_single("""
            SELECT 
                m.status,
                m.time_start,
                m.time_finish,
                COALESCE(
                    (SELECT COUNT(*) FROM job_chunks WHERE migration_uuid = UNHEX(REPLACE(%s, '-', '')) AND is_completed = TRUE) * 100.0 /
                    NULLIF((SELECT COUNT(*) FROM job_chunks WHERE migration_uuid = UNHEX(REPLACE(%s, '-', ''))), 0),
                    0
                ) as progress_percentage,
                j.current_throughput,
                j.average_throughput
            FROM migrations m
            LEFT JOIN jobs j ON j.migration_uuid = m.migration_uuid
            WHERE m.migration_uuid = UNHEX(REPLACE(%s, '-', ''))
        """, (str(migration_uuid), str(migration_uuid), str(migration_uuid)))
        
        if not result:
            raise HTTPException(status_code=404, detail="Migration not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-connection", 
    summary="Test database connection",
    description="Test the connection to SingleStore and return diagnostic information",
    response_description="Connection test results"
)
async def test_db_connection():
    """
    Test the database connection and return diagnostic information.
    
    Returns:
        dict: Connection test results including:
            - connection status
            - server version
            - migrations table existence
    """
    return test_connection()
