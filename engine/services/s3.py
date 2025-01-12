import time
import boto3
from botocore.exceptions import ClientError
import logging

class S3Service:
    def __init__(self, bucket_name: str, credentials: dict = None):
        """Initialize S3 service with bucket name and optional credentials dict."""
        if credentials:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=credentials.get('aws_access_key_id'),
                aws_secret_access_key=credentials.get('aws_secret_access_key')
            )
        else:
            # Use environment variables or AWS CLI configuration
            self.s3_client = boto3.client('s3')
            
        self.bucket_name = bucket_name
        self.logger = logging.getLogger(__name__)

    def upload_file(self, file_path: str, s3_key: str) -> bool:
        """
        Upload a file to S3 bucket.
        
        Args:
            file_path (str): Local path to the file
            s3_key (str): Destination path in S3 bucket
            
        Returns:
            bool: True if file was uploaded successfully, False otherwise
        """
        try:
            start_time = time.time()
            self.s3_client.upload_file(file_path, self.bucket_name, s3_key)
            upload_time = time.time() - start_time
            self.logger.info(f"Successfully uploaded {file_path} to {self.bucket_name}/{s3_key} in {upload_time:.2f} seconds")
            return True
        except ClientError as e:
            self.logger.error(f"Failed to upload {file_path}: {str(e)}")
            return False

    def upload_parquet(self, parquet_path: str, s3_key: str = None) -> bool:
        """
        Upload a parquet file to S3 bucket.
        If s3_key is not provided, uses the filename from parquet_path.
        
        Args:
            parquet_path (str): Local path to the parquet file
            s3_key (str, optional): Destination path in S3 bucket
            
        Returns:
            bool: True if file was uploaded successfully, False otherwise
        """
        if s3_key is None:
            s3_key = parquet_path.split('/')[-1]
            
        if not parquet_path.endswith('.parquet'):
            self.logger.error(f"File {parquet_path} is not a parquet file")
            return False
            
        return self.upload_file(parquet_path, s3_key)
