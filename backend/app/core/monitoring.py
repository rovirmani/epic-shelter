import logging
import json
from datetime import datetime
from typing import Any, Dict
from functools import wraps
import time
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger("epic-shelter")

class MigrationMetrics:
    def __init__(self):
        self.metrics: Dict[str, Any] = {
            "total_migrations": 0,
            "successful_migrations": 0,
            "failed_migrations": 0,
            "total_rows_processed": 0,
            "average_throughput": 0,  # rows per second
        }
    
    def record_migration_start(self, migration_id: str):
        logger.info(f"Migration {migration_id} started")
        self.metrics["total_migrations"] += 1
    
    def record_migration_success(self, migration_id: str, rows_processed: int, duration_seconds: float):
        logger.info(f"Migration {migration_id} completed successfully")
        self.metrics["successful_migrations"] += 1
        self.metrics["total_rows_processed"] += rows_processed
        
        # Update average throughput
        current_throughput = rows_processed / duration_seconds
        self.metrics["average_throughput"] = (
            (self.metrics["average_throughput"] * (self.metrics["successful_migrations"] - 1) + current_throughput) /
            self.metrics["successful_migrations"]
        )
    
    def record_migration_failure(self, migration_id: str, error: str):
        logger.error(f"Migration {migration_id} failed: {error}")
        self.metrics["failed_migrations"] += 1
    
    def get_metrics(self) -> Dict[str, Any]:
        return self.metrics.copy()

# Global metrics instance
metrics = MigrationMetrics()

def log_step(step_name: str):
    """Decorator for logging migration steps"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            logger.info(f"Starting step: {step_name}")
            
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(f"Completed step: {step_name} in {duration:.2f}s")
                return result
            except Exception as e:
                logger.error(f"Error in step {step_name}: {str(e)}")
                raise
        
        return wrapper
    return decorator

async def monitor_migration_progress(migration_id: str, get_status_func):
    """
    Continuously monitor migration progress and log updates
    """
    while True:
        status = await get_status_func(migration_id)
        logger.info(f"Migration {migration_id} progress: {status.progress:.1%} - {status.current_step}")
        
        if status.status in ["completed", "failed"]:
            break
            
        await asyncio.sleep(5)  # Check every 5 seconds
