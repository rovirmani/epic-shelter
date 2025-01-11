from typing import Any, Dict, List
import aiohttp
from app.connectors.base import DestinationConnector

class HydrolixConnector(DestinationConnector):
    def __init__(self, config: Dict[str, Any]):
        self.api_url = config['api_url']
        self.api_key = config['api_key']
        self.org_id = config['org_id']
        self.project_id = config['project_id']
        self.session = None

    async def connect(self) -> None:
        self.session = aiohttp.ClientSession(
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
        )

    async def disconnect(self) -> None:
        if self.session:
            await self.session.close()

    async def test_connection(self) -> bool:
        try:
            async with self.session.get(f"{self.api_url}/health") as response:
                return response.status == 200
        except Exception:
            return False

    async def get_schema(self) -> Dict[str, Any]:
        async with self.session.get(
            f"{self.api_url}/orgs/{self.org_id}/projects/{self.project_id}/tables"
        ) as response:
            if response.status == 200:
                tables = await response.json()
                schema = {}
                for table in tables:
                    async with self.session.get(
                        f"{self.api_url}/orgs/{self.org_id}/projects/{self.project_id}/tables/{table['name']}/schema"
                    ) as schema_response:
                        if schema_response.status == 200:
                            schema[table['name']] = await schema_response.json()
                return schema
            return {}

    async def create_table(self, table_name: str, schema: Dict[str, Any]) -> None:
        # Convert schema to Hydrolix format
        hydrolix_schema = {
            "name": table_name,
            "columns": [
                {"name": col_name, "type": self._map_type(col_type)}
                for col_name, col_type in schema.items()
            ]
        }
        
        async with self.session.post(
            f"{self.api_url}/orgs/{self.org_id}/projects/{self.project_id}/tables",
            json=hydrolix_schema
        ) as response:
            if response.status not in (200, 201):
                raise Exception(f"Failed to create table: {await response.text()}")

    async def write_data(self, data: List[Dict[str, Any]], table: str) -> int:
        # Hydrolix typically accepts data in chunks for better performance
        chunk_size = 1000
        total_rows = 0
        
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            async with self.session.post(
                f"{self.api_url}/orgs/{self.org_id}/projects/{self.project_id}/tables/{table}/data",
                json=chunk
            ) as response:
                if response.status == 200:
                    total_rows += len(chunk)
                else:
                    raise Exception(f"Failed to write data: {await response.text()}")
        
        return total_rows

    def _map_type(self, source_type: str) -> str:
        """Map source data types to Hydrolix data types"""
        type_mapping = {
            'int': 'INT64',
            'bigint': 'INT64',
            'varchar': 'STRING',
            'text': 'STRING',
            'float': 'FLOAT64',
            'double': 'FLOAT64',
            'datetime': 'TIMESTAMP',
            'boolean': 'BOOL'
        }
        return type_mapping.get(source_type.lower(), 'STRING')
