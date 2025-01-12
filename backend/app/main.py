import os
from app.connectors.singlestore import SingleStoreConnector
from app.services.parquet import ParquetService
import asyncio
from typing import List
import time
from datetime import datetime
from concurrent.futures import ProcessPoolExecutor
import multiprocessing


singlestore = SingleStoreConnector(
    {
        "host": settings.SINGLESTORE_HOST,
        "port": settings.SINGLESTORE_PORT,
        "username": settings.SINGLESTORE_USERNAME,
        "password": settings.SINGLESTORE_PASSWORD,
        "database": settings.SINGLESTORE_DATABASE
    }
)

# Move process_batch outside startup_event and make it a regular function
def process_batch(offset: int) -> int:
    batch_size = 100000
    batch_num = offset // batch_size
    print(f"Processing batch {batch_num} starting at offset {offset:,}")
    
    # Since we can't use async functions directly in processes,
    # we'll need to run synchronous operations
    data = singlestore.read_table(  # You'll need to create this method
        "eventsdata", 
        interval=batch_size,
        offset=offset,
        sort_column="user_id"
    )
    
    parquet_service = ParquetService()
    output_path = f"exports/eventsdata_batch_{batch_num}.parquet"
    parquet_service.dataframe_to_parquet(data, output_path)
    print(f"Batch {batch_num} saved to {output_path}")
    return len(data)

@app.on_event("startup")
async def startup_event():
    # Clear out exports directory before starting
    if os.path.exists("exports"):
        for file in os.listdir("exports"):
            file_path = os.path.join("exports", file)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
    else:
        os.makedirs("exports")

    
    start_time = time.time()
    total_rows_processed = 0
    
    print(f"Starting export at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    await singlestore.connect()
    connected = await singlestore.test_connection()
    if not connected:
        print("Failed to connect to SingleStore")
        return
    
    print("Connected to SingleStore")
    tables = await singlestore.get_tables()
    print(f"Found {len(tables)} tables: {tables}")

    table_name = "eventsdata"
    schema = await singlestore.get_table_schema(table_name)
    print(f"Schema for {table_name}: {schema}")
    
    row_count = await singlestore.get_row_count(table_name)
    print(f"Row count for {table_name}: {row_count:,}")

    batch_size = 100000
    parquet_service = ParquetService()
    
    # Determine number of processes based on CPU cores
    num_processes = multiprocessing.cpu_count()
    
    # Create process pool
    with ProcessPoolExecutor(max_workers=num_processes) as executor:
        futures = [
            executor.submit(process_batch, offset)
            for offset in range(0, row_count, batch_size)
        ]
        
        # Wait for all futures to complete
        results = [future.result() for future in futures]
        total_rows_processed = sum(results)

    end_time = time.time()
    elapsed_time = end_time - start_time
    rows_per_second = total_rows_processed / elapsed_time
    
    print("\n=== Export Summary ===")
    print(f"Total time: {elapsed_time:.2f} seconds")
    print(f"Total rows processed: {total_rows_processed:,}")
    print(f"Average processing speed: {rows_per_second:.2f} rows/second")
    print(f"Number of batches: {len(futures)}")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=====================")
