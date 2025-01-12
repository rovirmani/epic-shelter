import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import execute_write
import logging
import json
from uuid import uuid4
from datetime import datetime, timedelta
from pytz import timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def insert_mock_data():
    """Insert mock data into all tables"""
    try:
        # Generate some UUIDs for connections
        supabase_uuid = uuid4()
        s2_uuid_1 = uuid4()
        mysql_uuid = uuid4()
        s2_uuid_2 = uuid4()
        pg_uuid = uuid4()
        
        # Clear existing data
        execute_write("TRUNCATE TABLE connections")
        execute_write("TRUNCATE TABLE migrations")
        execute_write("TRUNCATE TABLE job_chunks")
        execute_write("TRUNCATE TABLE migration_logs")
        execute_write("TRUNCATE TABLE migration_metrics")

        # Insert test connections
        logger.info("Inserting mock connections...")
        for uuid_val, name, db_type in [
            (supabase_uuid, 'Source Supabase DB', 'supabase'),
            (s2_uuid_1, 'Target SingleStore DB 1', 'singlestore'),
            (mysql_uuid, 'Source MySQL DB', 'mysql'),
            (s2_uuid_2, 'Target SingleStore DB 2', 'singlestore'),
            (pg_uuid, 'Source Postgres DB', 'postgres')
        ]:
            execute_write("""
                INSERT INTO connections (db_uuid, db_name, db_type, db_variables, created_at)
                VALUES (UNHEX(REPLACE(%s, '-', '')), %s, %s, %s, %s)
            """, (
                str(uuid_val),
                name,
                db_type,
                json.dumps({"host": "REDACTED", "port": 3306, "database": "REDACTED", "user": "REDACTED", "password": "REDACTED"}),
                datetime.now(timezone('UTC'))
            ))

        # Insert test migrations
        logger.info("Inserting mock migrations...")
        for source_uuid, target_uuid, source_type, target_type in [
            (supabase_uuid, s2_uuid_1, 'supabase', 'singlestore'),
            (mysql_uuid, s2_uuid_2, 'mysql', 'singlestore'),
            (pg_uuid, s2_uuid_1, 'postgres', 'singlestore')
        ]:
            migration_uuid = uuid4()
            now = datetime.now(timezone('UTC'))
            execute_write("""
                INSERT INTO migrations (
                    migration_uuid, migration_name, source_uuid, target_uuid,
                    source_type, target_type, status, is_recurring,
                    scheduled_time, time_start, time_finish, last_run, creation_time
                )
                VALUES (
                    UNHEX(REPLACE(%s, '-', '')), %s, 
                    UNHEX(REPLACE(%s, '-', '')), UNHEX(REPLACE(%s, '-', '')),
                    %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                str(migration_uuid),
                f"Migration from {source_type} to {target_type}",
                str(source_uuid),
                str(target_uuid),
                source_type,
                target_type,
                'COMPLETED',
                True,
                now + timedelta(days=1),
                now - timedelta(hours=2),
                now - timedelta(hours=1),
                now - timedelta(hours=1),
                now - timedelta(hours=2)
            ))

            # Insert job chunks for each migration
            logger.info(f"Inserting mock job chunks for migration {migration_uuid}...")
            for chunk_id in range(5):
                execute_write("""
                    INSERT INTO job_chunks (
                        migration_uuid, chunk_id, is_completed,
                        created_at, completed_at, error_message
                    )
                    VALUES (UNHEX(REPLACE(%s, '-', '')), %s, %s, %s, %s, %s)
                """, (
                    str(migration_uuid),
                    chunk_id,
                    True,
                    now - timedelta(hours=2),
                    now - timedelta(hours=1),
                    None if chunk_id != 2 else "Sample error message"
                ))

            # Insert migration logs
            logger.info(f"Inserting mock logs for migration {migration_uuid}...")
            for log_level in ['INFO', 'WARNING', 'ERROR']:
                execute_write("""
                    INSERT INTO migration_logs (
                        migration_uuid, chunk_id, log_level,
                        message, timestamp
                    )
                    VALUES (UNHEX(REPLACE(%s, '-', '')), %s, %s, %s, %s)
                """, (
                    str(migration_uuid),
                    1,
                    log_level,
                    f"Sample {log_level} message for migration",
                    now - timedelta(hours=1, minutes=30)
                ))

            # Insert migration metrics
            logger.info(f"Inserting mock metrics for migration {migration_uuid}...")
            for chunk_id in range(5):
                execute_write("""
                    INSERT INTO migration_metrics (
                        migration_uuid, chunk_id, records_processed,
                        bytes_processed, processing_time, timestamp
                    )
                    VALUES (UNHEX(REPLACE(%s, '-', '')), %s, %s, %s, %s, %s)
                """, (
                    str(migration_uuid),
                    chunk_id,
                    1000 + chunk_id * 100,
                    5000000 + chunk_id * 1000000,
                    300000 + chunk_id * 10000,  # milliseconds
                    now - timedelta(hours=1, minutes=30)
                ))

        logger.info("Mock data inserted successfully")

    except Exception as e:
        logger.error(f"Failed to insert mock data: {str(e)}")
        raise

if __name__ == "__main__":
    insert_mock_data()
