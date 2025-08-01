import asyncio
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
import logging
from ..models import ItineraryResponse, DailyPlan
from ..config import settings
import sys
import os

# Add langchain_core to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'langchain_core'))
from itinerary_generator import ItineraryGenerator

logger = logging.getLogger(__name__)

class ItineraryService:
    def __init__(self):
        self.generator = ItineraryGenerator()
        
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
            # Calculate trip duration
            total_days = (end_date - start_date).days + 1
            
            # Generate itinerary using LangChain
            itinerary_data = await self.generator.generate_itinerary(
                destination=destination,
                days=total_days,
                interests=interests,
                budget=budget,
                travelers=travelers,
                accommodation_type=accommodation_type
            )
            
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
            response = ItineraryResponse(
                destination=destination,
                total_days=total_days,
                budget_estimate=itinerary_data.get('budget_estimate', 0.0),
                daily_plans=daily_plans,
                recommendations=itinerary_data.get('recommendations', {}),
                weather_info=itinerary_data.get('weather_info')
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
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
            total_days = (end_date - start_date).days + 1
            
            price_prediction = await self.generator.predict_prices(
                destination=destination,
                days=total_days,
                travelers=travelers,
                accommodation_type=accommodation_type
            )
            
            return price_prediction
            
        except Exception as e:
            logger.error(f"Error predicting prices: {str(e)}")
            raise Exception(f"Failed to predict prices: {str(e)}") 