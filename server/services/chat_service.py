import asyncio
from typing import Dict, Any, Optional
import logging
from config import settings
from services.openai_service import openai_service

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        # Use OpenAI service instead of Gemini
        self.ai_service = openai_service
        logger.info("Chat service initialized with OpenAI GPT-4")
        
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI response for user message using OpenAI GPT-4
        """
        try:
            # Use OpenAI service for better responses
            return await self.ai_service.get_response(message, context)
            
        except Exception as e:
            logger.error(f"Error in chat service: {str(e)}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str
    ) -> str:
        """
        Get specific travel advice for a destination using OpenAI GPT-4
        """
        try:
            # Use OpenAI service for specialized travel advice
            return await self.ai_service.get_travel_advice(destination, question)
            
        except Exception as e:
            logger.error(f"Error getting travel advice: {str(e)}")
            return "I apologize, but I'm having trouble providing travel advice right now. Please try again later." 