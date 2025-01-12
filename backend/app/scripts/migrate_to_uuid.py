import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.db import execute_write
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_to_uuid():
    try:
        # Drop existing tables in reverse order to handle foreign keys
        logger.info("Dropping existing tables...")
        execute_write("DROP TABLE IF EXISTS migration_metrics")
        execute_write("DROP TABLE IF EXISTS migration_logs")
        execute_write("DROP TABLE IF EXISTS job_chunks")
        execute_write("DROP TABLE IF EXISTS migrations")
        execute_write("DROP TABLE IF EXISTS connections")
        
        # Create new tables with BINARY(16) for UUID columns
        logger.info("Creating new tables with BINARY(16) for UUID storage...")
        
        # Connections table
        execute_write("""
            CREATE TABLE connections (
                db_uuid BINARY(16) PRIMARY KEY,
                db_name VARCHAR(255) NOT NULL,
                db_type VARCHAR(50) NOT NULL,
                db_variables JSON,
                created_at DATETIME NOT NULL
            )
        """)
        
        # Migrations table
        execute_write("""
            CREATE TABLE migrations (
                migration_uuid BINARY(16) PRIMARY KEY,
                migration_name VARCHAR(255) NOT NULL,
                source_uuid BINARY(16) NOT NULL,
                target_uuid BINARY(16) NOT NULL,
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
        
        # Job chunks table
        execute_write("""
            CREATE TABLE job_chunks (
                migration_uuid BINARY(16),
                chunk_id INT,
                is_completed BOOLEAN DEFAULT FALSE,
                created_at DATETIME NOT NULL,
                completed_at DATETIME,
                error_message TEXT,
                PRIMARY KEY (migration_uuid, chunk_id)
            )
        """)
        
        # Migration logs table
        execute_write("""
            CREATE TABLE migration_logs (
                log_id INT AUTO_INCREMENT PRIMARY KEY,
                migration_uuid BINARY(16),
                chunk_id INT,
                log_level VARCHAR(20),
                message TEXT,
                timestamp DATETIME NOT NULL
            )
        """)
        
        # Migration metrics table
        execute_write("""
            CREATE TABLE migration_metrics (
                metric_id INT AUTO_INCREMENT PRIMARY KEY,
                migration_uuid BINARY(16),
                chunk_id INT,
                records_processed INT,
                bytes_processed BIGINT,
                processing_time INT,
                timestamp DATETIME NOT NULL
            )
        """)
        
        logger.info("Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate_to_uuid()
