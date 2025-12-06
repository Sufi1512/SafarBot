from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API Configuration
    # API prefix removed - endpoints now use clean paths without version prefix
    project_name: str = "SafarBot"
    usd_to_inr_rate: float = float(os.getenv("USD_TO_INR_RATE", 83.0))
    
    # Environment Mode
    local_dev: bool = os.getenv("LOCAL_DEV", "true").lower() in ("true", "1", "yes")
    
    # Google Gemini API (legacy)
    google_api_key: Optional[str] = None
    
    # OpenAI API (primary AI service)
    openai_api_key: Optional[str] = None
    
    # Redis Configuration
    redis_url: Optional[str] = None
    
    # Google SERP API (for flight search)
    serp_api_key: Optional[str] = None
    
    # OpenWeatherMap API
    open_weather_api_key: Optional[str] = None
    
    # Brevo API for email OTP
    brevo_api_key: Optional[str] = None
    
    # Email Configuration
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    from_email: str = "noreply@safarbot.com"
    app_url: str = os.getenv("APP_URL", "http://localhost:3000")
    
    # LangSmith Configuration
    langsmith_api_key: Optional[str] = None
    langsmith_project: str = "safarbot"
    langsmith_endpoint: str = "https://api.smith.langchain.com"
    
    # ChromaDB Configuration
    chroma_persist_directory: str = "./chroma_db"
    
    # CORS Origins
    cors_origins: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields not defined in the model

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback to environment variable if not set
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


    def validate_required_env_vars(self):
        """Validate that all required environment variables are set"""
        required_vars = [
            "OPENAI_API_KEY",  # Primary AI service
            "SERP_API_KEY", 
            "OPEN_WEATHER_API_KEY",
            "BREVO_API_KEY",
            "MONGODB_URL"
        ]
        # Optional: REDIS_URL, GOOGLE_API_KEY (legacy)
        missing = [var for var in required_vars if not os.getenv(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {missing}")
        return True

settings = Settings() 