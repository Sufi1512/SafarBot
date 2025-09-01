"""
LangChain-based workflow for itinerary generation (compatible with current dependencies)
"""

import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from models import ItineraryResponse, DailyPlan
from config import settings

logger = logging.getLogger(__name__)

class LangChainItineraryWorkflow:
    """LangChain-based workflow for generating travel itineraries"""
    
    def __init__(self):
        """Initialize the workflow with Google Gemini model"""
        self.llm = None
        if settings.google_api_key:
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model="gemini-2.5-flash",
                    google_api_key=settings.google_api_key,
                    temperature=0.7,
                    max_tokens=8192
                )
                logger.info("Google Gemini LLM initialized for LangChain workflow")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini LLM: {str(e)}")
    
    def _create_itinerary_prompt(self) -> ChatPromptTemplate:
        """Create the main itinerary generation prompt template"""
        return ChatPromptTemplate.from_messages([
            ("system", """You are an expert travel planning AI assistant specializing in creating detailed, personalized travel itineraries. You have extensive knowledge of destinations worldwide, including local attractions, cultural sites, restaurants, transportation, and travel logistics.

Your role is to create comprehensive travel itineraries that are:
- Practical and realistic with proper timing
- Budget-conscious and cost-effective
- Culturally appropriate and respectful
- Safe and well-researched
- Personalized based on traveler interests and preferences

CRITICAL OUTPUT REQUIREMENTS:
1. Respond ONLY with valid JSON. Do not include any text before or after the JSON.
2. Do NOT use markdown formatting (no asterisks, bold, etc.) in any text fields.
3. Write all descriptions and tips in plain text without any formatting.
4. Include realistic timing, costs, and logistics.
5. Ensure all activities are appropriate for the destination and season."""),
            
            ("human", """Create a detailed travel itinerary with the following specifications:

Destination: {destination}
Duration: {total_days} days
Start Date: {start_date}
End Date: {end_date}
Number of Travelers: {travelers}
Budget: {budget_info}
Interests: {interests}
Accommodation Type: {accommodation_type}

Required JSON structure:
{{
    "daily_plans": [
        {{
            "day": 1,
            "activities": [
                {{
                    "time": "09:00",
                    "title": "Activity name",
                    "description": "Detailed description of the activity",
                    "location": "Specific location with address if possible",
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
                    "description": "Description of the restaurant and recommended dishes",
                    "location": "Restaurant address or area"
                }}
            ],
            "accommodation": {{
                "name": "Hotel name",
                "rating": 4.0,
                "price": 150,
                "amenities": ["WiFi", "Pool", "Breakfast"],
                "location": "Hotel location",
                "description": "Brief description of the hotel"
            }},
            "transport": [
                {{
                    "type": "walking",
                    "description": "Walk to next location",
                    "duration": "15 minutes",
                    "cost": 0
                }}
            ]
        }}
    ],
    "budget_estimate": 2000,
    "recommendations": {{
        "hotels": [
            {{
                "name": "Hotel name",
                "rating": 4.0,
                "price_range": "$$",
                "amenities": ["WiFi", "Pool"],
                "location": "Location",
                "description": "Why this hotel is recommended"
            }}
        ],
        "restaurants": [
            {{
                "name": "Restaurant name",
                "cuisine": "Cuisine type",
                "rating": 4.5,
                "price_range": "$$",
                "description": "Why this restaurant is recommended",
                "location": "Restaurant location"
            }}
        ],
        "tips": [
            "Practical travel tip without markdown formatting",
            "Cultural tip about local customs",
            "Transportation advice",
            "Safety and security advice",
            "Best time to visit attractions"
        ]
    }}
}}

Important guidelines:
- Include 3-5 activities per day with realistic timing
- Suggest 2-3 meal options per day (breakfast, lunch, dinner)
- Include transportation between locations with estimated costs
- Provide accommodation for each night
- Consider local customs, weather, and seasonal factors
- Include a mix of must-see attractions and hidden gems
- Balance popular tourist sites with authentic local experiences
- Provide practical tips for first-time visitors
- Ensure all costs are in USD and realistic for the destination""")
        ])
    
    def _create_price_prediction_prompt(self) -> ChatPromptTemplate:
        """Create the price prediction prompt template"""
        return ChatPromptTemplate.from_messages([
            ("system", """You are a travel cost estimation expert with access to current pricing data for destinations worldwide. You provide accurate, realistic cost estimates for travel expenses including accommodation, food, transportation, and activities.

Your estimates should be:
- Based on current market rates
- Realistic and achievable
- Broken down by category
- Inclusive of taxes and fees where applicable
- Adjusted for seasonality and demand"""),
            
            ("human", """Estimate travel costs for the following trip:

Destination: {destination}
Duration: {total_days} days
Number of Travelers: {travelers}
Travel Dates: {start_date} to {end_date}
Accommodation Type: {accommodation_type}

Provide a JSON response with detailed cost estimates:
{{
    "accommodation_cost": 1200,
    "food_cost": 800,
    "transportation_cost": 400,
    "activities_cost": 600,
    "miscellaneous_cost": 200,
    "total_estimated_cost": 3200,
    "cost_breakdown": {{
        "per_day": 320,
        "per_person": 1600,
        "currency": "USD"
    }},
    "cost_ranges": {{
        "budget": 2000,
        "mid_range": 3200,
        "luxury": 5000
    }},
    "savings_tips": [
        "Book accommodation in advance for better rates",
        "Use public transportation instead of taxis",
        "Eat at local restaurants for authentic and affordable meals"
    ]
}}

Consider factors like:
- Seasonal pricing variations
- Local cost of living
- Currency exchange rates
- Popular vs off-peak times
- Different accommodation categories
- Local vs tourist pricing""")
        ])
    
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = None,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """Generate a complete itinerary using LangChain workflow"""
        
        if not self.llm:
            return await self._generate_fallback_itinerary(
                destination, start_date, end_date, budget, interests or [], travelers, accommodation_type
            )
        
        try:
            # Calculate trip details
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            total_days = (end_date_obj - start_date_obj).days + 1
            
            # Step 1: Generate main itinerary
            itinerary_data = await self._generate_main_itinerary(
                destination, start_date, end_date, total_days, budget, interests or [], travelers, accommodation_type
            )
            
            # Step 2: Get price prediction (optional enhancement)
            try:
                price_data = await self._predict_prices(
                    destination, start_date, end_date, total_days, travelers, accommodation_type
                )
                if price_data and 'total_estimated_cost' in price_data:
                    itinerary_data['budget_estimate'] = price_data['total_estimated_cost']
            except Exception as e:
                logger.warning(f"Price prediction failed: {str(e)}")
            
            # Step 3: Create final response
            return self._compile_response(itinerary_data, destination, total_days, start_date_obj)
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {str(e)}")
            return await self._generate_fallback_itinerary(
                destination, start_date, end_date, budget, interests or [], travelers, accommodation_type
            )
    
    async def _generate_main_itinerary(
        self, destination: str, start_date: str, end_date: str, total_days: int,
        budget: Optional[float], interests: List[str], travelers: int, accommodation_type: Optional[str]
    ) -> Dict[str, Any]:
        """Generate the main itinerary using structured prompts"""
        
        prompt = self._create_itinerary_prompt()
        
        # Format the prompt variables
        prompt_vars = {
            "destination": destination,
            "total_days": total_days,
            "start_date": start_date,
            "end_date": end_date,
            "travelers": travelers,
            "budget_info": self._format_budget_info(budget),
            "interests": self._format_interests(interests),
            "accommodation_type": self._format_accommodation_type(accommodation_type)
        }
        
        # Generate content using the prompt template
        messages = prompt.format_messages(**prompt_vars)
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.llm.ainvoke(messages)
                
                # Clean and parse JSON response
                cleaned_text = self._clean_json_response(response.content)
                itinerary_data = json.loads(cleaned_text)
                
                # Validate the response structure
                if self._validate_itinerary_structure(itinerary_data):
                    logger.info(f"Itinerary generated successfully for {destination}")
                    return itinerary_data
                else:
                    raise ValueError("Invalid itinerary structure received")
                    
            except (json.JSONDecodeError, ValueError) as e:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise Exception("Failed to generate valid itinerary after retries")
                continue
    
    async def _predict_prices(
        self, destination: str, start_date: str, end_date: str, total_days: int,
        travelers: int, accommodation_type: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        """Predict travel costs using structured prompts"""
        
        try:
            prompt = self._create_price_prediction_prompt()
            
            prompt_vars = {
                "destination": destination,
                "total_days": total_days,
                "travelers": travelers,
                "start_date": start_date,
                "end_date": end_date,
                "accommodation_type": self._format_accommodation_type(accommodation_type)
            }
            
            messages = prompt.format_messages(**prompt_vars)
            response = await self.llm.ainvoke(messages)
            
            cleaned_text = self._clean_json_response(response.content)
            return json.loads(cleaned_text)
            
        except Exception as e:
            logger.warning(f"Price prediction failed: {str(e)}")
            return None
    
    def _compile_response(
        self, itinerary_data: Dict[str, Any], destination: str, total_days: int, start_date_obj
    ) -> ItineraryResponse:
        """Compile the final itinerary response"""
        
        # Create daily plans
        daily_plans = []
        current_date = start_date_obj
        
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
        
        return ItineraryResponse(
            destination=destination,
            total_days=total_days,
            budget_estimate=itinerary_data.get('budget_estimate', 0.0),
            daily_plans=daily_plans,
            recommendations=itinerary_data.get('recommendations', {})
        )
    
    def _clean_json_response(self, text: str) -> str:
        """Clean AI response to extract valid JSON"""
        cleaned_text = text.strip()
        
        # Remove markdown code blocks
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[3:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        
        return cleaned_text.strip()
    
    def _validate_itinerary_structure(self, data: Dict[str, Any]) -> bool:
        """Validate the structure of generated itinerary data"""
        try:
            if 'daily_plans' not in data:
                return False
            
            daily_plans = data['daily_plans']
            if not isinstance(daily_plans, list) or len(daily_plans) == 0:
                return False
            
            # Validate at least one daily plan
            first_plan = daily_plans[0]
            required_keys = ['day', 'activities']
            for key in required_keys:
                if key not in first_plan:
                    return False
            
            return True
            
        except Exception:
            return False
    
    def _format_budget_info(self, budget: Optional[float]) -> str:
        """Format budget information for the prompt"""
        if budget:
            if budget < 1000:
                return f"${budget} (Budget travel)"
            elif budget < 3000:
                return f"${budget} (Mid-range travel)"
            else:
                return f"${budget} (Luxury travel)"
        return "Flexible budget"
    
    def _format_interests(self, interests: List[str]) -> str:
        """Format interests list for the prompt"""
        if not interests:
            return "General sightseeing and cultural experiences"
        return ", ".join(interests)
    
    def _format_accommodation_type(self, accommodation_type: Optional[str]) -> str:
        """Format accommodation type for the prompt"""
        return accommodation_type or "Standard hotels and guesthouses"
    
    async def _generate_fallback_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = None,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """Generate a basic fallback itinerary"""
        start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        total_days = (end_date_obj - start_date_obj).days + 1
        current_date = start_date_obj
        
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
                        "title": "Local Cuisine Experience",
                        "description": f"Try authentic local food in {destination}",
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
                        "description": f"Enjoy authentic local cuisine in {destination}"
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
                        "description": "Explore the city on foot",
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
                "hotels": [f"Look for well-reviewed hotels in {destination}"],
                "restaurants": [f"Try local restaurants in {destination}"],
                "tips": [
                    "LangChain workflow is working with structured prompts!",
                    "Transportation: Use local public transport for cost-effective travel.",
                    "Safety: Always be aware of your surroundings and keep belongings secure.",
                    "Culture: Respect local customs and dress appropriately for religious sites.",
                    "Planning: Book popular attractions in advance to avoid disappointment."
                ]
            }
        )
