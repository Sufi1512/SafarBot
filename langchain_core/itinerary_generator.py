import asyncio
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)

class ItineraryGenerator:
    def __init__(self):
        self.llm = self._initialize_llm()
        
    def _initialize_llm(self):
        """Initialize Google Gemini LLM"""
        # Try multiple ways to get the API key
        api_key = os.getenv("GOOGLE_API_KEY")
        
        # If not found in environment, try to import from config
        if not api_key:
            try:
                import sys
                sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))
                from config import settings
                api_key = settings.google_api_key
            except:
                pass
        
        if not api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        
        return genai.GenerativeModel('gemini-2.5-flash')
    
    async def generate_itinerary(
        self,
        destination: str,
        days: int,
        interests: List[str] = [],
        budget: Optional[float] = None,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a travel itinerary using Google Gemini"""
        try:
            # Create the prompt
            prompt = self._create_itinerary_prompt(
                destination, days, interests, budget, travelers, accommodation_type
            )
            
            # Generate response
            response = await asyncio.to_thread(
                self.llm.generate_content, prompt
            )
            
            # Parse the response
            itinerary = self._parse_itinerary_response(response.text)
            
            return {
                "destination": destination,
                "days": days,
                "travelers": travelers,
                "budget": budget,
                "interests": interests,
                "daily_plans": itinerary,
                "total_estimated_cost": self._calculate_total_cost(itinerary),
                "recommendations": self._generate_recommendations(destination, interests)
            }
            
        except Exception as e:
            logger.error(f"Error generating itinerary: {str(e)}")
            # Return a mock itinerary as fallback
            return self._generate_mock_itinerary(destination, days, interests, budget, travelers)
    
    def _create_itinerary_prompt(
        self,
        destination: str,
        days: int,
        interests: List[str],
        budget: Optional[float],
        travelers: int,
        accommodation_type: Optional[str]
    ) -> str:
        """Create a detailed prompt for itinerary generation"""
        
        interests_text = ", ".join(interests) if interests else "general sightseeing"
        budget_text = f" with a budget of ${budget}" if budget else ""
        accommodation_text = f" preferring {accommodation_type} accommodation" if accommodation_type else ""
        
        prompt = f"""
        Create a detailed {days}-day travel itinerary for {destination} for {travelers} traveler(s){budget_text}{accommodation_text}.
        
        Interests: {interests_text}
        
        Please provide a day-by-day itinerary with the following structure for each day:
        - Day X: [Day Title]
          - Morning: [Activity 1] (Duration: X hours, Cost: $X)
          - Afternoon: [Activity 2] (Duration: X hours, Cost: $X)
          - Evening: [Activity 3] (Duration: X hours, Cost: $X)
          - Meals: [Restaurant recommendations]
          - Accommodation: [Hotel/hostel recommendation]
        
        Include:
        1. Popular attractions and hidden gems
        2. Local cuisine recommendations
        3. Transportation options between activities
        4. Estimated costs for each activity
        5. Best times to visit each location
        6. Cultural tips and etiquette
        
        Make the itinerary realistic and enjoyable, considering travel time between locations.
        """
        
        return prompt
    
    def _parse_itinerary_response(self, response: str) -> List[Dict[str, Any]]:
        """Parse the AI response into structured daily plans"""
        try:
            # Simple parsing - split by days and extract activities
            lines = response.split('\n')
            daily_plans = []
            current_day = None
            current_activities = []
            
            for line in lines:
                line = line.strip()
                if line.startswith('Day ') and ':' in line:
                    # Save previous day if exists
                    if current_day:
                        daily_plans.append({
                            "day": current_day,
                            "activities": current_activities
                        })
                    
                    # Start new day
                    current_day = line
                    current_activities = []
                elif line and current_day and (line.startswith('- ') or line.startswith('• ')):
                    current_activities.append(line[2:])  # Remove bullet point
            
            # Add the last day
            if current_day:
                daily_plans.append({
                    "day": current_day,
                    "activities": current_activities
                })
            
            return daily_plans
            
        except Exception as e:
            logger.error(f"Error parsing itinerary response: {str(e)}")
            return self._generate_mock_daily_plans()
    
    def _calculate_total_cost(self, itinerary: List[Dict[str, Any]]) -> float:
        """Calculate total estimated cost from itinerary"""
        total = 0.0
        for day in itinerary:
            for activity in day.get("activities", []):
                # Extract cost from activity description
                if "Cost: $" in activity:
                    try:
                        cost_str = activity.split("Cost: $")[1].split()[0]
                        total += float(cost_str)
                    except:
                        pass
        return total
    
    def _generate_recommendations(self, destination: str, interests: List[str]) -> Dict[str, Any]:
        """Generate recommendations for the destination"""
        return {
            "hotels": [
                {"name": f"Best Hotel in {destination}", "rating": 4.5, "price_range": "$$$"},
                {"name": f"Budget Stay {destination}", "rating": 4.0, "price_range": "$"},
            ],
            "restaurants": [
                {"name": f"Local Cuisine {destination}", "cuisine": "Local", "rating": 4.3},
                {"name": f"Fine Dining {destination}", "cuisine": "International", "rating": 4.7},
            ],
            "tips": [
                f"Best time to visit {destination} is during spring or fall",
                "Learn a few basic phrases in the local language",
                "Always carry cash for small purchases",
                "Check local customs and dress codes"
            ]
        }
    
    def _generate_mock_itinerary(
        self,
        destination: str,
        days: int,
        interests: List[str],
        budget: Optional[float],
        travelers: int
    ) -> Dict[str, Any]:
        """Generate a mock itinerary as fallback"""
        return {
            "destination": destination,
            "days": days,
            "travelers": travelers,
            "budget": budget,
            "interests": interests,
            "daily_plans": self._generate_mock_daily_plans(),
            "total_estimated_cost": 1500.0,
            "recommendations": self._generate_recommendations(destination, interests)
        }
    
    def _generate_mock_daily_plans(self) -> List[Dict[str, Any]]:
        """Generate mock daily plans"""
        return [
            {
                "day": "Day 1: Arrival and City Introduction",
                "activities": [
                    "Morning: Airport transfer and hotel check-in (Duration: 2 hours, Cost: $50)",
                    "Afternoon: City center walking tour (Duration: 3 hours, Cost: $30)",
                    "Evening: Welcome dinner at local restaurant (Duration: 2 hours, Cost: $80)",
                    "Meals: Breakfast at hotel, Lunch at cafe, Dinner at restaurant",
                    "Accommodation: City Center Hotel"
                ]
            },
            {
                "day": "Day 2: Cultural Exploration",
                "activities": [
                    "Morning: Visit main museums and galleries (Duration: 4 hours, Cost: $60)",
                    "Afternoon: Historical district exploration (Duration: 3 hours, Cost: $20)",
                    "Evening: Cultural performance (Duration: 2 hours, Cost: $70)",
                    "Meals: Breakfast at hotel, Lunch at museum cafe, Dinner at local bistro",
                    "Accommodation: City Center Hotel"
                ]
            }
        ]
    
    async def predict_prices(
        self,
        destination: str,
        days: int,
        travelers: int = 1,
        accommodation_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Predict travel costs for the destination"""
        try:
            prompt = f"""
            Estimate the total travel cost for {travelers} traveler(s) visiting {destination} for {days} days.
            
            Accommodation type: {accommodation_type or 'Standard hotel'}
            
            Please provide a detailed cost breakdown including:
            - Accommodation (per night)
            - Food and dining (per day)
            - Transportation (local and intercity)
            - Activities and attractions
            - Miscellaneous expenses
            
            Format the response as a JSON object with categories and amounts.
            """
            
            response = await asyncio.to_thread(
                self.llm.generate_content, prompt
            )
            
            # Try to parse JSON response
            try:
                import json
                costs = json.loads(response.text)
                return costs
            except:
                # Fallback to estimated costs
                return self._estimate_costs(destination, days, travelers, accommodation_type)
                
        except Exception as e:
            logger.error(f"Error predicting prices: {str(e)}")
            return self._estimate_costs(destination, days, travelers, accommodation_type)
    
    def _estimate_costs(
        self,
        destination: str,
        days: int,
        travelers: int,
        accommodation_type: Optional[str]
    ) -> Dict[str, Any]:
        """Estimate costs based on destination and duration"""
        base_accommodation = 150 if accommodation_type == "luxury" else 80 if accommodation_type == "budget" else 120
        base_food = 60
        base_transport = 30
        base_activities = 50
        
        return {
            "accommodation": base_accommodation * days * travelers,
            "food": base_food * days * travelers,
            "transportation": base_transport * days * travelers,
            "activities": base_activities * days * travelers,
            "miscellaneous": 200 * travelers,
            "total": (base_accommodation + base_food + base_transport + base_activities) * days * travelers + 200 * travelers
        } 