from pydantic_settings import BaseSettings
import os
from functools import lru_cache

class Settings(BaseSettings):
    # SingleStore Settings with default values
    SINGLESTORE_HOST: str = os.getenv("SINGLESTORE_HOST", "localhost")
    SINGLESTORE_PORT: int = int(os.getenv("SINGLESTORE_PORT", "3306"))
    SINGLESTORE_USERNAME: str = os.getenv("SINGLESTORE_USERNAME", "root")
    SINGLESTORE_PASSWORD: str = os.getenv("SINGLESTORE_PASSWORD", "")
    SINGLESTORE_DATABASE: str = os.getenv("SINGLESTORE_DATABASE", "epic_shelter")

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
