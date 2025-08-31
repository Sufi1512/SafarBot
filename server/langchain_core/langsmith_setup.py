import os
import logging
from typing import Optional
from config import settings

logger = logging.getLogger(__name__)

def setup_langsmith():
    """
    Initialize LangSmith tracking
    """
    try:
        # Set LangSmith environment variables
        if settings.langsmith_api_key:
            os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
            os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
            os.environ["LANGSMITH_ENDPOINT"] = settings.langsmith_endpoint
            
            # Enable LangSmith tracing
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
            
            logger.info("LangSmith tracking initialized successfully")
            return True
        else:
            logger.warning("LangSmith API key not found. LangSmith tracking will be disabled.")
            return False
    except Exception as e:
        logger.error(f"Failed to initialize LangSmith: {str(e)}")
        return False

def get_langsmith_config() -> dict:
    """
    Get LangSmith configuration
    """
    return {
        "api_key": settings.langsmith_api_key,
        "project": settings.langsmith_project,
        "endpoint": settings.langsmith_endpoint,
        "enabled": bool(settings.langsmith_api_key)
    } 