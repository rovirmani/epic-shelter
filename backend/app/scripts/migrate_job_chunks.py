import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import get_db, init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_job_chunks():
    """Migrate the job_chunks table to the new schema"""
    try:
        with get_db() as cursor:
            # Drop dependent tables first
            logger.info("Dropping dependent tables...")
            cursor.execute("DROP TABLE IF EXISTS migration_logs")
            cursor.execute("DROP TABLE IF EXISTS migration_metrics")
            cursor.execute("DROP TABLE IF EXISTS job_chunks")

            # Initialize new schema
            logger.info("Initializing new schema...")
            init_db()

            # Insert test data
            logger.info("Inserting test data...")
            cursor.execute("""
                INSERT INTO job_chunks (
                    migration_uuid,
                    chunk_id,
                    is_completed,
                    created_at,
                    completed_at
                ) VALUES
                -- Completed migration chunks
                ('660e8400-e29b-41d4-a716-446655440000', 1, true, '2025-01-11 00:00:00', '2025-01-11 00:30:00'),
                ('660e8400-e29b-41d4-a716-446655440000', 2, true, '2025-01-11 00:30:00', '2025-01-11 01:00:00'),
                ('660e8400-e29b-41d4-a716-446655440000', 3, true, '2025-01-11 01:00:00', '2025-01-11 01:30:00'),
                -- Running migration chunks
                ('660e8400-e29b-41d4-a716-446655440001', 1, true, '2025-01-11 22:00:00', '2025-01-11 22:20:00'),
                ('660e8400-e29b-41d4-a716-446655440001', 2, true, '2025-01-11 22:20:00', '2025-01-11 22:40:00'),
                ('660e8400-e29b-41d4-a716-446655440001', 3, false, '2025-01-11 22:40:00', NULL),
                ('660e8400-e29b-41d4-a716-446655440001', 4, false, '2025-01-11 22:40:00', NULL),
                -- Failed migration chunks
                ('660e8400-e29b-41d4-a716-446655440003', 1, true, '2025-01-11 21:00:00', '2025-01-11 21:10:00'),
                ('660e8400-e29b-41d4-a716-446655440003', 2, false, '2025-01-11 21:10:00', NULL)
            """)

            logger.info("Migration completed successfully")

    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    migrate_job_chunks()
