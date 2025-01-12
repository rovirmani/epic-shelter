from typing import Any, Dict, List
import aiomysql
import pandas as pd
import time

class SingleStoreConnector:
    def __init__(self, config: Dict[str, Any]):
        self.host = config.get('host')
        self.port = int(config.get('port'))
        self.user = config.get('username')
        self.password = config.get('password')
        self.database = config.get('database')
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

    async def get_tables(self) -> List[str]:
        """Get list of all tables in the database"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SHOW TABLES")
                    tables = await cur.fetchall()
                    return [table[0] for table in tables]
        except Exception as e:
            print(f"Error getting tables: {str(e)}")
            return []
        
    async def get_table_schema(self, table_name: str) -> Dict[str, str]:
        """Get schema information for a specific table"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(f"DESCRIBE {table_name}")
                    columns = await cur.fetchall()
                    schema = {}
                    for col in columns:
                        schema[col[0]] = col[1]
                    return schema
        except Exception as e:
            print(f"Error getting schema for table {table_name}: {str(e)}")
            return {}
        
    async def get_row_count(self, table_name: str) -> int:
        """Get the total number of rows in a specific table"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(f"SELECT COUNT(*) FROM {table_name}")
                    result = await cur.fetchone()
                    return result[0] if result else 0
        except Exception as e:
            print(f"Error getting row count for table {table_name}: {str(e)}")
            return 0
        
    async def get_primary_key_columns(self, table_name: str) -> List[str]:
        """Get primary key columns for a table"""
        try:
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(f"""
                        SELECT COLUMN_NAME 
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                        WHERE TABLE_SCHEMA = '{self.database}' 
                        AND TABLE_NAME = '{table_name}' 
                        AND CONSTRAINT_NAME = 'PRIMARY'
                        ORDER BY ORDINAL_POSITION
                    """)
                    columns = await cur.fetchall()
                    return [col[0] for col in columns]
        except Exception as e:
            print(f"Error getting primary key columns for table {table_name}: {str(e)}")
            return []

    async def read_table(self, table_name: str, interval: int, offset: int = 0) -> pd.DataFrame:
        """
        Read a portion of a table and return as a pandas DataFrame
        
        Args:
            table_name: Name of the table to read
            interval: Number of rows to read
            offset: Starting offset
            sort_column: Column to sort by if no primary key found (default: 'id')
            
        Returns:
            pandas DataFrame containing the query results
        """
        try:
            start_time = time.time()
            
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    # Get column names
                    await cur.execute(f"SELECT * FROM {table_name} LIMIT 0")
                    columns = [desc[0] for desc in cur.description]
                    
                    # Read data with consistent ordering
                    query = f"""
                        SELECT *
                        FROM {table_name}
                        LIMIT {interval}
                        OFFSET {offset}
                    """
                    query_start = time.time()
                    await cur.execute(query)
                    rows = await cur.fetchall()
                    query_time = time.time() - query_start
                    print(f"Query execution time: {query_time:.2f} seconds")
                    
                    # Create DataFrame directly from rows
                    df_start = time.time()
                    df = pd.DataFrame(rows, columns=columns)
                    df_time = time.time() - df_start
                    print(f"DataFrame conversion time: {df_time:.2f} seconds")
                    
                    total_time = time.time() - start_time
                    print(f"Total execution time: {total_time:.2f} seconds")
                    return df
        except Exception as e:
            print(f"Error reading table {table_name}: {str(e)}")
            return pd.DataFrame()  # Return empty DataFrame on error
        
    def map_to_parquet_type(self, singlestore_type: str) -> str:
        """Convert SingleStore data type to Parquet data type"""
        # Convert to lowercase for consistent matching
        singlestore_type = singlestore_type.lower()
        
        # Extract base type if there are parameters (e.g., varchar(255) -> varchar)
        base_type = singlestore_type.split('(')[0]
        
        # Mapping of SingleStore types to Parquet types
        type_mapping = {
            # Numeric types
            'tinyint': 'INT8',
            'smallint': 'INT16', 
            'mediumint': 'INT32',
            'int': 'INT32',
            'bigint': 'INT64',
            'float': 'FLOAT',
            'double': 'DOUBLE',
            'decimal': 'DECIMAL',
            
            # String types
            'char': 'STRING',
            'varchar': 'STRING',
            'text': 'STRING',
            'mediumtext': 'STRING',
            'longtext': 'STRING',
            
            # Binary types
            'binary': 'BINARY',
            'varbinary': 'BINARY',
            'blob': 'BINARY',
            
            # Date/Time types
            'date': 'DATE',
            'datetime': 'TIMESTAMP',
            'timestamp': 'TIMESTAMP',
            'time': 'TIME',
            
            # Boolean type
            'bool': 'BOOLEAN',
            'boolean': 'BOOLEAN'
        }
        
        return type_mapping.get(base_type, 'STRING')  # Default to STRING if type unknown