"""
AirIQ Configuration - Environment variables and settings
"""
import os
import logging

logger = logging.getLogger(__name__)


class AirIQConfig:
    """AirIQ API Configuration"""
    
    def __init__(self):
        self.base_url = os.getenv("AIRIQ_URL", "").rstrip('/')
        self.agent_id = os.getenv("AIRIQ_AGENT_ID", "")
        self.username = os.getenv("AIRIQ_USERNAME", "")
        self.password = os.getenv("AIRIQ_PASSWORD", "")
        # Read token and strip whitespace (in case .env has spaces)
        self.access_token = os.getenv("AIR_IQ_ACCESS_TOKEN", "").strip()  # Token from .env file
        self.app_type = "API"
        self.version = 2.0
        
        # Validate configuration
        self.is_configured = all([
            self.base_url,
            self.agent_id,
            self.username,
            self.password
        ])
        
        if not self.is_configured:
            logger.warning(
                "AirIQ credentials not fully configured. "
                "Please set AIRIQ_URL, AIRIQ_AGENT_ID, AIRIQ_USERNAME, and AIRIQ_PASSWORD in environment variables."
            )
        else:
            logger.info("AirIQ configuration loaded successfully")
        
        # Log if token is available from .env
        if self.access_token:
            logger.info(f"AirIQ access token found in .env file (length: {len(self.access_token)}, preview: {self.access_token[:30]}...)")
    
    def get_auth_string(self) -> str:
        """Generate auth string: AgentID*Username:Password"""
        if not self.is_configured:
            raise ValueError("AirIQ credentials not configured")
        return f"{self.agent_id}*{self.username}:{self.password}"

