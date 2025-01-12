import os
import threading
from connectors.singlestore import SingleStoreConnector
from services.parquet import ParquetService
import asyncio
from typing import List
import time
from datetime import datetime
from concurrent.futures import ProcessPoolExecutor
import multiprocessing
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

singlestore = SingleStoreConnector(
    {
        "host": os.getenv("SINGLESTORE_HOST"),
        "port": os.getenv("SINGLESTORE_PORT"),
        "username": os.getenv("SINGLESTORE_USERNAME"), 
        "password": os.getenv("SINGLESTORE_PASSWORD"),
        "database": os.getenv("SINGLESTORE_DATABASE")
    }
)

batch_size = 500000

# Move process_batch outside startup_event and make it a regular function
async def process_batch(offset: int) -> int:
    # Create a new connector instance for each batch
    batch_singlestore = SingleStoreConnector(
        {
            "host": os.getenv("SINGLESTORE_HOST"),
            "port": os.getenv("SINGLESTORE_PORT"),
            "username": os.getenv("SINGLESTORE_USERNAME"), 
            "password": os.getenv("SINGLESTORE_PASSWORD"),
            "database": os.getenv("SINGLESTORE_DATABASE")
        }
    )
    await batch_singlestore.connect()
    
    batch_num = offset // batch_size
    print(f"Processing batch {batch_num} starting at offset {offset:,}")
    
    data = await batch_singlestore.read_table(
        "eventsdata", 
        interval=batch_size,
        offset=offset,
    )
    
    parquet_service = ParquetService()
    output_path = f"exports/eventsdata_batch_{batch_num}.parquet"
    await parquet_service.dataframe_to_parquet(data, output_path)
    await batch_singlestore.disconnect()
    print(f"Batch {batch_num} saved to {output_path}")
    return len(data)

def process_batch_sync(offset: int) -> int:
    return asyncio.run(process_batch(offset))

async def main():
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

    # Use a process pool to manage concurrent batch processing
    with ProcessPoolExecutor(max_workers=multiprocessing.cpu_count()) as executor:
        futures = [
            executor.submit(process_batch_sync, offset)
            for offset in range(0, row_count, batch_size)
        ]
        results = [future.result() for future in futures]
        total_rows_processed = sum(results)

    end_time = time.time()
    elapsed_time = end_time - start_time
    rows_per_second = row_count / elapsed_time
    
    print("\n=== Export Summary ===")
    print(f"Total time: {elapsed_time:.2f} seconds")
    print(f"Total rows processed: {row_count:,}")
    print(f"Average processing speed: {rows_per_second:.2f} rows/second")
    # print(f"Number of batches: {len(futures)}")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=====================")
    await singlestore.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
