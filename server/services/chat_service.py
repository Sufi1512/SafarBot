"""
Chat Service - AI-powered travel assistant using Gemini.

Provides conversational travel assistance using the same AI model
as the itinerary generation workflow for consistency.
"""

import logging
from typing import Dict, Any, Optional

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from config import settings

logger = logging.getLogger(__name__)

# Travel assistant system prompt
TRAVEL_ASSISTANT_PROMPT = """You are SafarBot, an expert AI travel assistant. You help users with:

- Destination recommendations and information
- Travel planning and logistics
- Local customs and cultural insights
- Budget planning and cost estimates
- Weather and best times to visit
- Visa and documentation requirements
- Transportation options
- Safety tips and health considerations
- Food and dining recommendations
- Activity and attraction suggestions

Be helpful, enthusiastic, and provide specific, actionable advice.
Keep responses concise but informative.
If you don't know something, say so and suggest how the user might find the information.
Always consider the user's budget, preferences, and travel style when giving advice."""


class ChatService:
    """Travel chat assistant powered by Google Gemini."""
    
    def __init__(self):
        self.model = None
        self._initialize_model()
        
    def _initialize_model(self):
        """Initialize the Gemini model."""
        try:
            if settings.google_api_key:
                self.model = ChatGoogleGenerativeAI(
                    model="gemini-2.0-flash-exp",
                    temperature=0.7,
                    max_output_tokens=1024,
                )
                logger.info("Chat service initialized with Gemini")
            else:
                logger.warning("Google API key not configured")
        except Exception as e:
            logger.error("Failed to initialize chat model: %s", str(e))
            self.model = None
    
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI response for user message.
        
        Args:
            message: User's message
            context: Optional context (current destination, preferences, etc.)
            
        Returns:
            AI-generated response
        """
        if not self.model:
            self._initialize_model()
            if not self.model:
                return (
                    "I apologize, but the AI service is currently unavailable. "
                    "Please try again later or contact support."
                )
        
        try:
            # Build system message with context
            system_content = TRAVEL_ASSISTANT_PROMPT
            
            if context:
                context_info = []
                if context.get("destination"):
                    context_info.append(f"Current destination: {context['destination']}")
                if context.get("budget"):
                    context_info.append(f"Budget: {context['budget']}")
                if context.get("dates"):
                    context_info.append(f"Travel dates: {context['dates']}")
                if context.get("interests"):
                    context_info.append(f"Interests: {', '.join(context['interests'])}")
                
                if context_info:
                    system_content += f"\n\nUser context:\n" + "\n".join(context_info)
            
            messages = [
                SystemMessage(content=system_content),
                HumanMessage(content=message)
            ]
            
            response = await self.model.ainvoke(messages)
            
            # Extract text from response
            if isinstance(response.content, str):
                return response.content
            elif isinstance(response.content, list):
                return "".join(
                    part.get("text", "") if isinstance(part, dict) else str(part)
                    for part in response.content
                )
            
            return str(response.content)
            
        except Exception as e:
            logger.error("Chat error: %s", str(e))
            return (
                "I apologize, but I'm having trouble processing your request. "
                "Please try again or rephrase your question."
            )
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str
    ) -> str:
        """
        Get specific travel advice for a destination.
        
        Args:
            destination: Travel destination
            question: Specific question about the destination
            
        Returns:
            Destination-specific advice
        """
        context = {"destination": destination}
        enhanced_message = f"Regarding {destination}: {question}"
        return await self.get_response(enhanced_message, context)
