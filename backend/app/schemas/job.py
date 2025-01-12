from pydantic import BaseModel, UUID4
from typing import Optional

class Job(BaseModel):
    migration_uuid: UUID4
    current_throughput: float
    average_throughput: float
    progress_percentage: float

    class Config:
        from_attributes = True

class JobChunk(BaseModel):
    migration_uuid: UUID4
    chunk_id: int
    is_completed: bool = False  # Track completion status for progress calculation

    class Config:
        from_attributes = True

# Helper function to calculate progress (can be used in your service layer)
def calculate_progress(completed_chunks: int, total_chunks: int) -> float:
    if total_chunks == 0:
        return 0.0
    return (completed_chunks / total_chunks) * 100.0
