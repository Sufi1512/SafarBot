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
import re
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta

from fastapi import HTTPException
from starlette.requests import Request
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
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.places_tool = cached_places_tool
        
        print("🚀 OPTIMIZED PREFETCH WORKFLOW - Initialized")
    
        # Tuning parameters to keep prompt size and latency under control
        self.base_prefetch_limits = {
            "hotels": 12,
            "restaurants": 15,
            "cafes": 8,
            "attractions": 12,
            "interest_based": 10,
        }
        self.max_prefetch_limits = {
            "hotels": 25,
            "restaurants": 30,
            "cafes": 16,
            "attractions": 24,
            "interest_based": 20,
        }
        self.prefetch_growth_per_two_days = {
            "hotels": 2,
            "restaurants": 3,
            "cafes": 1,
            "attractions": 2,
            "interest_based": 2,
        }
        self.base_summary_limit = 5
        self.max_summary_limit = 10
        self.min_ratings = {
            "hotels": 4.0,
            "hotel": 4.0,
            "restaurants": 4.2,
            "restaurant": 4.2,
            "cafes": 4.0,
            "cafe": 4.0,
            "attractions": 4.0,
            "attraction": 4.0,
        }

    async def generate_complete_itinerary(self, destination: str, start_date: str, end_date: str,
                                        budget: Optional[float] = None, budget_range: Optional[str] = None,
                                        interests: List[str] = [], travelers: int = 1,
                                        travel_companion: Optional[str] = None, trip_pace: Optional[str] = None,
                                        departure_city: Optional[str] = None, flight_class_preference: Optional[str] = None,
                                        hotel_rating_preference: Optional[str] = None, accommodation_type: Optional[str] = None,
                                        email: Optional[str] = None, dietary_preferences: List[str] = [],
                                        halal_preferences: Optional[str] = None, vegetarian_preferences: Optional[str] = None,
                                        request: Optional[Request] = None) -> Dict[str, Any]:
        """
        Generate complete itinerary with optimized pre-fetch approach
        1. Pre-fetch all SERP data
        2. Generate itinerary with place IDs
        3. Map IDs to complete metadata
        4. Return single complete response
        """
        
        await self._check_request(request)
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
            await self._check_request(request)
            weather_task = None
            try:
                from services.weather_service import weather_service
                weather_task = asyncio.create_task(weather_service.get_current_weather(destination))
                print("\n🌤️  WEATHER TASK: Started in parallel with data prefetch")
            except Exception as e:
                print(f"   ⚠️  Unable to start weather task: {str(e)}")
                weather_task = None

            # STEP 1: Pre-fetch ALL SERP data with complete metadata
            await self._check_request(request)
            print("\n🔍 STEP 1: Pre-fetching ALL place data from SERP API")
            dynamic_limits, summary_limit = self._calculate_dynamic_limits(start_date, end_date)
            all_places_data = await self._prefetch_all_places_data(destination, interests, dynamic_limits, request)
            
            total_places = sum(len(places) for places in all_places_data.values())
            print(f"✅ Pre-fetched {total_places} places with complete metadata")
            
            # STEP 2: Generate itinerary using pre-fetched data (awaits weather task when needed)
            await self._check_request(request)
            print("\n🤖 STEP 2: Generating itinerary with LLM using pre-fetched data")
            itinerary_response, weather_data = await self._generate_itinerary_with_prefetched_data(
                destination, start_date, end_date, budget, budget_range, interests, 
                travelers, travel_companion, trip_pace, departure_city, flight_class_preference,
                hotel_rating_preference, accommodation_type, email, dietary_preferences,
                halal_preferences, vegetarian_preferences, all_places_data, weather_task, summary_limit, request
            )
            await self._check_request(request)
            
            # STEP 3: Map place IDs to complete metadata
            await self._check_request(request)
            print("\n🗺️  STEP 3: Mapping place IDs to complete metadata")
            complete_response = await self._map_places_to_complete_data(
                itinerary_response, all_places_data, weather_data, request
            )
            
            print("\n✅ OPTIMIZED WORKFLOW COMPLETED - Single complete response ready")
            print(f"📊 Total places with details: {len(complete_response.get('place_details', {}))}")
            print(f"📊 Additional places available: {len(complete_response.get('additional_places', {}))}")
            
            return complete_response
            
        except Exception as e:
            print(f"❌ ERROR IN OPTIMIZED WORKFLOW: {str(e)}")
            logger.error(f"Error in optimized workflow: {str(e)}")
            raise
    
    async def _prefetch_all_places_data(
        self,
        destination: str,
        interests: List[str],
        dynamic_limits: Dict[str, int],
        request: Optional[Request] = None,
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Pre-fetch ALL places data from SERP API with complete metadata
        Returns organized data by category
        """
        
        await self._check_request(request)
        print(f"   🏨 Pre-fetching hotels in {destination}")
        print(f"   🍽️  Pre-fetching restaurants in {destination}")
        print(f"   ☕ Pre-fetching cafes in {destination}")
        print(f"   🎯 Pre-fetching attractions in {destination}")
        print(f"   🔍 Pre-fetching interest-based places: {interests}")
        
        # Fetch all data in parallel for speed
        try:
            hotels_task = self.places_tool.search_hotels_cached(destination, max_results=dynamic_limits["hotels"])
            restaurants_task = self.places_tool.search_restaurants_cached(destination, max_results=dynamic_limits["restaurants"])
            cafes_task = self.places_tool.search_cafes_cached(destination, max_results=dynamic_limits["cafes"])
            attractions_task = self.places_tool.search_attractions_cached(destination, interests, max_results=dynamic_limits["attractions"])
            
            # Interest-based searches
            interest_tasks = []
            for interest in interests[:3]:  # Limit to 3 interests to avoid too many calls
                if interest not in ['city', 'sightseeing']:  # Skip generic terms
                    query = f"{interest} places in {destination}"
                    interest_tasks.append(self.places_tool.raw_serp_search_cached(query))
            
            # Execute all searches in parallel
            await self._check_request(request)
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
            
            # Apply filtering/deduplication and cap results per category
            for category, places in list(all_places_data.items()):
                all_places_data[category] = self._filter_prefetched_places(
                    places,
                    category,
                    dynamic_limits.get(category, len(places))
                )

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
            await self._check_request(request)
            
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
                                                     all_places_data: Dict[str, List[Dict[str, Any]]],
                                                     weather_task: Optional[asyncio.Task] = None,
                                                     summary_limit: Optional[int] = None,
                                                     request: Optional[Request] = None) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
        """Generate itinerary using pre-fetched data and return weather metadata"""
        
        await self._check_request(request)
        # Calculate trip duration
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        total_days = (end - start).days + 1
        
        # Create a summary of available places for the LLM
        places_summary = self._create_places_summary_for_llm(all_places_data, summary_limit)
        
        # Get weather information (prefer using shared async task)
        weather_data: Optional[Dict[str, Any]] = None
        weather_info = "Weather data unavailable - plan for various conditions and seasons"
        if weather_task:
            try:
                weather_data = await weather_task
                if weather_data and "error" not in weather_data:
                    weather_info = self._format_weather_info(weather_data, destination)
                elif weather_data and "error" in weather_data:
                    logger.warning(f"Weather task returned error: {weather_data.get('error', 'Unknown error')}")
            except Exception as e:
                logger.warning(f"Weather task failed: {str(e)}")
            await self._check_request(request)
        else:
            try:
                from services.weather_service import weather_service
                weather_data = await weather_service.get_current_weather(destination)
                if weather_data and "error" not in weather_data:
                    weather_info = self._format_weather_info(weather_data, destination)
                elif weather_data and "error" in weather_data:
                    logger.warning(f"Weather data unavailable: {weather_data.get('error', 'Unknown error')}")
            except Exception as e:
                logger.warning(f"Failed to fetch weather data: {str(e)}")
            await self._check_request(request)
        
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

CRITICAL RULES (MUST FOLLOW):
1. ⚠️ NEVER REUSE THE SAME place_id - Each place_id can appear ONLY ONCE in the entire itinerary
   - Exception: The hotel place_id can appear twice (check-in Day 1, check-out last day)
   - For activities: Use DIFFERENT place_ids for each activity
   - For meals: Use DIFFERENT place_ids for each meal
   - Example: If you use "restaurants_001" for lunch Day 1, you CANNOT use it again for any other meal
   
2. Use ONLY the place_id values from the available places list above

3. Day 1 MUST start with hotel check-in/arrival as the FIRST activity

4. Create a realistic day-by-day itinerary with proper timing and travel considerations

5. Mix different types of places (attractions, restaurants, cafes) for variety

6. Respect the budget constraints: {budget_range or f'${budget} USD' if budget else 'Flexible'}

7. Include 2-4 accommodation suggestions from available hotels (different place_ids)

8. Consider weather conditions: {weather_info}

9. Provide EXACTLY 10-12 travel tips (not fewer, not more)

10. Include 2-4 activities per day (after check-in on Day 1)

11. Include 3-4 meals per day (breakfast, lunch, dinner, optional snack/tea)

12. CRITICAL: Day 1 MUST include dinner (meal_type: "dinner") after arrival

13. CRITICAL: Last day MUST include dinner (meal_type: "dinner") before departure

14. Dietary preferences: {', '.join(dietary_preferences) if dietary_preferences else 'No restrictions'}

15. VERIFY before finalizing: Count all place_ids used - each should appear only once (except hotel for check-in/out)

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
        }},
        {{
          "time": "19:00",
          "meal_type": "dinner",
          "place_id": "restaurants_002",
          "name": "Evening Restaurant",
          "cuisine": "International",
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

        try:
            await self._check_request(request)
            print(f"   🤖 Sending prompt to LLM (places available: {sum(len(places) for places in all_places_data.values())})")
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Clean up the response
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            # Parse JSON response
            itinerary_data = json.loads(response_text.strip())
            
            # Validate and fix duplicate place_ids
            itinerary_data = self._validate_and_fix_duplicates(itinerary_data, all_places_data)
            
            print(f"   ✅ LLM generated itinerary with {len(itinerary_data.get('place_ids_used', []))} places")
            
            return itinerary_data, weather_data
            
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
            }, weather_data
    
    def _validate_and_fix_duplicates(
        self,
        itinerary_data: Dict[str, Any],
        all_places_data: Dict[str, List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """
        Validate itinerary and fix duplicate place_ids by replacing them with unused alternatives
        """
        used_place_ids = set()
        hotel_place_id = None
        duplicates_found = 0
        
        # Create a pool of available place_ids by category
        available_places = {}
        for category, places in all_places_data.items():
            available_places[category] = [p.get('place_id') for p in places if p.get('place_id')]
        
        def get_unused_place_id(category: str, exclude_ids: set) -> Optional[str]:
            """Get an unused place_id from the category"""
            if category not in available_places:
                return None
            for place_id in available_places[category]:
                if place_id not in exclude_ids:
                    return place_id
            return None
        
        # Check accommodation suggestions
        for acc in itinerary_data.get('accommodation_suggestions', []):
            place_id = acc.get('place_id')
            if place_id:
                if place_id in used_place_ids:
                    # Replace with unused hotel
                    new_id = get_unused_place_id('hotels', used_place_ids)
                    if new_id:
                        print(f"      ⚠️  Duplicate hotel {place_id} → replaced with {new_id}")
                        acc['place_id'] = new_id
                        used_place_ids.add(new_id)
                        duplicates_found += 1
                else:
                    used_place_ids.add(place_id)
                    if not hotel_place_id:
                        hotel_place_id = place_id  # Remember first hotel for check-in/out
        
        # Check daily plans
        for day_plan in itinerary_data.get('daily_plans', []):
            # Check activities
            for activity in day_plan.get('activities', []):
                place_id = activity.get('place_id')
                if place_id:
                    # Allow hotel to appear twice (check-in and check-out)
                    if place_id == hotel_place_id and activity.get('type') == 'accommodation':
                        continue
                    
                    if place_id in used_place_ids:
                        # Determine category from place_id prefix
                        category = place_id.split('_')[0] if '_' in place_id else 'attractions'
                        new_id = get_unused_place_id(category, used_place_ids)
                        if new_id:
                            print(f"      ⚠️  Duplicate activity {place_id} → replaced with {new_id}")
                            activity['place_id'] = new_id
                            used_place_ids.add(new_id)
                            duplicates_found += 1
                    else:
                        used_place_ids.add(place_id)
            
            # Check meals
            for meal in day_plan.get('meals', []):
                place_id = meal.get('place_id')
                if place_id:
                    if place_id in used_place_ids:
                        # Determine category from place_id prefix
                        category = place_id.split('_')[0] if '_' in place_id else 'restaurants'
                        new_id = get_unused_place_id(category, used_place_ids)
                        if new_id:
                            print(f"      ⚠️  Duplicate meal {place_id} → replaced with {new_id}")
                            meal['place_id'] = new_id
                            used_place_ids.add(new_id)
                            duplicates_found += 1
                    else:
                        used_place_ids.add(place_id)
        
        if duplicates_found > 0:
            print(f"   ✅ Fixed {duplicates_found} duplicate place_ids")
        else:
            print(f"   ✅ No duplicate place_ids found")
        
        # Update place_ids_used list
        itinerary_data['place_ids_used'] = list(used_place_ids)
        
        return itinerary_data
    
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

    def _create_places_summary_for_llm(
        self,
        all_places_data: Dict[str, List[Dict[str, Any]]],
        summary_limit: Optional[int] = None,
    ) -> str:
        """Create a MINIMAL summary of available places for the LLM (optimized for speed)"""
        
        summary_lines = []
        limit = summary_limit or self.base_summary_limit

        for category, places in all_places_data.items():
            if not places:
                continue
                
            summary_lines.append(f"\n{category.upper()}:")
            for place in places[:limit]:  # Limit per category for prompt size
                place_id = place.get('place_id', 'unknown')
                name = place.get('title', place.get('name', 'Unknown'))
                rating = place.get('rating', 0)
                
                # MINIMAL description - only ID, name, and rating (no address, no price)
                # This reduces prompt tokens by ~70% and speeds up Gemini significantly
                description = f"  - {place_id}: {name}"
                if rating:
                    description += f" (★{rating})"

                summary_lines.append(description)
        
        return '\n'.join(summary_lines)
    
    async def _map_places_to_complete_data(self, itinerary_response: Dict[str, Any], 
                                         all_places_data: Dict[str, List[Dict[str, Any]]], 
                                         weather_data: Optional[Dict[str, Any]] = None,
                                         request: Optional[Request] = None) -> Dict[str, Any]:
        """Map place IDs from itinerary to complete metadata"""
        
        await self._check_request(request)
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

        # Align itinerary content with prefetched metadata
        self._apply_place_metadata_to_itinerary(itinerary_response, place_id_map)

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
        
        total_budget, daily_costs = self._calculate_budget_breakdown(itinerary_response, place_id_map)
        if total_budget:
            itinerary_response['budget_estimate'] = round(total_budget, 2)

        if daily_costs:
            for day_plan, costs in zip(itinerary_response.get('daily_plans', []), daily_costs):
                if not costs:
                    continue
                day_plan.setdefault('budget_breakdown', {}).update(costs)

        # Build complete response with photo prefetch metadata
        await self._check_request(request)
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
        
        # Proxy all image URLs to avoid Google rate limits
        try:
            from utils.image_utils import proxy_all_images_in_response, get_backend_url_from_request
            backend_url = get_backend_url_from_request(request)
            complete_response = proxy_all_images_in_response(complete_response, backend_url)
            print(f"      🖼️  Proxied all image URLs through backend")
        except Exception as e:
            logger.warning(f"Failed to proxy image URLs: {str(e)}")
        
        # Extract and add photo prefetch metadata
        try:
            from services.photo_prefetch_service import photo_prefetch_service
            photo_urls = photo_prefetch_service.extract_all_photo_urls(complete_response)
            prefetch_metadata = photo_prefetch_service.generate_prefetch_metadata(photo_urls)
            complete_response["photo_prefetch"] = prefetch_metadata
            print(f"      📸 Photo prefetch: {len(photo_urls)} URLs ready for automatic loading")
        except Exception as e:
            logger.warning(f"Failed to generate photo prefetch metadata: {str(e)}")
            complete_response["photo_prefetch"] = {"photo_urls": [], "total_photos": 0}
        
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

    async def _check_request(self, request: Optional[Request]) -> None:
        if request and await request.is_disconnected():
            raise HTTPException(status_code=499, detail="Client disconnected")

    def _apply_place_metadata_to_itinerary(self, itinerary: Dict[str, Any], place_map: Dict[str, Dict[str, Any]]) -> None:
        """Ensure itinerary entries reuse SERP metadata (names, pricing, etc.)."""

        if not itinerary or not place_map:
            return

        # Update accommodation suggestions
        for accommodation in itinerary.get('accommodation_suggestions', []):
            place = place_map.get(accommodation.get('place_id'))
            if not place:
                continue

            if place.get('title'):
                accommodation['name'] = place.get('title')
            if place.get('address'):
                accommodation['location'] = place.get('address')
            if place.get('price_range'):
                accommodation['price_range'] = place['price_range']

        # Update daily plans
        for day in itinerary.get('daily_plans', []):
            # Activities
            for activity in day.get('activities', []):
                place = place_map.get(activity.get('place_id'))
                if not place:
                    continue

                if place.get('title'):
                    activity['title'] = place.get('title')
                if place.get('estimated_cost') is not None:
                    activity['estimated_cost'] = f"${place['estimated_cost']}"
                elif place.get('price_range'):
                    activity['estimated_cost'] = place['price_range']

            # Meals
            for meal in day.get('meals', []):
                place = place_map.get(meal.get('place_id'))
                if not place:
                    continue

                if place.get('title'):
                    meal['name'] = place.get('title')
                if place.get('price_range'):
                    meal['price_range'] = place['price_range']
                if place.get('cuisine'):
                    meal['cuisine'] = place['cuisine']

            # Transportation: ensure numeric costs remain strings with currency
            for transport in day.get('transportation', []):
                cost = transport.get('cost')
                if isinstance(cost, (int, float)):
                    transport['cost'] = f"${cost}"

    def _calculate_budget_breakdown(
        self,
        itinerary: Dict[str, Any],
        place_map: Dict[str, Dict[str, Any]]
    ) -> Tuple[float, List[Dict[str, float]]]:
        """Compute budget estimate using SERP price data."""

        if not itinerary:
            return 0.0, []

        daily_plans = itinerary.get('daily_plans', []) or []
        total_days = len(daily_plans)
        if total_days == 0:
            return 0.0, []

        # Accommodation: use first suggestion if available
        accommodation_cost = 0.0
        if itinerary.get('accommodation_suggestions'):
            first_acc = itinerary['accommodation_suggestions'][0]
            acc_place = place_map.get(first_acc.get('place_id')) if place_map else None
            price_source = (acc_place or first_acc).get('price_range') or first_acc.get('price')
            if price_source:
                accommodation_cost = self._parse_price_value(price_source)

        total_budget = 0.0
        daily_breakdowns: List[Dict[str, float]] = []

        for day in daily_plans:
            meals_cost = sum(
                self._parse_price_value(meal.get('price_range'))
                for meal in day.get('meals', [])
            )

            activities_cost = sum(
                self._parse_price_value(activity.get('estimated_cost'))
                for activity in day.get('activities', [])
            )

            transport_cost = sum(
                self._parse_price_value(transport.get('cost'))
                for transport in day.get('transportation', [])
            )

            day_total = meals_cost + activities_cost + transport_cost + accommodation_cost
            total_budget += day_total

            daily_breakdowns.append({
                'meals': f"${round(meals_cost, 2)}" if meals_cost else "$0",
                'activities': f"${round(activities_cost, 2)}" if activities_cost else "$0",
                'transport': f"${round(transport_cost, 2)}" if transport_cost else "$0",
                'accommodation': f"${round(accommodation_cost, 2)}" if accommodation_cost else "$0",
                'total': f"${round(day_total, 2)}"
            })

        if total_budget:
            itinerary.setdefault('budget_breakdown', {})
            itinerary['budget_breakdown']['total'] = f"${round(total_budget, 2)}"
            itinerary['budget_breakdown']['per_day_average'] = f"${round(total_budget / total_days, 2)}"

        return total_budget, daily_breakdowns

    def _parse_price_value(self, value: Any) -> float:
        """Extract an average numeric value from price strings like '$25-40'."""

        if value is None:
            return 0.0

        if isinstance(value, (int, float)):
            return float(value)

        if not isinstance(value, str):
            return 0.0

        amounts = re.findall(r'\$([0-9]+(?:\.[0-9]+)?)', value)
        if not amounts:
            amounts = re.findall(r'₹([0-9]+(?:\.[0-9]+)?)', value)

        if not amounts:
            return 0.0

        numbers = [float(amount) for amount in amounts]
        return sum(numbers) / len(numbers)

    def _filter_prefetched_places(
        self,
        places: List[Dict[str, Any]],
        category: str,
        max_results: int
    ) -> List[Dict[str, Any]]:
        """Reduce prompt payload by filtering duplicates and low-quality places."""

        if not places:
            return []

        seen_ids = set()
        seen_titles = set()
        min_rating = self.min_ratings.get(category.rstrip('s'), self.min_ratings.get(category, 0))

        filtered: List[Dict[str, Any]] = []
        for place in places:
            place_id = place.get("place_id")
            title = (place.get("title") or place.get("name") or "").strip().lower()

            if place_id and place_id in seen_ids:
                continue
            if title and title in seen_titles:
                continue

            rating = place.get("rating")
            try:
                rating_value = float(rating) if rating is not None else None
            except (TypeError, ValueError):
                rating_value = None

            if min_rating and rating_value is not None and rating_value < min_rating:
                continue

            if place_id:
                seen_ids.add(place_id)
            if title:
                seen_titles.add(title)

            filtered.append(place)

            if len(filtered) >= max_results:
                break

        # If filtering removed too many entries, fall back to the first max_results items
        if not filtered:
            return places[:max_results]

        return filtered

    def _calculate_dynamic_limits(self, start_date: str, end_date: str) -> Tuple[Dict[str, int], int]:
        """Scale prefetch and summary limits based on trip length."""

        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        total_days = max((end - start).days + 1, 1)

        multiplier = max((total_days - 4) // 2, 0)

        dynamic_limits: Dict[str, int] = {}
        for category, base_limit in self.base_prefetch_limits.items():
            growth = self.prefetch_growth_per_two_days.get(category, 0) * multiplier
            cap = self.max_prefetch_limits.get(category, base_limit)
            dynamic_limits[category] = min(base_limit + growth, cap)

        summary_limit = min(self.base_summary_limit + multiplier, self.max_summary_limit)

        print(f"   📈 Dynamic limits for {total_days}-day trip: {dynamic_limits}, summary limit: {summary_limit}")

        return dynamic_limits, summary_limit
