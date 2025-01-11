from typing import List, Dict, Any, Optional
import pyarrow as pa
import pyarrow.parquet as pq
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
from enum import Enum

class CompressionType(str, Enum):
    NONE = "none"
    SNAPPY = "snappy"
    GZIP = "gzip"
    BROTLI = "brotli"
    LZ4 = "lz4"
    ZSTD = "zstd"

class ParquetConfig:
    def __init__(
        self,
        compression: CompressionType = CompressionType.SNAPPY,
        row_group_size: int = 100000,
        enable_statistics: bool = True,
        partition_cols: Optional[List[str]] = None,
        chunk_size: int = 100000,
    ):
        self.compression = compression
        self.row_group_size = row_group_size
        self.enable_statistics = enable_statistics
        self.partition_cols = partition_cols
        self.chunk_size = chunk_size

class ParquetService:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor()

    async def convert_to_parquet(
        self,
        data: List[Dict[str, Any]],
        schema: Dict[str, str],
        output_path: str,
        config: Optional[ParquetConfig] = None
    ) -> str:
        """
        Convert data to Parquet format asynchronously
        
        Args:
            data: List of dictionaries containing the data
            schema: Dictionary mapping column names to their types
            output_path: Where to save the Parquet file
            config: ParquetConfig object for customizing the conversion
        """
        if config is None:
            config = ParquetConfig()

        # Convert schema to PyArrow schema
        pa_fields = []
        for col_name, col_type in schema.items():
            pa_type = self._map_to_arrow_type(col_type)
            pa_fields.append(pa.field(col_name, pa_type))
        
        pa_schema = pa.schema(pa_fields)

        # Process data in chunks
        for i in range(0, len(data), config.chunk_size):
            chunk = data[i:i + config.chunk_size]
            
            # Convert to PyArrow table in a thread pool
            loop = asyncio.get_event_loop()
            table = await loop.run_in_executor(
                self.thread_pool,
                self._create_arrow_table,
                chunk,
                pa_schema
            )
            
            # Write to Parquet
            output_file = f"{output_path}/chunk_{i}.parquet"
            await loop.run_in_executor(
                self.thread_pool,
                self._write_parquet,
                table,
                output_file,
                config
            )

        return output_path

    def _map_to_arrow_type(self, sql_type: str) -> pa.DataType:
        """Map SQL types to PyArrow types"""
        type_mapping = {
            'int': pa.int64(),
            'bigint': pa.int64(),
            'varchar': pa.string(),
            'text': pa.string(),
            'float': pa.float64(),
            'double': pa.float64(),
            'datetime': pa.timestamp('us'),
            'boolean': pa.bool_(),
            'date': pa.date32(),
            'timestamp': pa.timestamp('us'),
            'decimal': pa.decimal128(38, 10),  # Configurable precision/scale
            'binary': pa.binary(),
            'array': pa.list_(pa.string()),  # Default to string array
            'json': pa.string()  # Store JSON as string
        }
        return type_mapping.get(sql_type.lower(), pa.string())

    def _create_arrow_table(self, data: List[Dict[str, Any]], schema: pa.Schema) -> pa.Table:
        """Create a PyArrow table from data"""
        arrays = []
        for field in schema:
            column_data = [row.get(field.name) for row in data]
            arrays.append(pa.array(column_data, type=field.type))
        
        return pa.Table.from_arrays(arrays, schema=schema)

    def _write_parquet(
        self,
        table: pa.Table,
        output_file: str,
        config: ParquetConfig
    ) -> None:
        """Write PyArrow table to Parquet file"""
        pq.write_table(
            table,
            output_file,
            compression=config.compression.value,
            row_group_size=config.row_group_size,
            write_statistics=config.enable_statistics,
            partition_cols=config.partition_cols
        )
