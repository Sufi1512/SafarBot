"""
OpenAI Service - GPT-4 powered AI responses
Superior AI responses compared to Google Gemini for travel planning
"""

import asyncio
import logging
import os
import time
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI
from config import settings
from fastapi import Request
from services.ai_tracking_service import ai_tracking_service
from mongo_models import AIProvider, AITaskType
import json

logger = logging.getLogger(__name__)

class OpenAIService:
    """OpenAI GPT-4 service for travel assistance and itinerary generation"""
    
    def __init__(self):
        self.client: Optional[AsyncOpenAI] = None
        self.model = "gpt-4-turbo-preview"  # Latest GPT-4 model
        self.vision_model = "gpt-4-vision-preview"  # For image analysis
        
    async def initialize(self):
        """Initialize OpenAI client"""
        try:
            api_key = getattr(settings, 'openai_api_key', None) or os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OpenAI API key not found")
                return False
                
            self.client = AsyncOpenAI(api_key=api_key)
            
            # Test the connection
            await self.client.models.list()
            logger.info("✅ OpenAI client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ OpenAI initialization failed: {str(e)}")
            self.client = None
            return False
    
    async def get_response(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1500,
        request: Optional[Request] = None,
        api_endpoint: str = "/chat",
        task_type: AITaskType = AITaskType.CHAT_RESPONSE,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None
    ) -> str:
        """
        Get AI response for user message with advanced prompting
        """
        if not self.client:
            await self.initialize()
            if not self.client:
                return "I apologize, but the AI service is not properly configured. Please check the API configuration."
        
        start_time = time.time()
        prompt_text = message
        response_text = ""
        success = True
        error_message = None
        
        try:
            # Default travel-focused system prompt
            default_system_prompt = """You are SafarBot, an expert travel assistant powered by advanced AI. You have comprehensive knowledge of:

- Global destinations, attractions, and hidden gems
- Cultural insights and local customs
- Weather patterns and best travel times
- Transportation options and logistics
- Accommodation recommendations
- Local cuisine and dining experiences
- Budget planning and cost optimization
- Travel safety and health considerations
- Visa requirements and travel documentation

Provide detailed, personalized, and actionable travel advice. Be enthusiastic but practical, and always consider the user's preferences, budget, and travel style."""

            # Prepare messages
            messages = [
                {
                    "role": "system", 
                    "content": system_prompt or default_system_prompt
                }
            ]
            
            # Add context if provided
            if context:
                context_message = f"Context: {json.dumps(context, indent=2)}"
                messages.append({
                    "role": "system",
                    "content": f"Additional context for this conversation:\n{context_message}"
                })
            
            # Add user message
            messages.append({
                "role": "user",
                "content": message
            })
            
            # Build full prompt for tracking
            full_prompt = "\n".join([msg["content"] for msg in messages])
            
            # Make API call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=0.9,
                frequency_penalty=0.1,
                presence_penalty=0.1
            )
            
            response_text = response.choices[0].message.content
            response_time_ms = (time.time() - start_time) * 1000
            
            # Extract token usage
            usage = response.usage
            prompt_tokens = usage.prompt_tokens if usage else 0
            completion_tokens = usage.completion_tokens if usage else 0
            
            # Log AI usage
            await ai_tracking_service.log_ai_usage(
                provider=AIProvider.OPENAI,
                model=self.model,
                task_type=task_type,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                prompt_text=full_prompt,
                response_text=response_text,
                api_endpoint=api_endpoint,
                http_method="POST",
                request=request,
                user_id=user_id,
                user_email=user_email,
                request_params={"message_length": len(message), "has_context": context is not None},
                response_metadata={"temperature": temperature, "max_tokens": max_tokens},
                success=True,
                response_time_ms=response_time_ms
            )
            
            return response_text
            
        except Exception as e:
            success = False
            error_message = str(e)
            response_time_ms = (time.time() - start_time) * 1000
            logger.error(f"OpenAI API error: {str(e)}")
            
            # Log failed request
            await ai_tracking_service.log_ai_usage(
                provider=AIProvider.OPENAI,
                model=self.model,
                task_type=task_type,
                prompt_tokens=0,
                completion_tokens=0,
                prompt_text=prompt_text,
                response_text="",
                api_endpoint=api_endpoint,
                http_method="POST",
                request=request,
                user_id=user_id,
                user_email=user_email,
                success=False,
                error_message=error_message,
                response_time_ms=response_time_ms
            )
            
            return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
    
    async def generate_itinerary(
        self,
        destination: str,
        duration_days: int,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travel_style: str = "balanced",
        travelers: int = 1,
        additional_context: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None,
        api_endpoint: str = "/itinerary/generate-itinerary-ai",
        user_id: Optional[str] = None,
        user_email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate detailed travel itinerary using GPT-4
        """
        try:
            # Structured prompt for itinerary generation
            itinerary_prompt = f"""Create a detailed {duration_days}-day travel itinerary for {destination}.

Requirements:
- Destination: {destination}
- Duration: {duration_days} days
- Travelers: {travelers} person(s)
- Budget: {f'${budget}' if budget else 'Flexible budget'}
- Interests: {', '.join(interests) if interests else 'General sightseeing'}
- Travel style: {travel_style}

Additional context: {json.dumps(additional_context, indent=2) if additional_context else 'None'}

Please provide a JSON response with the following structure:
{{
    "itinerary_title": "Engaging title for the trip",
    "destination_overview": "Brief overview of the destination",
    "best_time_to_visit": "Optimal timing and weather info",
    "estimated_budget": "Budget breakdown and estimates",
    "days": [
        {{
            "day": 1,
            "title": "Day theme/focus",
            "overview": "What to expect this day",
            "activities": [
                {{
                    "time": "09:00",
                    "activity": "Activity name",
                    "description": "Detailed description",
                    "location": "Specific location",
                    "duration": "2 hours",
                    "cost": "Estimated cost",
                    "tips": "Useful tips"
                }}
            ],
            "meals": [
                {{
                    "meal": "lunch",
                    "restaurant": "Restaurant name",
                    "cuisine": "Cuisine type",
                    "location": "Address/area",
                    "price_range": "$$",
                    "specialties": ["dish1", "dish2"]
                }}
            ],
            "accommodation": {{
                "type": "hotel/hostel/etc",
                "name": "Accommodation name",
                "area": "Neighborhood",
                "price_range": "$$",
                "amenities": ["wifi", "breakfast"]
            }},
            "transportation": {{
                "method": "walking/taxi/metro",
                "details": "Transportation tips",
                "estimated_cost": "$10"
            }},
            "estimated_daily_cost": 150
        }}
    ],
    "travel_tips": [
        "Important travel tips specific to this destination"
    ],
    "packing_suggestions": [
        "What to pack for this trip"
    ],
    "total_estimated_cost": 1000
}}

Make sure to:
1. Include specific, real places and attractions
2. Consider travel time between locations
3. Balance must-see attractions with local experiences
4. Include practical information (costs, timing, booking tips)
5. Adapt recommendations to the specified interests and travel style
6. Provide realistic cost estimates
7. Consider local customs and cultural aspects"""

            response = await self.get_response(
                itinerary_prompt,
                context=additional_context,
                temperature=0.3,  # Lower temperature for more consistent structure
                max_tokens=4000,
                request=request,
                api_endpoint=api_endpoint,
                task_type=AITaskType.ITINERARY_GENERATION,
                user_id=user_id,
                user_email=user_email
            )
            
            # Try to parse as JSON, fallback to structured text
            try:
                itinerary_data = json.loads(response)
                return {
                    "success": True,
                    "itinerary": itinerary_data,
                    "source": "OpenAI GPT-4"
                }
            except json.JSONDecodeError:
                # If JSON parsing fails, return as formatted text
                return {
                    "success": True,
                    "itinerary": {
                        "itinerary_title": f"{duration_days}-Day {destination} Adventure",
                        "content": response,
                        "format": "text"
                    },
                    "source": "OpenAI GPT-4"
                }
                
        except Exception as e:
            logger.error(f"Itinerary generation error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "source": "OpenAI GPT-4"
            }
    
    async def analyze_image(
        self,
        image_url: str,
        prompt: str = "What travel destination or activity does this image show?"
    ) -> str:
        """
        Analyze travel images using GPT-4 Vision
        """
        if not self.client:
            await self.initialize()
            if not self.client:
                return "Image analysis service is not available."
        
        try:
            response = await self.client.chat.completions.create(
                model=self.vision_model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {"url": image_url}
                            }
                        ]
                    }
                ],
                max_tokens=1000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Image analysis error: {str(e)}")
            return "I'm unable to analyze this image at the moment."
    
    async def get_travel_advice(
        self,
        destination: str,
        question: str,
        context: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None,
        api_endpoint: str = "/chat",
        user_id: Optional[str] = None,
        user_email: Optional[str] = None
    ) -> str:
        """
        Get specific travel advice for a destination
        """
        specialized_prompt = f"""You are a local travel expert for {destination}. Answer the following question with insider knowledge and practical advice:

Question: {question}

Provide specific, actionable advice including:
- Exact locations, names, and addresses when relevant
- Current pricing and timing information
- Local tips that tourists often miss
- Cultural considerations
- Safety or practical warnings if applicable
- Alternative options or backup plans

Context: {json.dumps(context, indent=2) if context else 'None'}"""

        return await self.get_response(
            specialized_prompt,
            context=context,
            temperature=0.4,  # Balanced creativity and accuracy
            request=request,
            api_endpoint=api_endpoint,
            task_type=AITaskType.TRAVEL_ADVICE,
            user_id=user_id,
            user_email=user_email
        )
    
    async def enhance_itinerary_description(
        self,
        itinerary_data: Dict[str, Any]
    ) -> str:
        """
        Create an engaging description for an existing itinerary
        """
        prompt = f"""Create an engaging, marketing-style description for this travel itinerary:

{json.dumps(itinerary_data, indent=2)}

Write a compelling 2-3 paragraph description that:
- Captures the essence and highlights of the trip
- Uses vivid, evocative language
- Mentions key experiences and destinations
- Appeals to potential travelers
- Maintains an enthusiastic but authentic tone

Focus on what makes this itinerary special and memorable."""

        return await self.get_response(
            prompt,
            temperature=0.8  # Higher creativity for marketing content
        )

# Global OpenAI service instance
openai_service = OpenAIService()

# Backward compatibility functions
async def get_ai_response(message: str, context: Optional[Dict[str, Any]] = None) -> str:
    """Backward compatible function"""
    return await openai_service.get_response(message, context)

async def generate_ai_itinerary(
    destination: str,
    duration_days: int,
    **kwargs
) -> Dict[str, Any]:
    """Backward compatible function"""
    return await openai_service.generate_itinerary(destination, duration_days, **kwargs)
