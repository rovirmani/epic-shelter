import singlestoredb as s2
from contextlib import contextmanager
from fastapi import HTTPException
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CONN_STR = 'rohan-f3a1a:yl1w24fqziIdtPWjxgnYeujUt0KLFXp1@svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com:3333/db_rohan_b0247'

def row_to_dict(cursor, row):
    """Convert a row to a dictionary using column names"""
    if row is None:
        return None
    return {cursor.description[i][0]: value for i, value in enumerate(row)}

def init_db():
    """Initialize database tables if they don't exist"""
    try:
        with get_db() as cursor:
            # Create connections table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS connections (
                    db_uuid VARCHAR(36) PRIMARY KEY,
                    db_name VARCHAR(255) NOT NULL,
                    db_type VARCHAR(50) NOT NULL,
                    db_variables JSON,
                    created_at DATETIME NOT NULL
                )
            """)
            
            # Create migrations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS migrations (
                    migration_uuid VARCHAR(36) PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL,
                    source_uuid VARCHAR(36) NOT NULL,
                    target_uuid VARCHAR(36) NOT NULL,
                    source_type VARCHAR(50) NOT NULL,
                    target_type VARCHAR(50) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    is_recurring BOOLEAN DEFAULT FALSE,
                    scheduled_time DATETIME,
                    time_start DATETIME,
                    time_finish DATETIME,
                    last_run DATETIME,
                    creation_time DATETIME NOT NULL
                )
            """)

            # Create job_chunks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS job_chunks (
                    migration_uuid VARCHAR(36),
                    chunk_id INT,
                    is_completed BOOLEAN DEFAULT FALSE,
                    created_at DATETIME NOT NULL,
                    completed_at DATETIME,
                    error_message TEXT,
                    PRIMARY KEY (migration_uuid, chunk_id)
                )
            """)

            # Create migration_logs table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS migration_logs (
                    log_id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_uuid VARCHAR(36),
                    chunk_id INT,
                    log_level VARCHAR(20),
                    message TEXT,
                    timestamp DATETIME NOT NULL
                )
            """)

            # Create migration_metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS migration_metrics (
                    metric_id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_uuid VARCHAR(36),
                    chunk_id INT,
                    records_processed INT,
                    bytes_processed BIGINT,
                    processing_time INT, -- in milliseconds
                    timestamp DATETIME NOT NULL
                )
            """)

            logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

@contextmanager
def get_db():
    """Get a database connection"""
    conn = None
    try:
        conn = s2.connect(CONN_STR)
        cursor = conn.cursor()
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

def execute_query(query, params=None):
    """Execute a query and return all results"""
    try:
        with get_db() as cursor:
            cursor.execute(query, params or ())
            if not cursor.description:
                return []
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        logger.error(f"Query execution error: {str(e)}\nQuery: {query}\nParams: {params}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

def execute_single(query, params=None):
    """Execute a query and return a single result"""
    try:
        with get_db() as cursor:
            cursor.execute(query, params or ())
            if not cursor.description:
                return None
            row = cursor.fetchone()
            return row_to_dict(cursor, row) if row else None
    except Exception as e:
        logger.error(f"Query execution error: {str(e)}\nQuery: {query}\nParams: {params}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}"
        )

def execute_write(query, params=None):
    """Execute a write query (INSERT, UPDATE, DELETE)"""
    try:
        with get_db() as cursor:
            cursor.execute(query, params or ())
            return cursor.rowcount
    except Exception as e:
        logger.error(f"Write operation error: {str(e)}")
        raise

def test_connection():
    """Test the database connection and return diagnostic information"""
    try:
        with get_db() as cursor:
            # Test basic connectivity
            cursor.execute("SELECT 1")
            basic_connectivity = cursor.fetchone()[0] == 1

            # Get server version
            cursor.execute("SELECT @@version")
            server_version = cursor.fetchone()[0]

            # Check if required tables exist
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE()
            """)
            existing_tables = [row[0] for row in cursor.fetchall()]

            return {
                "status": "connected" if basic_connectivity else "error",
                "server_version": server_version,
                "existing_tables": existing_tables
            }
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    init_db()
    # Test the connection
    result = test_connection()
    print("Connection test result:", result)
