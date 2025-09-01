import asyncio
from datetime import date, timedelta, datetime
from typing import List, Dict, Any, Optional
import logging
from models import ItineraryResponse, DailyPlan
from config import settings
from workflows.optimized_prefetch_workflow import OptimizedPrefetchWorkflow
import json

logger = logging.getLogger(__name__)

class ItineraryService:
    def __init__(self):
        # Initialize structured workflow
        try:
            self.workflow = OptimizedPrefetchWorkflow()
            logger.info("Structured itinerary workflow initialized")
        except Exception as e:
            logger.warning(f"Failed to initialize itinerary workflow: {str(e)}")
            self.workflow = None
        
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a complete travel itinerary with pre-fetched place details using optimized workflow
        Returns: Complete response with itinerary, place_details, and additional_places
        """
        print("\n" + "="*80)
        print("🚀 ITINERARY SERVICE - STARTING GENERATION")
        print("="*80)
        print(f"📍 Destination: {destination}")
        print(f"📅 Dates: {start_date} to {end_date}")
        print(f"👥 Travelers: {travelers}")
        print(f"💰 Budget: ${budget if budget else 'Flexible'}")
        print(f"🎯 Interests: {', '.join(interests) if interests else 'General'}")
        print(f"🏨 Accommodation: {accommodation_type or 'Standard'}")
        print("-"*80)
        
        try:
            if not self.workflow:
                print("⚠️  WORKFLOW NOT CONFIGURED - Using fallback")
                logger.warning("LangGraph workflow not configured, returning fallback itinerary")
                return await self._generate_fallback_itinerary(
                    destination, start_date, end_date, budget, interests, travelers, accommodation_type
                )
            
            print("✅ OPTIMIZED WORKFLOW INITIALIZED - Starting complete generation")
            logger.info(f"Generating complete itinerary for {destination} using optimized workflow")
            
            response = await self.workflow.generate_complete_itinerary(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
                budget=budget,
                interests=interests,
                travelers=travelers,
                accommodation_type=accommodation_type
            )
            
            print("✅ COMPLETE ITINERARY GENERATION COMPLETED SUCCESSFULLY")
            itinerary = response.get('itinerary', {})
            place_details = response.get('place_details', {})
            additional_places = response.get('additional_places', {})
            
            print(f"📊 Generated {len(itinerary.get('daily_plans', []))} days")
            print(f"💰 Budget: ${itinerary.get('budget_estimate', 0)}")
            print(f"📍 Place details: {len(place_details)} places")
            print(f"🎯 Additional places: {sum(len(places) for places in additional_places.values())}")
            print("="*80)
            
            return response
            
        except Exception as e:
            print(f"❌ ERROR IN ITINERARY GENERATION: {str(e)}")
            logger.error(f"Error generating itinerary: {str(e)}")
            
            # Check if it's a Google API error
            if "500 An internal error has occurred" in str(e):
                print("🔧 ERROR TYPE: Google API Internal Error")
                raise Exception("AI service is temporarily unavailable. Please try again in a few minutes.")
            elif "API key" in str(e).lower() or "authentication" in str(e).lower():
                print("🔑 ERROR TYPE: API Key/Authentication Error")
                raise Exception("AI service configuration error. Please contact support.")
            elif "quota" in str(e).lower() or "rate limit" in str(e).lower():
                print("⏱️  ERROR TYPE: Rate Limit/Quota Error")
                raise Exception("AI service is currently busy. Please try again later.")
            else:
                print(f"🚨 ERROR TYPE: General Error - {str(e)}")
                raise Exception(f"Failed to generate itinerary: {str(e)}")
    
    async def predict_prices(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Predict travel costs for the given destination and dates using LangGraph workflow
        """
        try:
            if not self.workflow:
                raise Exception("LangGraph workflow is not properly configured")
            
            # Use the workflow's LLM directly for price prediction
            # This could be enhanced to be part of the main workflow in the future
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
            total_days = (end_date_obj - start_date_obj).days + 1
            
            from prompts.itinerary_prompts import PRICE_PREDICTION_PROMPT, format_accommodation_type
            
            # Prepare prompt variables
            prompt_vars = {
                "destination": destination,
                "total_days": total_days,
                "travelers": travelers,
                "start_date": start_date,
                "end_date": end_date,
                "accommodation_type": format_accommodation_type(accommodation_type)
            }
            
            # Use the workflow's LLM for consistency
            if not self.workflow.llm:
                raise Exception("AI service not available in workflow")
            
            messages = PRICE_PREDICTION_PROMPT.format_messages(**prompt_vars)
            response = await self.workflow.llm.ainvoke(messages)
            
            # Clean and parse the response
            cleaned_text = self.workflow._clean_json_response(response.content)
            
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
        start_date: str,
        end_date: str,
        budget: Optional[float] = None,
        interests: List[str] = [],
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> ItineraryResponse:
        """
        Generate a basic fallback itinerary when LangGraph workflow is unavailable
        """
        # Use the workflow's fallback method if available, otherwise create a simple one
        if self.workflow:
            try:
                return await self.workflow._generate_fallback_itinerary(
                    destination, start_date, end_date, budget, interests, travelers, accommodation_type
                )
            except:
                pass  # Fall through to simple fallback
        
        # Simple fallback when everything else fails
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
                    "Service is temporarily unavailable. This is a basic itinerary.",
                    "Transportation: Use local public transport for cost-effective travel.",
                    "Safety: Always be aware of your surroundings and keep belongings secure.",
                    "Culture: Respect local customs and dress appropriately for religious sites.",
                    "Planning: Book popular attractions in advance to avoid disappointment."
                ]
            }
        ) 