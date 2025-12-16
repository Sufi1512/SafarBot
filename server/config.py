"""
Application Configuration Settings
Manages environment variables and application settings
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Configuration
    project_name: str = "SafarBot"
    usd_to_inr_rate: float = float(os.getenv("USD_TO_INR_RATE", "83.0"))
    
    # Environment Mode
    local_dev: bool = os.getenv("LOCAL_DEV", "true").lower() in ("true", "1", "yes")
    
    # API Keys
    google_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    redis_url: Optional[str] = None
    serp_api_key: Optional[str] = None
    open_weather_api_key: Optional[str] = None
    brevo_api_key: Optional[str] = None
    langsmith_api_key: Optional[str] = None
    
    # Email Configuration
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: str = "noreply@safarbot.com"
    app_url: str = os.getenv("APP_URL", "http://localhost:3000")
    
    # LangSmith Configuration
    langsmith_project: str = "safarbot"
    langsmith_endpoint: str = "https://api.smith.langchain.com"
    
    # ChromaDB Configuration
    chroma_persist_directory: str = "./chroma_db"
    
    # CORS Origins
    cors_origins: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._load_env_fallbacks()

    def _load_env_fallbacks(self):
        """Load environment variables as fallbacks for optional settings"""
        if not self.google_api_key:
            self.google_api_key = os.getenv("GOOGLE_API_KEY")
        if not self.openai_api_key:
            self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if not self.redis_url:
            self.redis_url = os.getenv("REDIS_URL")
        if not self.serp_api_key:
            self.serp_api_key = os.getenv("SERP_API_KEY")
        if not self.open_weather_api_key:
            self.open_weather_api_key = (
                os.getenv("OPEN_WEATHER_API_KEY")
                or os.getenv("OPENWEATHER_API_KEY")
                or os.getenv("OPEN_WEATHERMAP_API_KEY")
                or os.getenv("WEATHER_API_KEY")
            )
        if self.open_weather_api_key == "":
            self.open_weather_api_key = None
        if not self.langsmith_api_key:
            self.langsmith_api_key = os.getenv("LANGSMITH_API_KEY")
        if not self.brevo_api_key:
            self.brevo_api_key = os.getenv("BREVO_API_KEY")

    def validate_required_env_vars(self) -> bool:
        """Validate that all required environment variables are set"""
        required_vars = [
            "OPENAI_API_KEY",
            "SERP_API_KEY",
            "OPEN_WEATHER_API_KEY",
            "BREVO_API_KEY",
            "MONGODB_URL"
        ]
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {missing}")
        return True


settings = Settings() 