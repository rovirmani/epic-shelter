from abc import ABC, abstractmethod
from typing import Any, Dict, List

class DataConnector(ABC):
    """Base class for all data connectors"""
    
    @abstractmethod
    async def connect(self) -> None:
        """Establish connection to the data source/destination"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close the connection"""
        pass
    
    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if the connection is valid"""
        pass
    
    @abstractmethod
    async def get_schema(self) -> Dict[str, Any]:
        """Get the schema information"""
        pass

class SourceConnector(DataConnector):
    """Base class for source connectors"""
    
    @abstractmethod
    async def read_data(self, query: str) -> List[Dict[str, Any]]:
        """Read data from the source"""
        pass
    
    @abstractmethod
    async def get_tables(self) -> List[str]:
        """Get list of available tables"""
        pass

class DestinationConnector(DataConnector):
    """Base class for destination connectors"""
    
    @abstractmethod
    async def write_data(self, data: List[Dict[str, Any]], table: str) -> int:
        """Write data to the destination"""
        pass
    
    @abstractmethod
    async def create_table(self, table_name: str, schema: Dict[str, Any]) -> None:
        """Create a table in the destination"""
        pass
