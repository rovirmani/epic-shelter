from app.connectors.singlestore import SingleStoreConnector
from app.services.parquet import ParquetService
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


singlestore = SingleStoreConnector(
    {
        "host": settings.SINGLESTORE_HOST,
        "port": settings.SINGLESTORE_PORT,
        "username": settings.SINGLESTORE_USERNAME,
        "password": settings.SINGLESTORE_PASSWORD,
        "database": settings.SINGLESTORE_DATABASE
    }
)

@app.on_event("startup")
async def startup_event():
    print("Starting up...")
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

    batch_size = 10000
    parquet_service = ParquetService()
    
    for offset in range(0, 100000, batch_size):
        print(f"Processing batch starting at offset {offset:,}")
        data = await singlestore.read_table(
            table_name, 
            interval=batch_size,
            offset=offset,
            sort_column="user_id"
        )
        
        # Use batch number in filename to prevent overwriting
        batch_num = offset // batch_size
        output_path = f"exports/eventsdata_batch_{batch_num}.parquet"
        await parquet_service.dataframe_to_parquet(data, output_path)
        print(f"Batch {batch_num} saved to {output_path}")

    print("All batches exported successfully")
