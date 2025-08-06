import asyncio
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
import logging
from models import ItineraryResponse, DailyPlan
from config import settings
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

class ItineraryService:
    def __init__(self):
        # Initialize Google Gemini API
        if settings.google_api_key:
            try:
                genai.configure(api_key=settings.google_api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                logger.info("Google Gemini API initialized for itinerary generation")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini API: {str(e)}")
                self.model = None
        else:
            logger.warning("No Google API key provided")
            self.model = None
        
    async def generate_itinerary(
        self,
        destination: str,
        start_date: date,
        end_date: date,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Generate a personalized travel itinerary using AI
        """
        try:
            if not self.model:
                # Return a fallback itinerary when AI is not available
                logger.warning("AI service not configured, returning fallback itinerary")
                return await self._generate_fallback_itinerary(
                    destination, start_date, end_date, budget, interests, travelers, accommodation_type
                )
            
            # Calculate trip duration
            total_days = (end_date - start_date).days + 1
            
            # Create prompt for itinerary generation
            prompt = f"""
            You are a travel planning AI assistant. Create a detailed travel itinerary for {destination} for {total_days} days.
            
            Trip Details:
            - Destination: {destination}
            - Duration: {total_days} days
            - Travelers: {travelers}
            - Budget: ${budget if budget else 'Flexible'}
            - Interests: {', '.join(interests) if interests else 'General sightseeing'}
            - Accommodation: {accommodation_type if accommodation_type else 'Standard'}
            
            IMPORTANT: 
            1. Respond ONLY with valid JSON. Do not include any text before or after the JSON.
            2. Do NOT use markdown formatting (no asterisks, bold, etc.) in any text fields.
            3. Write tips in plain text without any formatting.
            
            Required JSON structure:
            {{
                "daily_plans": [
                    {{
                        "day": 1,
                        "activities": [
                            {{
                                "time": "09:00",
                                "title": "Activity name",
                                "description": "Description",
                                "location": "Location",
                                "duration": "2 hours",
                                "cost": 50,
                                "type": "sightseeing"
                            }}
                        ],
                        "meals": [
                            {{
                                "name": "Restaurant name",
                                "cuisine": "Cuisine type",
                                "rating": 4.5,
                                "price_range": "$$",
                                "description": "Description"
                            }}
                        ],
                        "accommodation": {{
                            "name": "Hotel name",
                            "rating": 4.0,
                            "price": 150,
                            "amenities": ["WiFi", "Pool"],
                            "location": "Location"
                        }},
                        "transport": [
                            {{
                                "type": "walking",
                                "description": "Walk to next location",
                                "duration": "15 minutes"
                            }}
                        ]
                    }}
                ],
                "budget_estimate": 2000,
                "recommendations": {{
                    "hotels": [],
                    "restaurants": [],
                    "tips": []
                }}
            }}
            
            Note: Write all tips in plain text without markdown formatting. For example:
            "Transportation: Use local trains for cost-effective travel. Auto-rickshaws are great for short distances."
            Instead of:
            "**Transportation:** Use local trains for cost-effective travel. Auto-rickshaws are great for short distances."
            """
            
            response = self.model.generate_content(prompt)
            
            # Check if response is valid
            if not response.text or response.text.strip() == "":
                raise Exception("AI service returned empty response")
            
            # Clean the response text - remove markdown code blocks if present
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]  # Remove ```json
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]  # Remove ```
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]  # Remove trailing ```
            
            cleaned_text = cleaned_text.strip()
            
            try:
                itinerary_data = json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {cleaned_text[:200]}...")
                raise Exception(f"Invalid JSON response from AI service: {str(e)}")
            
            # Create daily plans
            daily_plans = []
            current_date = start_date
            
            for day_num, day_data in enumerate(itinerary_data.get('daily_plans', []), 1):
                daily_plan = DailyPlan(
                    day=day_num,
                    date=current_date.strftime("%Y-%m-%d"),
                    activities=day_data.get('activities', []),
                    meals=day_data.get('meals', []),
                    accommodation=day_data.get('accommodation'),
                    transport=day_data.get('transport', [])
                )
                daily_plans.append(daily_plan)
                current_date += timedelta(days=1)
            
            # Create response
            response_obj = ItineraryResponse(
                destination=destination,
                total_days=total_days,
                budget_estimate=itinerary_data.get('budget_estimate', 0.0),
                daily_plans=daily_plans,
                recommendations=itinerary_data.get('recommendations', {})
            )
            
            return response_obj
            
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            
            # Check if it's a Google API error
            if "500 An internal error has occurred" in str(e):
                raise Exception("AI service is temporarily unavailable. Please try again in a few minutes.")
            elif "API key" in str(e).lower() or "authentication" in str(e).lower():
                raise Exception("AI service configuration error. Please contact support.")
            elif "quota" in str(e).lower() or "rate limit" in str(e).lower():
                raise Exception("AI service is currently busy. Please try again later.")
            else:
                raise Exception(f"Failed to generate itinerary: {str(e)}")
    
    async def predict_prices(
        self,
        destination: str,
        start_date: date,
        end_date: date,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Predict travel costs for the given destination and dates
        """
        try:
            if not self.model:
                raise Exception("AI service is not properly configured")
            
            total_days = (end_date - start_date).days + 1
            
            prompt = f"""
            Estimate travel costs for {destination} for {total_days} days with {travelers} travelers.
            
            Please provide a JSON response with cost estimates:
            {{
                "accommodation_cost": 1200,
                "food_cost": 800,
                "transportation_cost": 400,
                "activities_cost": 600,
                "total_estimated_cost": 3000,
                "cost_breakdown": {{
                    "per_day": 300,
                    "per_person": 1500
                }}
            }}
            """
            
            response = self.model.generate_content(prompt)
            
            # Clean the response text - remove markdown code blocks if present
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]  # Remove ```json
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]  # Remove ```
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]  # Remove trailing ```
            
            cleaned_text = cleaned_text.strip()
            
            try:
                price_prediction = json.loads(cleaned_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse price prediction JSON: {cleaned_text[:200]}...")
                raise Exception(f"Invalid JSON response from AI service: {str(e)}")
            
            return price_prediction
            
        except Exception as e:
            logger.error(f"Error predicting prices: {str(e)}")
            raise Exception(f"Failed to predict prices: {str(e)}")
    
    async def _generate_fallback_itinerary(
        self,
        destination: str,
        start_date: date,
        end_date: date,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Generate a basic fallback itinerary when AI service is unavailable
        """
        total_days = (end_date - start_date).days + 1
        current_date = start_date
        
        daily_plans = []
        for day_num in range(1, total_days + 1):
            daily_plan = DailyPlan(
                day=day_num,
                date=current_date.strftime("%Y-%m-%d"),
                activities=[
                    {
                        "time": "09:00",
                        "title": f"Explore {destination}",
                        "description": f"Discover the beautiful city of {destination}",
                        "location": destination,
                        "duration": "4 hours",
                        "cost": 20,
                        "type": "sightseeing"
                    },
                    {
                        "time": "14:00",
                        "title": "Local Cuisine",
                        "description": f"Try local food in {destination}",
                        "location": destination,
                        "duration": "2 hours",
                        "cost": 15,
                        "type": "food"
                    }
                ],
                meals=[
                    {
                        "name": f"Local Restaurant in {destination}",
                        "cuisine": "Local",
                        "rating": 4.0,
                        "price_range": "$$",
                        "description": f"Enjoy local cuisine in {destination}"
                    }
                ],
                accommodation={
                    "name": f"Hotel in {destination}",
                    "rating": 3.5,
                    "price": 80,
                    "amenities": ["WiFi", "Air Conditioning"],
                    "location": destination
                },
                transport=[
                    {
                        "type": "walking",
                        "description": "Explore on foot",
                        "duration": "30 minutes"
                    }
                ]
            )
            daily_plans.append(daily_plan)
            current_date += timedelta(days=1)
        
        return ItineraryResponse(
            destination=destination,
            total_days=total_days,
            budget_estimate=budget or 1000.0,
            daily_plans=daily_plans,
            recommendations={
                "hotels": [f"Look for hotels in {destination}"],
                "restaurants": [f"Try local restaurants in {destination}"],
                "tips": [
                    "AI service is temporarily unavailable. This is a basic itinerary.",
                    "Transportation: Use local public transport for cost-effective travel.",
                    "Safety: Always be aware of your surroundings and keep belongings secure.",
                    "Culture: Respect local customs and dress appropriately for religious sites."
                ]
            }
        ) 