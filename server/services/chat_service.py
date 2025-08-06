import asyncio
from typing import Dict, Any, Optional
import logging
from config import settings
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        # Initialize Google Gemini API
        if settings.google_api_key:
            try:
                genai.configure(api_key=settings.google_api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("Google Gemini API initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini API: {str(e)}")
                self.model = None
        else:
            logger.warning("No Google API key provided")
            self.model = None
        
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI response for user message
        """
        try:
            if not self.model:
                return "I apologize, but the AI service is not properly configured. Please check the API configuration."
            
            # Create a travel-focused prompt
            travel_prompt = f"""
            You are a helpful AI travel assistant. Please provide helpful travel advice and recommendations.
            
            User message: {message}
            
            Context: {context or 'No specific context provided'}
            
            Please provide a helpful, informative response about travel planning, destinations, or travel-related questions.
            """
            
            response = self.model.generate_content(travel_prompt)
            return response.text
            
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
            if not self.model:
                return "I apologize, but the AI service is not properly configured. Please check the API configuration."
            
            advice_prompt = f"""
            Please provide specific travel advice for {destination}.
            
            Question: {question}
            
            Please include:
            - Practical tips for visiting {destination}
            - Recommendations based on the question
            - Safety considerations
            - Best times to visit
            """
            
            response = self.model.generate_content(advice_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error getting travel advice: {str(e)}")
            return "I apologize, but I'm having trouble providing travel advice right now. Please try again later." 