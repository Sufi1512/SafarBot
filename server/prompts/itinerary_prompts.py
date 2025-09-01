"""
Prompt templates for itinerary generation using LangChain
"""

from langchain_core.prompts import ChatPromptTemplate
from typing import List, Optional

# Main itinerary generation prompt template - Returns basic structure with place IDs
ITINERARY_GENERATION_PROMPT = """You are an expert travel planner. Create a day-by-day itinerary STRUCTURE for the given destination and preferences.

CRITICAL: Return only basic structure with place IDs. Detailed place information (images, reviews, coordinates) will be provided separately.

**DESTINATION:** {destination}
**DATES:** {start_date} to {end_date} ({total_days} days)
**TRAVELERS:** {travelers} people
**BUDGET:** {budget_info}
**INTERESTS:** {interests}
**ACCOMMODATION:** {accommodation_type}

RESPONSE FORMAT: Return ONLY valid JSON with this structure:

{{
  "destination": "{destination}",
  "total_days": {total_days},
  "budget_estimate": 0,
  "accommodation_suggestions": [
    {{
      "place_id": "hotel_001",
      "name": "Hotel Name",
      "type": "hotel/hostel/apartment", 
      "location": "Area/District",
      "price_range": "$100-150/night",
      "brief_description": "One line description"
    }}
  ],
  "daily_plans": [
    {{
      "day": 1,
      "date": "{start_date}",
      "theme": "Arrival & Historic Center",
      "activities": [
        {{
          "time": "09:00",
          "place_id": "attraction_001",
          "title": "Activity Name",
          "brief_description": "One line description",
          "duration": "2 hours",
          "estimated_cost": "$25",
          "type": "sightseeing"
        }}
      ],
      "meals": [
        {{
          "time": "12:30",
          "meal_type": "lunch",
          "place_id": "restaurant_001", 
          "name": "Restaurant Name",
          "cuisine": "Italian",
          "price_range": "$15-25",
          "brief_description": "One line description"
        }}
      ],
      "transportation": [
        {{
          "from": "Airport",
          "to": "City Center", 
          "method": "Metro",
          "cost": "$5",
          "duration": "45 minutes"
        }}
      ],
      "budget_breakdown": {{
        "accommodation": 150,
        "food": 60,
        "activities": 40,
        "transportation": 15,
        "total": 265
      }}
    }}
  ],
  "place_ids_used": [
    "hotel_001", "restaurant_001", "attraction_001"
  ],
  "travel_tips": [
    "Essential travel tip 1",
    "Essential travel tip 2"
  ]
}}

GUIDELINES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Use unique place_id for each location (hotel_001, restaurant_001, attraction_001, etc.)
3. Keep descriptions brief (one line only)
4. Include realistic costs in USD
5. Plan 6-8 hours of activities per day
6. Match activities to interests: {interests}
7. Include all place_ids used in the place_ids_used array
8. Focus on structure, not detailed descriptions"""

# Legacy ChatPromptTemplate version for compatibility
ITINERARY_GENERATION_CHAT_PROMPT = ChatPromptTemplate.from_messages([
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

# Price prediction prompt template
PRICE_PREDICTION_PROMPT = ChatPromptTemplate.from_messages([
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

# Weather and seasonal advice prompt
WEATHER_ADVICE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a travel weather expert who provides seasonal travel advice, weather expectations, and packing recommendations for destinations worldwide."""),
    
    ("human", """Provide weather and seasonal advice for:

Destination: {destination}
Travel Dates: {start_date} to {end_date}
Duration: {total_days} days

Include information about:
- Expected weather conditions
- Temperature ranges
- Rainfall/seasonality
- What to pack
- Best times to visit specific attractions
- Seasonal considerations for activities""")
])

def format_budget_info(budget: Optional[float]) -> str:
    """Format budget information for the prompt"""
    if budget:
        if budget < 1000:
            return f"${budget} (Budget travel)"
        elif budget < 3000:
            return f"${budget} (Mid-range travel)"
        else:
            return f"${budget} (Luxury travel)"
    return "Flexible budget"

def format_interests(interests: List[str]) -> str:
    """Format interests list for the prompt"""
    if not interests:
        return "General sightseeing and cultural experiences"
    return ", ".join(interests)

def format_accommodation_type(accommodation_type: Optional[str]) -> str:
    """Format accommodation type for the prompt"""
    return accommodation_type or "Standard hotels and guesthouses"
