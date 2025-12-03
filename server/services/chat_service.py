import asyncio
from typing import Dict, Any, Optional
import logging
from fastapi import Request
from config import settings
from services.openai_service import openai_service
from mongo_models import AITaskType

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        # Use OpenAI service instead of Gemini
        self.ai_service = openai_service
        logger.info("Chat service initialized with OpenAI GPT-4")
        
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None
    ) -> str:
        """
        Get AI response for user message using OpenAI GPT-4
        """
        try:
            # Extract user info from request if available
            user_id = None
            user_email = None
            if request and hasattr(request.state, 'user_id'):
                user_id = request.state.user_id
            if request and hasattr(request.state, 'user_email'):
                user_email = request.state.user_email
            
            # Use OpenAI service for better responses
            return await self.ai_service.get_response(
                message, 
                context,
                request=request,
                api_endpoint="/chat",
                task_type=AITaskType.CHAT_RESPONSE,
                user_id=user_id,
                user_email=user_email
            )
            
        except Exception as e:
            logger.error(f"Error in chat service: {str(e)}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str,
        request: Optional[Request] = None
    ) -> str:
        """
        Get specific travel advice for a destination using OpenAI GPT-4
        """
        try:
            # Extract user info from request if available
            user_id = None
            user_email = None
            if request and hasattr(request.state, 'user_id'):
                user_id = request.state.user_id
            if request and hasattr(request.state, 'user_email'):
                user_email = request.state.user_email
            
            # Use OpenAI service for specialized travel advice
            return await self.ai_service.get_travel_advice(
                destination, 
                question,
                request=request,
                api_endpoint="/chat",
                user_id=user_id,
                user_email=user_email
            )
            
        except Exception as e:
            logger.error(f"Error getting travel advice: {str(e)}")
            return "I apologize, but I'm having trouble providing travel advice right now. Please try again later." 