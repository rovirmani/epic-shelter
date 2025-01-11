from typing import Any, Dict, List
import logging
from app.connectors.base import DestinationConnector

logger = logging.getLogger(__name__)

class DefaultConnector(DestinationConnector):
    """A default destination connector that logs operations instead of actually writing data"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        
    async def connect(self) -> None:
        """Simulate establishing a connection"""
        logger.info("DefaultConnector: Connecting...")
        
    async def disconnect(self) -> None:
        """Simulate closing the connection"""
        logger.info("DefaultConnector: Disconnecting...")
        
    async def test_connection(self) -> bool:
        """Always returns True as this is a mock connector"""
        logger.info("DefaultConnector: Testing connection...")
        return True
        
    async def get_schema(self) -> Dict[str, Any]:
        """Return an empty schema"""
        logger.info("DefaultConnector: Getting schema...")
        return {}
        
    async def write_data(self, data: List[Dict[str, Any]], table: str) -> int:
        """Log the data that would be written"""
        row_count = len(data)
        logger.info(f"DefaultConnector: Would write {row_count} rows to table {table}")
        return row_count
        
    async def create_table(self, table_name: str, schema: Dict[str, Any]) -> None:
        """Log the table creation request"""
        logger.info(f"DefaultConnector: Would create table {table_name} with schema: {schema}")
