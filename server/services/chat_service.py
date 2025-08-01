import asyncio
from typing import Dict, Any, Optional
import logging
from ..config import settings
import sys
import os

# Add langchain_core to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'langchain_core'))
from chat_bot import ChatBot

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.chat_bot = ChatBot()
        
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI response for user message
        """
        try:
            response = await self.chat_bot.get_response(
                message=message,
                context=context
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in chat service: {str(e)}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str
    ) -> str:
        """
        Get specific travel advice for a destination
        """
        try:
            advice = await self.chat_bot.get_travel_advice(
                destination=destination,
                question=question
            )
            
            return advice
            
        except Exception as e:
            logger.error(f"Error getting travel advice: {str(e)}")
            return "I apologize, but I'm having trouble providing travel advice right now. Please try again later." 