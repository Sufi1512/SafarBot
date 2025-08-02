from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "SafarBot"
    
    # Google Gemini API
    google_api_key: Optional[str] = None
    
    # Google SERP API (for flight search)
    serp_api_key: Optional[str] = None
    
    # ChromaDB Configuration
    chroma_persist_directory: str = "./chroma_db"
    
    # CORS Origins
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback to environment variable if not set
        if not self.google_api_key:
            self.google_api_key = os.getenv("GOOGLE_API_KEY")
        if not self.serp_api_key:
            self.serp_api_key = os.getenv("SERP_API_KEY")

settings = Settings() 