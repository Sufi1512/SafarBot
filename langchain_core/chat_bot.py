import os
import asyncio
from typing import Dict, Any, Optional
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ChatBot:
    def __init__(self):
        self.llm = self._initialize_llm()
        self.conversation_history = []
        
    def _initialize_llm(self):
        """Initialize Google Gemini LLM"""
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        
        return genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Get AI response for user message"""
        try:
            # Create system message with travel context
            system_prompt = f"""You are SafarBot, an AI travel planning assistant. You help users with:

1. Travel planning and itinerary suggestions
2. Destination recommendations
3. Travel tips and advice
4. Budget planning
5. Cultural information
6. Safety tips
7. Booking guidance

Be friendly, helpful, and provide practical advice. If you don't know something specific, suggest where they can find more information.

Current context: {context or 'General travel planning'}

User message: {message}

Please provide a helpful response:"""
            
            # Get response from LLM
            response = await asyncio.to_thread(
                self.llm.generate_content, system_prompt
            )
            
            # Update conversation history
            self.conversation_history.append({"user": message, "bot": response.text})
            
            # Keep only last 10 messages to manage memory
            if len(self.conversation_history) > 10:
                self.conversation_history = self.conversation_history[-10:]
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error in chat bot: {str(e)}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str
    ) -> str:
        """Get specific travel advice for a destination"""
        try:
            prompt = f"""
You are a travel expert specializing in {destination}. 

Question: {question}

Provide detailed, practical advice including:
- Specific recommendations
- Local tips
- Safety considerations
- Cultural insights
- Budget-friendly options
- Best times to visit
- Must-see attractions

Make your response helpful and actionable.
"""
            
            response = await asyncio.to_thread(
                self.llm.generate_content, prompt
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error getting travel advice: {str(e)}")
            return f"I apologize, but I'm having trouble providing advice for {destination} right now. Please try again later."
    
    async def get_destination_recommendations(
        self,
        interests: list,
        budget: Optional[float] = None,
        duration: Optional[int] = None
    ) -> str:
        """Get destination recommendations based on interests and constraints"""
        try:
            interests_text = ", ".join(interests) if interests else "general travel"
            budget_text = f" with a budget of ${budget}" if budget else ""
            duration_text = f" for {duration} days" if duration else ""
            
            prompt = f"""
Based on the following criteria, recommend 5-7 travel destinations:

Interests: {interests_text}
Budget: {budget_text}
Duration: {duration_text}

For each destination, provide:
1. Why it's a good match for the interests
2. Estimated cost range
3. Best time to visit
4. Top 3 attractions
5. Any special considerations

Make the recommendations diverse and practical.
"""
            
            response = await asyncio.to_thread(
                self.llm.generate_content, prompt
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error getting destination recommendations: {str(e)}")
            return "I apologize, but I'm having trouble providing destination recommendations right now. Please try again later."
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = [] 