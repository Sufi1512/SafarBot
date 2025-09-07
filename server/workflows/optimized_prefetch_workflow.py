"""
Optimized Pre-fetch Workflow
1. Pre-fetch ALL SERP data (hotels, restaurants, cafes, attractions) 
2. Send summary to LLM for itinerary generation with place IDs
3. Map place IDs to complete metadata
4. Return single complete JSON response
"""

import logging
import asyncio
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

import google.generativeai as genai
from models import ItineraryResponse, DailyPlan
from config import settings
from services.serp_cache_service import cached_places_tool

logger = logging.getLogger(__name__)

class OptimizedPrefetchWorkflow:
    """Optimized workflow that pre-fetches all data then generates itinerary"""
    
    def __init__(self):
        """Initialize the optimized workflow"""
        if not getattr(settings, 'google_api_key', None):
            raise ValueError("Google API key is required")
        
        genai.configure(api_key=settings.google_api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.places_tool = cached_places_tool
        
        print("🚀 OPTIMIZED PREFETCH WORKFLOW - Initialized")
    
    async def generate_complete_itinerary(self, destination: str, start_date: str, end_date: str,
                                        budget: Optional[float] = None, budget_range: Optional[str] = None,
                                        interests: List[str] = [], travelers: int = 1,
                                        travel_companion: Optional[str] = None, trip_pace: Optional[str] = None,
                                        departure_city: Optional[str] = None, flight_class_preference: Optional[str] = None,
                                        hotel_rating_preference: Optional[str] = None, accommodation_type: Optional[str] = None,
                                        email: Optional[str] = None, dietary_preferences: List[str] = [],
                                        halal_preferences: Optional[str] = None, vegetarian_preferences: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate complete itinerary with optimized pre-fetch approach
        1. Pre-fetch all SERP data
        2. Generate itinerary with place IDs
        3. Map IDs to complete metadata
        4. Return single complete response
        """
        
        print("\n" + "="*80)
        print("🚀 OPTIMIZED WORKFLOW - Starting complete itinerary generation")
        print(f"📍 Destination: {destination}")
        print(f"📅 Dates: {start_date} to {end_date}")
        print(f"💰 Budget: ${budget if budget else 'Flexible'} ({budget_range or 'Not specified'})")
        print(f"👥 Travelers: {travelers} ({travel_companion or 'General'})")
        print(f"🚶 Trip Pace: {trip_pace or 'Balanced'}")
        print(f"🎯 Interests: {interests}")
        print(f"🏨 Accommodation: {hotel_rating_preference or accommodation_type or 'Standard'}")
        print(f"🍽️ Dietary: {', '.join(dietary_preferences) if dietary_preferences else 'No restrictions'}")
        print("="*80)
        
        try:
            # STEP 1: Pre-fetch ALL SERP data with complete metadata
            print("\n🔍 STEP 1: Pre-fetching ALL place data from SERP API")
            all_places_data = await self._prefetch_all_places_data(destination, interests)
            
            total_places = sum(len(places) for places in all_places_data.values())
            print(f"✅ Pre-fetched {total_places} places with complete metadata")
            
            # STEP 2: Generate itinerary using pre-fetched data
            print("\n🤖 STEP 2: Generating itinerary with LLM using pre-fetched data")
            itinerary_response = await self._generate_itinerary_with_prefetched_data(
                destination, start_date, end_date, budget, budget_range, interests, 
                travelers, travel_companion, trip_pace, departure_city, flight_class_preference,
                hotel_rating_preference, accommodation_type, email, dietary_preferences,
                halal_preferences, vegetarian_preferences, all_places_data
            )
            
            # STEP 3: Get weather data
            print("\n🌤️  STEP 3: Fetching weather data")
            weather_data = None
            try:
                from services.weather_service import weather_service
                weather_data = await weather_service.get_current_weather(destination)
                if "error" not in weather_data:
                    print(f"   ✅ Weather data fetched for {destination}")
                else:
                    print(f"   ⚠️  Weather data unavailable: {weather_data.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"   ⚠️  Failed to fetch weather data: {str(e)}")
                weather_data = {"error": str(e)}
            
            # STEP 4: Map place IDs to complete metadata
            print("\n🗺️  STEP 4: Mapping place IDs to complete metadata")
            complete_response = await self._map_places_to_complete_data(
                itinerary_response, all_places_data, weather_data
            )
            
            print("\n✅ OPTIMIZED WORKFLOW COMPLETED - Single complete response ready")
            print(f"📊 Total places with details: {len(complete_response.get('place_details', {}))}")
            print(f"📊 Additional places available: {len(complete_response.get('additional_places', {}))}")
            
            return complete_response
            
        except Exception as e:
            print(f"❌ ERROR IN OPTIMIZED WORKFLOW: {str(e)}")
            logger.error(f"Error in optimized workflow: {str(e)}")
            raise
    
    async def _prefetch_all_places_data(self, destination: str, interests: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Pre-fetch ALL places data from SERP API with complete metadata
        Returns organized data by category
        """
        
        print(f"   🏨 Pre-fetching hotels in {destination}")
        print(f"   🍽️  Pre-fetching restaurants in {destination}")
        print(f"   ☕ Pre-fetching cafes in {destination}")
        print(f"   🎯 Pre-fetching attractions in {destination}")
        print(f"   🔍 Pre-fetching interest-based places: {interests}")
        
        # Fetch all data in parallel for speed
        try:
            hotels_task = self.places_tool.search_hotels_cached(destination, max_results=15)
            restaurants_task = self.places_tool.search_restaurants_cached(destination, max_results=20)
            cafes_task = self.places_tool.search_cafes_cached(destination, max_results=10)
            attractions_task = self.places_tool.search_attractions_cached(destination, interests, max_results=15)
            
            # Interest-based searches
            interest_tasks = []
            for interest in interests[:3]:  # Limit to 3 interests to avoid too many calls
                if interest not in ['city', 'sightseeing']:  # Skip generic terms
                    query = f"{interest} places in {destination}"
                    interest_tasks.append(self.places_tool.raw_serp_search_cached(query))
            
            # Execute all searches in parallel
            results = await asyncio.gather(
                hotels_task,
                restaurants_task,
                cafes_task,
                attractions_task,
                *interest_tasks,
                return_exceptions=True
            )
            
            # Organize results
            all_places_data = {
                'hotels': results[0] if not isinstance(results[0], Exception) else [],
                'restaurants': results[1] if not isinstance(results[1], Exception) else [],
                'cafes': results[2] if not isinstance(results[2], Exception) else [],
                'attractions': results[3] if not isinstance(results[3], Exception) else [],
                'interest_based': []
            }
            
            # Add interest-based results
            for i, result in enumerate(results[4:], 4):
                if not isinstance(result, Exception) and result:
                    all_places_data['interest_based'].extend(result)
            
            # Generate unique place IDs for each place
            place_id_counter = 1
            for category, places in all_places_data.items():
                for place in places:
                    if 'place_id' not in place or not place['place_id']:
                        # Generate a unique place ID
                        place['place_id'] = f"{category}_{place_id_counter:03d}"
                        place_id_counter += 1
                    
                    # Ensure we have the category info
                    place['category'] = category
                    place['prefetched'] = True
            
            # Log what we found
            for category, places in all_places_data.items():
                print(f"      ✅ {category}: {len(places)} places with complete metadata")
            
            return all_places_data
            
        except Exception as e:
            print(f"      ❌ Error pre-fetching data: {str(e)}")
            logger.error(f"Error in pre-fetch: {str(e)}")
            # Return empty structure on error
            return {
                
                'hotels': [],
                'restaurants': [],
                'cafes': [],
                'attractions': [],
                'interest_based': []
            }
    
    async def _generate_itinerary_with_prefetched_data(self, destination: str, start_date: str, 
                                                     end_date: str, budget: Optional[float], budget_range: Optional[str],
                                                     interests: List[str], travelers: int, travel_companion: Optional[str],
                                                     trip_pace: Optional[str], departure_city: Optional[str],
                                                     flight_class_preference: Optional[str], hotel_rating_preference: Optional[str],
                                                     accommodation_type: Optional[str], email: Optional[str],
                                                     dietary_preferences: List[str], halal_preferences: Optional[str],
                                                     vegetarian_preferences: Optional[str],
                                                     all_places_data: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Generate itinerary using pre-fetched data"""
        
        # Calculate trip duration
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        total_days = (end - start).days + 1
        
        # Create a summary of available places for the LLM
        places_summary = self._create_places_summary_for_llm(all_places_data)
        
        # Get weather information
        weather_info = "Weather data unavailable - plan for various conditions and seasons"
        try:
            from services.weather_service import weather_service
            weather_data = await weather_service.get_current_weather(destination)
            if "error" not in weather_data:
                weather_info = self._format_weather_info(weather_data, destination)
        except Exception as e:
            logger.warning(f"Failed to fetch weather data: {str(e)}")
        
        # Create optimized prompt
        prompt = f"""You are an expert travel planner. Create a comprehensive {total_days}-day itinerary for {destination} using the PRE-FETCHED places data below.

DESTINATION: {destination}
DATES: {start_date} to {end_date} ({total_days} days)
TRAVELERS: {travel_companion or f'{travelers} people'}
BUDGET: {budget_range or f'${budget} USD' if budget else 'Flexible'}
TRIP PACE: {trip_pace or 'Balanced'}
INTERESTS: {', '.join(interests)}
ACCOMMODATION: {hotel_rating_preference or accommodation_type or 'Standard'}
DIETARY PREFERENCES: {', '.join(dietary_preferences) if dietary_preferences else 'No restrictions'}
WEATHER CONDITIONS: {weather_info}

AVAILABLE PLACES (with place IDs):
{places_summary}

INSTRUCTIONS:
1. Use ONLY the place_id values from the available places above
2. Create a realistic day-by-day itinerary
3. Day 1 MUST start with hotel check-in/arrival as the FIRST activity
4. Consider travel time between locations
5. Mix different types of places (attractions, restaurants, cafes)
6. Respect the budget constraints
7. Include accommodation suggestions from available hotels
8. Consider weather conditions when planning activities
9. Provide EXACTLY 10-12 travel tips (not fewer)
10. Include 2-3 activities per day minimum (after check-in on Day 1)
11. Include 2-3 meals per day minimum

RESPONSE FORMAT: Return ONLY valid JSON with this structure:
{{
  "destination": "{destination}",
  "total_days": {total_days},
  "budget_estimate": 0,
  "accommodation_suggestions": [
    {{
      "place_id": "hotels_001",
      "name": "Hotel Name",
      "type": "hotel",
      "location": "Area",
      "price_range": "$100-150/night"
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
          "place_id": "hotels_001",
          "title": "Hotel Check-in & Arrival",
          "duration": "1 hour",
          "estimated_cost": "$0",
          "type": "accommodation"
        }},
        {{
          "time": "14:00",
          "place_id": "attractions_001",
          "title": "Activity Name",
          "duration": "2 hours",
          "estimated_cost": "$25",
          "type": "sightseeing"
        }}
      ],
      "meals": [
        {{
          "time": "13:00",
          "meal_type": "lunch",
          "place_id": "restaurants_001",
          "name": "Restaurant Name",
          "cuisine": "Local",
          "price_range": "$15-25"
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
  "place_ids_used": ["hotels_001", "restaurants_001", "attractions_001"],
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

        print(f"   🤖 Sending prompt to LLM (places available: {sum(len(places) for places in all_places_data.values())})")
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON response
            itinerary_data = json.loads(response_text.strip())
            
            print(f"   ✅ LLM generated itinerary with {len(itinerary_data.get('place_ids_used', []))} places")
            
            return itinerary_data
            
        except Exception as e:
            print(f"   ❌ Error generating itinerary: {str(e)}")
            logger.error(f"LLM generation error: {str(e)}")
            
            # Return basic fallback itinerary
            return {
                "destination": destination,
                "total_days": total_days,
                "budget_estimate": budget,
                "accommodation_suggestions": [],
                "daily_plans": [],
                "place_ids_used": [],
                "travel_tips": ["Explore the local culture", "Try local cuisine"]
            }
    
    def _format_weather_info(self, weather_data: Dict[str, Any], destination: str) -> str:
        """Format weather information for the prompt"""
        if not weather_data or "error" in weather_data:
            return "Weather data unavailable - plan for various conditions and seasons"
        
        current = weather_data.get("current", {})
        location = weather_data.get("location", {})
        
        temp = current.get("temperature", 0)
        description = current.get("description", "unknown conditions")
        humidity = current.get("humidity", 0)
        wind_speed = current.get("wind_speed", 0)
        
        weather_info = f"Current weather in {location.get('city', destination)}: {temp}°C, {description}"
        
        if humidity > 0:
            weather_info += f", humidity {humidity}%"
        if wind_speed > 0:
            weather_info += f", wind {wind_speed} m/s"
        
        # Add recommendations if available
        recommendations = weather_data.get("recommendations", [])
        if recommendations:
            weather_info += f". Recommendations: {'; '.join(recommendations[:3])}"  # Limit to first 3 recommendations
        
        return weather_info

    def _create_places_summary_for_llm(self, all_places_data: Dict[str, List[Dict[str, Any]]]) -> str:
        """Create a concise summary of available places for the LLM"""
        
        summary_lines = []
        
        for category, places in all_places_data.items():
            if not places:
                continue
                
            summary_lines.append(f"\n{category.upper()}:")
            for place in places[:10]:  # Limit to top 10 per category for prompt size
                place_id = place.get('place_id', 'unknown')
                name = place.get('title', place.get('name', 'Unknown'))
                rating = place.get('rating', 0)
                address = place.get('address', place.get('location', ''))
                
                # Create concise description
                description = f"  - {place_id}: {name}"
                if rating:
                    description += f" (★{rating})"
                if address:
                    description += f" - {address[:50]}"
                
                summary_lines.append(description)
        
        return '\n'.join(summary_lines)
    
    async def _map_places_to_complete_data(self, itinerary_response: Dict[str, Any], 
                                         all_places_data: Dict[str, List[Dict[str, Any]]], 
                                         weather_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Map place IDs from itinerary to complete metadata"""
        
        # Create place ID to complete data mapping
        place_id_map = {}
        for category, places in all_places_data.items():
            for place in places:
                place_id = place.get('place_id')
                if place_id:
                    place_id_map[place_id] = place
        
        print(f"   🗺️  Created mapping for {len(place_id_map)} places")
        
        # Extract place IDs used in itinerary
        used_place_ids = set(itinerary_response.get('place_ids_used', []))
        
        # Add place IDs from daily plans
        for daily_plan in itinerary_response.get('daily_plans', []):
            for activity in daily_plan.get('activities', []):
                if 'place_id' in activity:
                    used_place_ids.add(activity['place_id'])
            
            for meal in daily_plan.get('meals', []):
                if 'place_id' in meal:
                    used_place_ids.add(meal['place_id'])
        
        # Add place IDs from accommodation
        for accommodation in itinerary_response.get('accommodation_suggestions', []):
            if 'place_id' in accommodation:
                used_place_ids.add(accommodation['place_id'])
        
        print(f"   📍 Found {len(used_place_ids)} unique place IDs used in itinerary")
        
        # Map used places to complete details
        place_details = {}
        for place_id in used_place_ids:
            if place_id in place_id_map:
                place_details[place_id] = place_id_map[place_id]
                print(f"      ✅ Mapped {place_id}: {place_id_map[place_id].get('title', place_id_map[place_id].get('name', 'Unknown'))}")
            else:
                print(f"      ⚠️  No metadata found for place_id: {place_id}")
        
        # Create additional places (not used in itinerary)
        additional_places = {}
        for category, places in all_places_data.items():
            additional_places[category] = []
            for place in places:
                place_id = place.get('place_id')
                if place_id and place_id not in used_place_ids:
                    additional_places[category].append(place)
        
        # Build complete response
        complete_response = {
            "itinerary": itinerary_response,
            "place_details": place_details,
            "additional_places": additional_places,
            "weather": weather_data if weather_data and "error" not in weather_data else None,
            "metadata": {
                "total_places_prefetched": sum(len(places) for places in all_places_data.values()),
                "places_used_in_itinerary": len(place_details),
                "additional_places_available": sum(len(places) for places in additional_places.values()),
                "generation_timestamp": datetime.now().isoformat(),
                "workflow_type": "optimized_prefetch",
                "weather_included": weather_data is not None and "error" not in weather_data
            }
        }
        
        print(f"   ✅ Complete response built:")
        print(f"      📋 Itinerary places: {len(place_details)}")
        print(f"      🎯 Additional places: {sum(len(places) for places in additional_places.values())}")
        if weather_data and "error" not in weather_data:
            temp = weather_data.get("current", {}).get("temperature", "N/A")
            desc = weather_data.get("current", {}).get("description", "N/A")
            print(f"      🌤️  Weather: {temp}°C, {desc}")
        else:
            print(f"      🌤️  Weather: Not available")
        
        return complete_response
