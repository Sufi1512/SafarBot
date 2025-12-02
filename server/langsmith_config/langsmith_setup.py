"""
LangSmith Setup - Initialize tracing for AI operations.

LangSmith provides:
- Request/response logging for LLM calls
- Tool execution traces
- Performance metrics
- Debug information for AI workflows
"""

import os
import logging
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)


def setup_langsmith() -> bool:
    """
    Initialize LangSmith tracing.
    
    Sets environment variables required for LangChain tracing.
    Call this before importing any LangChain components.
    
    Returns:
        True if LangSmith was configured, False otherwise
    """
    try:
        api_key = settings.langsmith_api_key
        
        if not api_key:
            logger.info("LangSmith API key not found - tracing disabled")
            # Explicitly disable tracing
            os.environ.pop("LANGCHAIN_TRACING_V2", None)
            return False
        
        # Set LangSmith environment variables
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = api_key
        os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project or "safarbot"
        os.environ["LANGCHAIN_ENDPOINT"] = (
            settings.langsmith_endpoint or "https://api.smith.langchain.com"
        )
        
        # Also set LANGSMITH_ prefixed vars for compatibility
        os.environ["LANGSMITH_API_KEY"] = api_key
        os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project or "safarbot"
        
        logger.info(
            "LangSmith tracing enabled for project: %s",
            settings.langsmith_project or "safarbot"
        )
        return True
        
    except Exception as e:
        logger.warning("LangSmith setup failed (tracing disabled): %s", str(e))
        # Disable tracing if setup fails
        os.environ.pop("LANGCHAIN_TRACING_V2", None)
        return False


def get_langsmith_config() -> dict:
    """
    Get current LangSmith configuration.
    
    Returns:
        Dictionary with LangSmith settings and status
    """
    return {
        "enabled": bool(settings.langsmith_api_key),
        "project": settings.langsmith_project or "safarbot",
        "endpoint": settings.langsmith_endpoint or "https://api.smith.langchain.com",
        "api_key_configured": bool(settings.langsmith_api_key),
    }


def get_tracing_config() -> dict:
    """
    Get configuration dict for LangChain runnable calls.
    
    Use this when invoking LangChain runnables:
    ```python
    config = get_tracing_config()
    result = await chain.ainvoke(input, config=config)
    ```
    
    Returns:
        RunnableConfig dictionary for tracing
    """
    if not settings.langsmith_api_key:
        return {}
    
    return {
        "tags": ["safarbot"],
        "metadata": {
            "service": "safarbot",
            "version": "2.0.0"
        },
        "configurable": {
            "thread_id": "safarbot-main"
        }
    }
