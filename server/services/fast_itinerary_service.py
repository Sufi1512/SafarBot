"""
Fast Itinerary Service - AI-only generation without heavy pre-fetching
Returns AI-generated itinerary quickly without waiting for place data
"""

import logging
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from fastapi import HTTPException
from starlette.requests import Request
import google.generativeai as genai
from config import settings
from services.weather_service import weather_service
from utils.currency_utils import convert_currency_strings, convert_budget_estimate

logger = logging.getLogger(__name__)

class FastItineraryService:
    """Service that generates AI itinerary quickly without pre-fetching all places"""
    
    def __init__(self):
        """Initialize the fast itinerary service"""
        if not getattr(settings, 'google_api_key', None):
            raise ValueError("Google API key is required")
        
        genai.configure(api_key=settings.google_api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        print("⚡ FAST ITINERARY SERVICE - Initialized")
    
    async def generate_ai_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        budget_range: Optional[str] = None,
        interests: List[str] = [],
        travelers: int = 1,
        travel_companion: Optional[str] = None,
        trip_pace: Optional[str] = None,
        departure_city: Optional[str] = None,
        flight_class_preference: Optional[str] = None,
        hotel_rating_preference: Optional[str] = None,
        accommodation_type: Optional[str] = None,
        email: Optional[str] = None,
        dietary_preferences: List[str] = [],
        halal_preferences: Optional[str] = None,
        vegetarian_preferences: Optional[str] = None,
        request: Optional[Request] = None
    ) -> Dict[str, Any]:
        """
        Generate AI itinerary quickly without pre-fetching places data
        Returns only the AI-generated structure - place details can be fetched separately
        """
        
        print(f"\n⚡ FAST ITINERARY GENERATION - {destination}")
        print("="*80)
        
        try:
            await self._ensure_client_connected(request)

            # Calculate trip duration
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            total_days = (end - start).days + 1
            
            # Get weather data (lightweight, fast)
            weather_info = "Weather data unavailable - plan for various conditions"
            try:
                weather_data = await weather_service.get_current_weather(destination)
                if "error" not in weather_data:
                    current = weather_data.get("current", {})
                    location = weather_data.get("location", {})
                    temp = current.get("temperature", 0)
                    description = current.get("description", "unknown")
                    weather_info = f"Current weather in {location.get('city', destination)}: {temp}°C, {description}"
            except Exception as e:
                logger.warning(f"Failed to fetch weather: {str(e)}")
            await self._ensure_client_connected(request)
            
            # Create optimized prompt (no place data needed - AI will suggest general places)
            prompt = f"""You are an expert travel planner. Create a comprehensive {total_days}-day itinerary for {destination}.

DESTINATION: {destination}
DATES: {start_date} to {end_date} ({total_days} days)
TRAVELERS: {travel_companion or f'{travelers} people'}
BUDGET: {budget_range or f'${budget} USD' if budget else 'Flexible'}
TRIP PACE: {trip_pace or 'Balanced'}
INTERESTS: {', '.join(interests) if interests else 'General travel'}
ACCOMMODATION: {hotel_rating_preference or accommodation_type or 'Standard'}
DIETARY PREFERENCES: {', '.join(dietary_preferences) if dietary_preferences else 'No restrictions'}
WEATHER: {weather_info}

INSTRUCTIONS:
1. Create a realistic day-by-day itinerary
2. Day 1 MUST start with hotel check-in/arrival as the FIRST activity
3. Include 2-3 activities per day minimum (after check-in on Day 1)
4. Include 2-3 meals per day minimum
5. Day 1 MUST include dinner (meal_type: "dinner") after arrival
6. Last day MUST include dinner (meal_type: "dinner") before departure
7. Consider travel time between locations
8. Mix different types of activities (sightseeing, cultural, entertainment)
9. Respect budget constraints
10. Provide EXACTLY 10-12 travel tips (not fewer)
11. Use realistic place names and locations (you can suggest general area names)
12. Include transportation between locations

RESPONSE FORMAT: Return ONLY valid JSON with this structure:
{{
  "destination": "{destination}",
  "total_days": {total_days},
  "budget_estimate": {budget or 0},
  "accommodation_suggestions": [
    {{
      "name": "Hotel Name",
      "type": "hotel",
      "location": "Area Name",
      "price_range": "$100-150/night",
      "brief_description": "Short description"
    }}
  ],
  "daily_plans": [
    {{
      "day": 1,
      "date": "{start_date}",
      "theme": "Arrival & Hotel Check-in",
      "activities": [
        {{
          "time": "12:00",
          "title": "Hotel Check-in & Arrival",
          "description": "Check into hotel and settle in",
          "location": "Hotel Area",
          "duration": "1 hour",
          "estimated_cost": "$0",
          "type": "accommodation"
        }},
        {{
          "time": "14:00",
          "title": "Activity Name",
          "description": "Activity description",
          "location": "Area Name",
          "duration": "2 hours",
          "estimated_cost": "$25",
          "type": "sightseeing"
        }}
      ],
      "meals": [
        {{
          "time": "13:00",
          "meal_type": "lunch",
          "name": "Restaurant Name",
          "cuisine": "Local",
          "location": "Area Name",
          "price_range": "$15-25"
        }},
        {{
          "time": "19:00",
          "meal_type": "dinner",
          "name": "Evening Restaurant",
          "cuisine": "International",
          "location": "Area Name",
          "price_range": "$25-40"
        }}
      ],
      "transportation": [
        {{
          "from": "Airport",
          "to": "Hotel",
          "method": "taxi",
          "duration": "30 minutes",
          "cost": "$25"
        }},
        {{
          "from": "Hotel",
          "to": "First attraction",
          "method": "walking",
          "duration": "10 minutes",
          "cost": "$0"
        }}
      ]
    }}
  ],
  "travel_tips": [
    "Respect local customs and dress appropriately",
    "Use public transportation for cost-effective travel",
    "Book tickets for popular attractions online",
    "Carry cash for small vendors and markets",
    "Pack clothing suitable for weather conditions",
    "Reserve dining spots in advance for popular restaurants",
    "Use ride-hailing apps for convenient transport",
    "Learn basic local phrases for better interactions",
    "Check attraction hours to plan around closures",
    "Stay hydrated, especially in warm weather",
    "Keep copies of travel documents separate",
    "Plan outdoor activities for cooler parts of the day"
  ]
}}

Generate the itinerary now:"""

            print(f"   🤖 Generating AI itinerary (fast mode - no pre-fetching)")
            
            # Generate with AI
            await self._ensure_client_connected(request)
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON response
            itinerary_data = json.loads(response_text.strip())

            # Convert currency information to INR for consistency
            convert_currency_strings(itinerary_data)
            convert_budget_estimate(itinerary_data)

            # Add metadata
            itinerary_data['metadata'] = {
                'generation_mode': 'fast',
                'generation_timestamp': datetime.now().isoformat(),
                'place_details_available': False,
                'note': 'Place details can be fetched separately using /places/additional endpoint'
            }
            
            print(f"   ✅ AI itinerary generated in fast mode")
            print(f"   📊 Days: {itinerary_data.get('total_days', 0)}")
            print(f"   💰 Budget: ₹{itinerary_data.get('budget_estimate', 0)}")
            
            return itinerary_data
            
        except HTTPException:
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {str(e)}")
            print(f"   ❌ JSON parsing error: {str(e)}")
            raise Exception(f"Invalid response from AI service: {str(e)}")
        except Exception as e:
            logger.error(f"Error in fast itinerary generation: {str(e)}")
            print(f"   ❌ Error: {str(e)}")
            raise

    async def _ensure_client_connected(self, request: Optional[Request]) -> None:
        if request and await request.is_disconnected():
            logger.info("Client disconnected during fast itinerary generation")
            raise HTTPException(status_code=499, detail="Client disconnected")

