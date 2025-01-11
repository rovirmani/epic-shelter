from typing import Any, Dict, List, Optional
import aiohttp
import json
from datetime import datetime
from app.connectors.base import DestinationConnector

class HydrolixConnector(DestinationConnector):
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Hydrolix connector with configuration
        
        Required config:
        - api_url: Hydrolix API endpoint (e.g., 'https://api.hydrolix.io')
        - project_id: Hydrolix project ID
        - token: Authentication token
        - org_id: Organization ID
        """
        self.api_url = config['api_url'].rstrip('/')
        self.project_id = config['project_id']
        self.token = config['token']
        self.org_id = config['org_id']
        self.session = None

    async def connect(self) -> None:
        """Establish connection to Hydrolix"""
        self.session = aiohttp.ClientSession(
            headers={
                'Authorization': f'Bearer {self.token}',
                'Content-Type': 'application/json'
            }
        )

    async def disconnect(self) -> None:
        """Close the connection"""
        if self.session:
            await self.session.close()

    async def test_connection(self) -> bool:
        """Test if the connection is valid"""
        try:
            # Try to list tables to verify credentials
            url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables"
            async with self.session.get(url) as response:
                return response.status == 200
        except Exception:
            return False

    async def get_schema(self) -> Dict[str, Any]:
        """Get schema information from Hydrolix"""
        url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables"
        async with self.session.get(url) as response:
            if response.status == 200:
                tables = await response.json()
                schema = {}
                for table in tables:
                    table_url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables/{table['name']}"
                    async with self.session.get(table_url) as table_response:
                        if table_response.status == 200:
                            table_info = await table_response.json()
                            schema[table['name']] = table_info['schema']
                return schema
            return {}

    async def create_table(self, table_name: str, schema: Dict[str, Any]) -> None:
        """
        Create a table in Hydrolix
        
        Schema should be in Hydrolix format:
        {
            "columns": [
                {"name": "timestamp", "type": "TIMESTAMP", "primary": true},
                {"name": "user_id", "type": "STRING"},
                {"name": "value", "type": "DOUBLE"}
            ],
            "settings": {
                "primary_key": ["timestamp"],
                "partition_by": ["timestamp"]
            }
        }
        """
        url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables"
        
        payload = {
            "name": table_name,
            "schema": schema,
            "transform": {
                "type": "raw"  # No transformation on ingestion
            }
        }

        async with self.session.post(url, json=payload) as response:
            if response.status not in (200, 201):
                raise Exception(f"Failed to create table: {await response.text()}")

    async def write_data(self, parquet_path: str, table: str) -> int:
        """
        Write data to Hydrolix using their streaming ingest API
        
        Args:
            parquet_path: Path to Parquet files
            table: Target table name
        """
        # Get pre-signed URL for data upload
        upload_url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables/{table}/upload"
        async with self.session.post(upload_url) as response:
            if response.status != 200:
                raise Exception(f"Failed to get upload URL: {await response.text()}")
            upload_info = await response.json()

        # Upload Parquet files to the pre-signed URL
        # Note: In practice, you might want to use a cloud storage SDK for this
        async with aiohttp.ClientSession() as upload_session:
            async with upload_session.put(
                upload_info['url'],
                data=open(parquet_path, 'rb'),
                headers={'Content-Type': 'application/octet-stream'}
            ) as upload_response:
                if upload_response.status != 200:
                    raise Exception(f"Failed to upload data: {await upload_response.text()}")

        # Trigger ingestion
        ingest_url = f"{self.api_url}/v1/orgs/{self.org_id}/projects/{self.project_id}/tables/{table}/ingest"
        payload = {
            "source": upload_info['url'],
            "format": "parquet"
        }
        
        async with self.session.post(ingest_url, json=payload) as response:
            if response.status != 200:
                raise Exception(f"Failed to start ingestion: {await response.text()}")
            ingest_job = await response.json()
            
            # Return the number of rows ingested (if available)
            return ingest_job.get('rows_ingested', 0)
