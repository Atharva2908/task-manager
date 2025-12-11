from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str
    DATABASE_NAME: str = "task_manager"
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # CORS - Changed to string to avoid JSON parsing
    CORS_ORIGINS: str = "http://localhost:3000"
    
    # Application
    APP_NAME: str = "Employee Task Manager API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
