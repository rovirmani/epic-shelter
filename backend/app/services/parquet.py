from typing import Optional
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import asyncio
from dataclasses import dataclass
from typing import Dict, List, Any
import os
import time

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
        enable_statistics: bool = True
    ):
        self.compression = compression
        self.row_group_size = row_group_size
        self.enable_statistics = enable_statistics

class ParquetService:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor()

    async def dataframe_to_parquet(
        self,
        df: pd.DataFrame,
        output_path: str,
        config: Optional[ParquetConfig] = None
    ) -> str:
        """
        Convert pandas DataFrame to Parquet format asynchronously
        
        Args:
            df: Input pandas DataFrame
            output_path: Where to save the Parquet file
            config: ParquetConfig object for customizing the conversion
            
        Returns:
            Path to the saved Parquet file
        """
        start_time = time.time()

        if config is None:
            config = ParquetConfig()

        # Convert DataFrame to PyArrow table in thread pool
        loop = asyncio.get_event_loop()
        conversion_start = time.time()
        table = await loop.run_in_executor(
            self.thread_pool,
            pa.Table.from_pandas,
            df
        )
        conversion_time = time.time() - conversion_start
        print(f"DataFrame to PyArrow conversion took: {conversion_time:.2f} seconds")

        # Write to Parquet file
        write_start = time.time()
        await loop.run_in_executor(
            self.thread_pool,
            self._write_parquet,
            table,
            output_path,
            config
        )
        write_time = time.time() - write_start
        print(f"Writing Parquet file took: {write_time:.2f} seconds")

        return output_path

    def _write_parquet(
        self,
        table: pa.Table,
        output_path: str,
        config: ParquetConfig
    ) -> None:
        """Write PyArrow table to Parquet file"""
        pq.write_table(
            table,
            output_path,
            compression=config.compression.value,
            row_group_size=config.row_group_size,
            write_statistics=config.enable_statistics
        )