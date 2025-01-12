import logging
from typing import Optional, List
import pandas as pd
import numpy as np
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import os
import time
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

class ProcessingMode(Enum):
    DBSCAN = "dbscan"
    SEQUENTIAL = "sequential"


class ParquetService:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor()
        logging.basicConfig(level=logging.INFO)

    def dataframe_to_parquet(
        self, 
        df: pd.DataFrame, 
        output_path: str, 
        mode: ProcessingMode = ProcessingMode.DBSCAN, 
        batch_size: Optional[int] = None,
    ) -> List[str]:
        """
        Convert pandas DataFrame to Parquet files based on selected processing mode.
        """
        start_time = time.time()
        output_files = []

        try:
            if mode == ProcessingMode.DBSCAN:
                output_files = self._process_with_dbscan(df, output_path, 0.5, 10000)
            elif mode == ProcessingMode.SEQUENTIAL:
                output_files = self._process_in_batches(df, output_path, batch_size)
            else:
                raise ValueError(f"Unknown processing mode: {mode}")
        except Exception as e:
            logging.error(f"Error occurred during processing: {e}")
            if mode == ProcessingMode.DBSCAN:
                logging.info("Falling back to SEQUENTIAL mode.")
                output_files = self._process_in_batches(df, output_path, batch_size)

        total_time = time.time() - start_time
        logging.info(f"Total processing time: {total_time:.2f} seconds")
        
        return output_files

    def _process_in_batches(
        self,
        df: pd.DataFrame,
        output_path: str,
        batch_size: Optional[int] = None
    ) -> List[str]:
        """
        Convert pandas DataFrame to multiple Parquet files if batch_size is specified.
        """
        start_time = time.time()

        output_files = []

        if batch_size:
            num_chunks = (len(df) + batch_size - 1) // batch_size
            logging.info(f"Splitting into {num_chunks} chunks.")

            for i in range(num_chunks):
                chunk_start = i * batch_size
                chunk_end = min((i + 1) * batch_size, len(df))
                df_chunk = df.iloc[chunk_start:chunk_end]

                chunk_path = self._generate_output_filename(output_path, i)
                
                df_chunk.to_parquet(chunk_path)
                output_files.append(chunk_path)
                
                logging.info(f"Wrote chunk {i + 1}/{num_chunks} to {chunk_path}")
        else:
            df.to_parquet(output_path)
            output_files.append(output_path)
            logging.info(f"Wrote entire DataFrame to {output_path}")

        total_time = time.time() - start_time
        logging.info(f"Total processing time for batches: {total_time:.2f} seconds")
        
        return output_files    
    
    def _process_with_dbscan(
        self, 
        df: pd.DataFrame, 
        output_path: str, 
        epsilon: float, 
        min_samples: int
    ) -> List[str]:
        """Process DataFrame using DBSCAN clustering and save to Parquet."""
        output_files = []
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        if numeric_columns.empty:
            raise ValueError("No numeric columns available for DBSCAN processing. Falling back to SEQUENTIAL mode.")
        
        df_numeric = df[numeric_columns].copy()
        
        # Standardize the data
        df_scaled = self._scale_data(df_numeric)
        
        # Reduce dimensionality using PCA
        df_pca = self._apply_pca(df_scaled)
        
        # Apply DBSCAN clustering
        clusters = self._apply_dbscan(df_pca, epsilon, min_samples)

        if len(set(clusters)) <= 1:  # All noise or one single cluster
            raise ValueError("DBSCAN produced no meaningful clusters. Falling back to SEQUENTIAL mode.")
        
        df['cluster'] = clusters
        
        # Process and save each cluster
        output_files = self._save_clusters(df, output_path)
        
        return output_files

    def _scale_data(self, df_numeric: pd.DataFrame) -> pd.DataFrame:
        """Scale numeric data using StandardScaler."""
        scaler = StandardScaler()
        return pd.DataFrame(scaler.fit_transform(df_numeric), columns=df_numeric.columns)

    def _apply_pca(self, df_scaled: pd.DataFrame) -> pd.DataFrame:
        """Apply PCA for dimensionality reduction."""
        pca = PCA(n_components=0.95)  # Preserve 95% of variance
        return pd.DataFrame(pca.fit_transform(df_scaled))

    def _apply_dbscan(self, df_pca: pd.DataFrame, epsilon: float, min_samples: int) -> np.ndarray:
        """Apply DBSCAN clustering."""
        dbscan = DBSCAN(eps=epsilon, min_samples=min_samples)
        return dbscan.fit_predict(df_pca)

    def _save_clusters(self, df: pd.DataFrame, output_path: str) -> List[str]:
        """Save each cluster to a separate Parquet file."""
        output_files = []

        for cluster in set(df['cluster']):
            cluster_name = "noise" if cluster == -1 else f"cluster_{cluster}"
            cluster_df = df[df['cluster'] == cluster]
            
            output_file = self._generate_output_filename(output_path, cluster_name)
            cluster_df.to_parquet(output_file, index=False)
            
            output_files.append(output_file)
            logging.info(f"Saved {cluster_name} to {output_file}")
        
        return output_files

    def _generate_output_filename(self, base_path: str, suffix: str) -> str:
        """Generate a new filename with a suffix."""
        file_name, file_ext = os.path.splitext(base_path)
        return f"{file_name}_{suffix}{file_ext}"
