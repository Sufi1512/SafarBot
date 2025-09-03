from langchain_core.prompts import ChatPromptTemplate
from typing import List, Optional, Dict
from datetime import datetime, timedelta

# Simplified itinerary generation prompt template
ITINERARY_GENERATION_CHAT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are an expert travel planning AI. Create comprehensive itineraries with complete daily plans.

CRITICAL REQUIREMENTS - MUST FOLLOW EXACTLY:
1. Return ONLY valid JSON - no text or markdown
2. Generate EXACTLY {total_days} daily plans (Day 1, Day 2, etc.)
3. Include 2-3 activities per day minimum
4. Include 2-3 meals per day minimum  
5. Include transportation between all locations
6. Provide EXACTLY 10-12 travel tips (NOT 2, NOT 5, EXACTLY 10-12)
7. Use unique place_ids for all locations
8. Include realistic costs in USD
9. Consider weather: {weather_info}
10. Respect dietary preferences: {dietary_preferences}

FAILURE TO PROVIDE 10-12 TRAVEL TIPS WILL RESULT IN INVALID RESPONSE

MANDATORY STRUCTURE:
- Each day must have: activities (2-3), meals (2-3), transportation
- Travel tips must be exactly 10-12 items
- All activities need: time, place_id, title, duration, cost, type
- All meals need: time, meal_type, place_id, name, cuisine, price_range
- All transportation needs: from, to, method, duration, cost"""),
    
    ("human", """Create a complete travel itinerary for {destination}.

Trip Details:
- Destination: {destination}
- Duration: {total_days} days ({start_date} to {end_date})
- Travelers: {travel_companion}
- Budget: {budget_info}
- Interests: {interests}
- Weather: {weather_info}
- Dietary: {dietary_preferences}

Return this JSON structure:
{
    "destination": "{destination}",
    "total_days": {total_days},
    "budget_estimate": 1500,
    "accommodation_suggestions": [
        {
            "place_id": "{destination}_hotel_001",
            "name": "Hotel Name",
            "type": "hotel",
            "location": "City Center",
            "price_range": "$100-150/night"
        }
    ],
    "daily_plans": [
        {
            "day": 1,
            "date": "{start_date}",
            "theme": "Arrival & Exploration",
            "activities": [
                {
                    "time": "09:00",
                    "place_id": "{destination}_attraction_001",
                    "title": "Cultural Site Visit",
                    "duration": "2 hours",
                    "estimated_cost": "$15",
                    "type": "sightseeing"
                },
                {
                    "time": "14:00",
                    "place_id": "{destination}_attraction_002",
                    "title": "Museum Visit",
                    "duration": "2 hours",
                    "estimated_cost": "$20",
                    "type": "cultural"
                }
            ],
            "meals": [
                {
                    "time": "12:00",
                    "meal_type": "lunch",
                    "place_id": "{destination}_restaurant_001",
                    "name": "Local Restaurant",
                    "cuisine": "Local",
                    "price_range": "$20-30"
                },
                {
                    "time": "19:00",
                    "meal_type": "dinner",
                    "place_id": "{destination}_restaurant_002",
                    "name": "Fine Dining",
                    "cuisine": "International",
                    "price_range": "$40-60"
                }
            ],
            "transportation": [
                {
                    "from": "Hotel",
                    "to": "Cultural Site",
                    "method": "taxi",
                    "duration": "15 minutes",
                    "cost": "$10"
                },
                {
                    "from": "Cultural Site",
                    "to": "Museum",
                    "method": "walking",
                    "duration": "10 minutes",
                    "cost": "$0"
                }
            ]
        }
    ],
    "place_ids_used": ["{destination}_hotel_001", "{destination}_restaurant_001", "{destination}_attraction_001"],
    "travel_tips": [
        "Respect local customs and dress appropriately",
        "Use public transportation for cost-effective travel",
        "Book tickets for popular attractions online",
        "Carry cash for small vendors and markets",
        "Pack clothing suitable for {weather_info}",
        "Reserve dining spots in advance for popular restaurants",
        "Use ride-hailing apps for convenient transport",
        "Learn basic local phrases for better interactions",
        "Check attraction hours to plan around closures",
        "Stay hydrated, especially in warm weather",
        "Keep copies of travel documents separate",
        "Plan outdoor activities for cooler parts of the day"
    ]
}


CRITICAL: You MUST provide exactly 10-12 travel tips. Do not provide fewer than 10 tips. The response will be rejected if you provide fewer than 10 travel tips.

Generate {total_days} complete daily plans with 2-3 activities, 2-3 meals, and transportation for each day.""")
])

# Weather formatting function
def format_weather_info(weather_data: Optional[Dict] = None, destination: str = "destination") -> str:
    """Format weather information for the prompt"""
    if not weather_data or "error" in weather_data:
        return "Weather data unavailable - plan for various conditions and seasons"
    
    current = weather_data.get("current", {})
    location = weather_data.get("location", {})
    
    temp = current.get("temperature", 0)
    description = current.get("description", "unknown conditions")
    humidity = current.get("humidity", 0)
    wind_speed = current.get("wind_speed", 0)
    
    weather_info = f"Weather in {destination}: {temp}°C, {description}, {humidity}% humidity."
    
    # Add recommendations if available
    recommendations = weather_data.get("recommendations", [])
    if recommendations:
        weather_info += f" Recommendations: {'; '.join(recommendations[:3])}"
    return weather_info

# Other formatting functions (simplified)
def format_budget_info(budget: Optional[float], budget_range: Optional[str] = None, travelers: int = 1) -> str:
    """Format budget information for the prompt"""
    if budget:
        daily_budget = budget / 7 if budget else 200  # Default to 7 days
        return f"${budget} total budget (${daily_budget:.0f}/day for {travelers} travelers)"
    return f"Flexible budget for {travelers} travelers"

def format_interests(interests: List[str]) -> str:
    """Format interests for the prompt"""
    if not interests:
        return "general sightseeing and local experiences"
    return ", ".join(interests)

def format_accommodation_type(accommodation_type: Optional[str], hotel_rating: Optional[str] = None) -> str:
    """Format accommodation type for the prompt"""
    if accommodation_type:
        return accommodation_type
    return "hotel"

def format_travel_companion(travelers: int, companion_type: Optional[str] = None) -> str:
    """Format travel companion information"""
    if companion_type:
        return companion_type
    if travelers == 1:
        return "solo traveler"
    elif travelers == 2:
        return "couple"
    else:
        return f"group of {travelers}"

def format_trip_pace(trip_pace: Optional[str]) -> str:
    """Format trip pace for the prompt"""
    if trip_pace:
        return trip_pace
    return "moderate"

def format_dietary_preferences(dietary_preferences: List[str], halal_preferences: Optional[str] = None, vegetarian_preferences: Optional[str] = None) -> str:
    """Format dietary preferences for the prompt"""
    preferences = []
    if halal_preferences:
        preferences.append(f"halal: {halal_preferences}")
    if vegetarian_preferences:
        preferences.append(f"vegetarian: {vegetarian_preferences}")
    if dietary_preferences:
        preferences.extend(dietary_preferences)
    
    if not preferences:
        return "no specific dietary restrictions"
    return ", ".join(preferences)

# Keep other prompts for compatibility
PRICE_PREDICTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a travel cost estimation expert."),
    ("human", "Estimate costs for {destination} trip for {travelers} people, {total_days} days, {accommodation_type} accommodation.")
])

WEATHER_ADVICE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a travel weather expert."),
    ("human", "Provide weather advice for {destination} from {start_date} to {end_date}.")
])
