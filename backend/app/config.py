from pydantic_settings import BaseSettings
from typing import Optional, List
import os


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "task_manager"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS - This will automatically parse comma-separated values
    CORS_ORIGINS: List[str]
    
    # Application
    APP_NAME: str = "Employee Task Manager API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # This tells Pydantic to split comma-separated strings into lists
        env_prefix = ""
        
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v


# Custom initialization with proper handling
class ConfigSettings(Settings):
    def __init__(self, **kwargs):
        # Handle CORS_ORIGINS specially
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        if cors_origins and isinstance(cors_origins, str):
            kwargs["CORS_ORIGINS"] = [origin.strip() for origin in cors_origins.split(",")]
        
        super().__init__(**kwargs)


settings = ConfigSettings()
