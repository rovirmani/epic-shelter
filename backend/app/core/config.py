from typing import List
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Epic Shelter"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Data Migration Service API"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000"   # Alternative frontend port
    ]
    
    # SingleStore Configuration
    SINGLESTORE_HOST: str
    SINGLESTORE_PORT: str
    SINGLESTORE_USERNAME: str
    SINGLESTORE_PASSWORD: str
    SINGLESTORE_DATABASE: str
    
    @property
    def SINGLESTORE_URL(self) -> str:
        return f"mysql+pymysql://{self.SINGLESTORE_USERNAME}:{self.SINGLESTORE_PASSWORD}@{self.SINGLESTORE_HOST}:{self.SINGLESTORE_PORT}/{self.SINGLESTORE_DATABASE}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
