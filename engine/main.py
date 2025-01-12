import os
import threading
import uuid
from services.job import Job, JobService
from services.s3 import S3Service
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

async def main():
    job = Job(
        source_engine="singlestore",
        source_host=os.getenv("SINGLESTORE_HOST"),
        source_port=os.getenv("SINGLESTORE_PORT"),
        source_user=os.getenv("SINGLESTORE_USERNAME"),
        source_password=os.getenv("SINGLESTORE_PASSWORD"),
        source_database=os.getenv("SINGLESTORE_DATABASE"),
        source_table="eventsdata",
        dest_engine="singlestore",
        dest_host=os.getenv("SINGLESTORE_HOST"),
        dest_port=os.getenv("SINGLESTORE_PORT"),
        dest_user=os.getenv("SINGLESTORE_USERNAME"),
        dest_password=os.getenv("SINGLESTORE_PASSWORD"),
        dest_database=os.getenv("SINGLESTORE_DATABASE"),
        dest_table="eventsdata_copy",
        s3_bucket="gaucho-racing",
        s3_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        s3_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )

    job_service = JobService(job)
    await job_service.run_job()

if __name__ == "__main__":
    asyncio.run(main())