from typing import Any, Dict, List
import aiomysql
from app.connectors.base import SourceConnector
from app.core.config import settings

class SingleStoreConnector(SourceConnector):
    def __init__(self, config: Dict[str, Any]):
        self.host = config.get('host', settings.SINGLESTORE_HOST)
        self.port = int(config.get('port', settings.SINGLESTORE_PORT))
        self.user = config.get('username', settings.SINGLESTORE_USERNAME)
        self.password = config.get('password', settings.SINGLESTORE_PASSWORD)
        self.database = config.get('database', settings.SINGLESTORE_DATABASE)
        self.pool = None

    async def connect(self) -> None:
        self.pool = await aiomysql.create_pool(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            db=self.database,
            autocommit=True
        )

    async def disconnect(self) -> None:
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    async def test_connection(self) -> bool:
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT 1")
                    return True
        except Exception:
            return False

    async def get_schema(self) -> Dict[str, Any]:
        schema = {}
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = %s
                """, (self.database,))
                results = await cur.fetchall()
                
                for table, column, data_type in results:
                    if table not in schema:
                        schema[table] = {}
                    schema[table][column] = data_type
        
        return schema

    async def get_tables(self) -> List[str]:
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT TABLE_NAME
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_SCHEMA = %s
                """, (self.database,))
                results = await cur.fetchall()
                return [r[0] for r in results]

    async def read_data(self, query: str) -> List[Dict[str, Any]]:
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(query)
                return await cur.fetchall()
