from typing import Any, Dict, List
import aiomysql
import pandas as pd
import time

class SingleStoreConnector:
    def __init__(self, host: str, port: int, user: str, password: str, database: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
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
        
    async def write_table(self, table_name: str, df: pd.DataFrame) -> None:
        """
        Write a pandas DataFrame to a table in SingleStore
        
        Args:
            table_name: Name of the target table
            df: pandas DataFrame containing the data to write
            
        Raises:
            Exception: If there's an error during the write operation
        """
        if df.empty:
            print(f"Warning: Empty DataFrame provided for table {table_name}")
            return

        try:
            start_time = time.time()
            
            # Get column names and create placeholders for SQL query
            columns = df.columns.tolist()
            placeholders = ', '.join(['%s'] * len(columns))
            column_names = ', '.join(columns)
            
            # Prepare the insert query
            query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"
            
            # Convert DataFrame to list of tuples for batch insertion
            rows = df.to_records(index=False).tolist()
            
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    # Use executemany for batch insertion
                    await cur.executemany(query, rows)
                    
                    total_time = time.time() - start_time
                    print(f"Inserted {len(df)} rows into {table_name} in {total_time:.2f} seconds")
                    
        except Exception as e:
            print(f"Error writing to table {table_name}: {str(e)}")
            raise

    async def ingest_parquet(self, table_name: str, parquet_path: str, aws_access_key_id: str, aws_secret_access_key: str) -> None:
        """
        Ingest a parquet file into a table in SingleStore using a pipeline
        
        Args:
            table_name: Name of the target table
            parquet_path: S3 path in format 'bucket/prefix/path/*.parquet'
            
        Raises:
            Exception: If there's an error creating or testing the pipeline
        """
        try:
            pipeline_name = f"{table_name}_pipeline"
            
            # Get the table schema to map columns
            schema = await self.get_table_schema(table_name)
            if not schema:
                raise Exception(f"Could not get schema for table {table_name}")
            
            # Create column mappings for the pipeline
            column_mappings = []
            for column_name, column_type in schema.items():
                if 'timestamp' in column_type.lower():
                    # Handle timestamp columns specially
                    column_mappings.append(f"@{column_name} <- {column_name}")
                else:
                    column_mappings.append(f"{column_name} <- {column_name}")
            
            # Join column mappings with commas
            column_mapping_str = ",\n    ".join(column_mappings)
            
            # Create the pipeline query
            pipeline_query = f"""
            CREATE OR REPLACE PIPELINE {pipeline_name}
            AS LOAD DATA S3 '{parquet_path}'
            CONFIG '{{"region": "us-west-2"}}'
            CREDENTIALS '{{"aws_access_key_id": "{aws_access_key_id}", "aws_secret_access_key": "{aws_secret_access_key}"}}'
            INTO TABLE {table_name}
            FORMAT PARQUET
            (
                {column_mapping_str}
            )
            """
            
            # Add timestamp conversions if needed
            timestamp_sets = []
            for column_name, column_type in schema.items():
                if 'timestamp' in column_type.lower():
                    timestamp_sets.append(
                        f"{column_name} = FROM_UNIXTIME(@{column_name}/1000000)"
                    )
            
            if timestamp_sets:
                pipeline_query += f"\nSET {', '.join(timestamp_sets)};"
            else:
                pipeline_query += ";"

            print(f"Generated pipeline definition for {pipeline_name}")
            print(pipeline_query)
            
            start_time = time.time()
            async with self.pool.acquire() as conn:
                async with conn.cursor() as cur:
                    # Create the pipeline
                    await cur.execute(pipeline_query)
                    
                    # Test the pipeline
                    await cur.execute(f"START PIPELINE {pipeline_name} FOREGROUND")
                    
                    elapsed_time = time.time() - start_time
                    print(f"Successfully ingested in {elapsed_time:.2f} seconds")
                    
        except Exception as e:
            print(f"Error creating pipeline for table {table_name}: {str(e)}")
            raise