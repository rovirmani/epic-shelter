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
        enable_statistics: bool = True,
    ):
        self.compression = compression
        self.row_group_size = row_group_size
        self.enable_statistics = enable_statistics

class ParquetService:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor()

    def dataframe_to_parquet(
        self,
        df: pd.DataFrame,
        output_path: str,
        chunk_size: Optional[int] = None
    ) -> List[str]:
        """
        Convert pandas DataFrame to multiple Parquet files if chunk_size is specified
        
        Args:
            df: Input pandas DataFrame
            output_path: Base path for saving the Parquet file(s)
            chunk_size: Optional chunk size for splitting the DataFrame
            
        Returns:
            List of paths to the saved Parquet files
        """
        start_time = time.time()
        config = ParquetConfig()

        output_files = []

        # If chunk_size is specified, split into multiple files
        if chunk_size:
            num_chunks = (len(df) + chunk_size - 1) // chunk_size
            
            for i in range(num_chunks):
                chunk_start = i * chunk_size
                chunk_end = min((i + 1) * chunk_size, len(df))
                df_chunk = df.iloc[chunk_start:chunk_end]
                
                # Generate chunk filename
                file_name, file_ext = os.path.splitext(output_path)
                chunk_path = f"{file_name}_{i}{file_ext}"
                
                # Convert chunk to PyArrow and write
                table = pa.Table.from_pandas(df_chunk)
                self._write_parquet(table, chunk_path, config)
                output_files.append(chunk_path)
                
                print(f"Wrote chunk {i+1}/{num_chunks} to {chunk_path}")
        else:
            # Original behavior for single file
            table = pa.Table.from_pandas(df)
            self._write_parquet(table, output_path, config)
            output_files.append(output_path)

        total_time = time.time() - start_time
        print(f"Total processing time: {total_time:.2f} seconds")
        
        return output_files

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