"""
Unified Itinerary Service - Returns everything in one API call
- Basic itinerary structure
- ALL additional places discovered during search
- Complete place details for each location
- Single response, no multiple endpoints needed
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from services.itinerary_service import ItineraryService
from services.additional_places_service import AdditionalPlacesService
from tools.places_search_tool import PlacesSearchTool
import asyncio

logger = logging.getLogger(__name__)

class UnifiedItineraryService:
    """Service that returns complete itinerary + all additional places in one call"""
    
    def __init__(self):
        """Initialize the unified service"""
        self.itinerary_service = ItineraryService()
        self.additional_places_service = AdditionalPlacesService()
        self.places_tool = PlacesSearchTool()
        print("🚀 UNIFIED ITINERARY SERVICE - Initialized")
    
    async def generate_complete_itinerary(
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
        Generate complete itinerary + all additional places in ONE API call
        
        Returns:
        {
            "itinerary": { ... basic itinerary structure ... },
            "additional_places": { ... all discovered places ... },
            "summary": { ... combined statistics ... }
        }
        """
        print(f"\n🚀 UNIFIED SERVICE - Generating complete travel package for {destination}")
        print("="*80)
        
        try:
            # Run both services in parallel for maximum speed
            print("⚡ Running itinerary generation and places discovery in parallel...")
            
            # Execute both tasks simultaneously
            itinerary_task = self.itinerary_service.generate_itinerary(
                destination=destination,
                start_date=start_date,
                end_date=end_date,
                budget=budget,
                interests=interests,
                travelers=travelers,
                accommodation_type=accommodation_type
            )
            
            additional_places_task = self.additional_places_service.get_all_place_suggestions(
                destination=destination,
                interests=interests
            )
            
            # Wait for both to complete
            itinerary_response, additional_places_data = await asyncio.gather(
                itinerary_task,
                additional_places_task,
                return_exceptions=True
            )
            
            # Handle any exceptions
            if isinstance(itinerary_response, Exception):
                print(f"❌ Itinerary generation failed: {str(itinerary_response)}")
                itinerary_response = None
            
            if isinstance(additional_places_data, Exception):
                print(f"❌ Additional places failed: {str(additional_places_data)}")
                additional_places_data = {"total_places_found": 0}
            
            print("✅ Both tasks completed - Compiling unified response")
            
            # Convert itinerary to dict format
            itinerary_dict = None
            if itinerary_response:
                itinerary_dict = itinerary_response.model_dump()
            
            # Format additional places
            formatted_additional = {}
            if additional_places_data:
                formatted_additional = self.additional_places_service.format_for_frontend(additional_places_data)
            
            # Create unified response
            unified_response = {
                "success": True,
                "destination": destination,
                "dates": {
                    "start_date": start_date,
                    "end_date": end_date,
                    "total_days": itinerary_dict.get("total_days", 0) if itinerary_dict else 0
                },
                "request_info": {
                    "budget": budget,
                    "interests": interests,
                    "travelers": travelers,
                    "accommodation_type": accommodation_type
                },
                
                # Core itinerary (limited places for actual travel plan)
                "itinerary": itinerary_dict or self._create_fallback_itinerary(destination, start_date),
                
                # ALL additional places (comprehensive exploration options)
                "additional_places": formatted_additional.get("suggestions", {}),
                
                # Combined summary
                "summary": {
                    "itinerary": {
                        "days_planned": itinerary_dict.get("total_days", 0) if itinerary_dict else 0,
                        "budget_estimate": itinerary_dict.get("budget_estimate", 0) if itinerary_dict else 0,
                        "activities_planned": sum(len(day.activities) for day in itinerary_response.daily_plans) if itinerary_response else 0
                    },
                    "additional_options": formatted_additional.get("summary", {}) if formatted_additional else {},
                    "total_places_available": formatted_additional.get("summary", {}).get("total_places", 0) if formatted_additional else 0
                },
                
                # Usage guide for frontend
                "usage_guide": {
                    "itinerary_section": "Use 'itinerary' for the main travel plan display",
                    "explore_more_sections": {
                        "hotels": "additional_places.accommodation.hotels",
                        "restaurants": "additional_places.dining.restaurants", 
                        "cafes": "additional_places.dining.cafes",
                        "attractions": "additional_places.attractions.places",
                        "activities": "additional_places.activities.places",
                        "nightlife": "additional_places.nightlife.places",
                        "shopping": "additional_places.shopping.places"
                    }
                },
                
                "message": f"Complete travel package for {destination} with {formatted_additional.get('summary', {}).get('total_places', 0) if formatted_additional else 0} additional places to explore!"
            }
            
            # Print summary
            print(f"\n📊 UNIFIED RESPONSE SUMMARY:")
            print("="*60)
            print(f"✅ Itinerary: {unified_response['summary']['itinerary']['days_planned']} days planned")
            print(f"✅ Budget: ${unified_response['summary']['itinerary']['budget_estimate']}")
            print(f"✅ Additional Places: {unified_response['summary']['total_places_available']} total options")
            if formatted_additional.get("summary", {}).get("categories"):
                categories = formatted_additional["summary"]["categories"]
                print(f"   🏨 Hotels: {categories.get('accommodation', 0)}")
                print(f"   🍽️  Dining: {categories.get('dining', 0)}")
                print(f"   🎯 Attractions: {categories.get('attractions', 0)}")
                print(f"   🎪 Activities: {categories.get('activities', 0)}")
                print(f"   🌃 Nightlife: {categories.get('nightlife', 0)}")
                print(f"   🛍️  Shopping: {categories.get('shopping', 0)}")
            
            print("="*80)
            print("🎉 UNIFIED RESPONSE READY - Everything in one API call!")
            
            return unified_response
            
        except Exception as e:
            print(f"❌ UNIFIED SERVICE ERROR: {str(e)}")
            logger.error(f"Error in unified itinerary service: {str(e)}")
            
            return {
                "success": False,
                "error": str(e),
                "destination": destination,
                "message": f"Failed to generate complete itinerary for {destination}"
            }
    
    def _create_fallback_itinerary(self, destination: str, start_date: str) -> Dict[str, Any]:
        """Create a basic fallback itinerary if main generation fails"""
        
        return {
            "destination": destination,
            "total_days": 1,
            "budget_estimate": 0,
            "daily_plans": [
                {
                    "day": 1,
                    "date": start_date,
                    "activities": [
                        {
                            "time": "10:00",
                            "title": f"Explore {destination}",
                            "description": f"Discover the highlights of {destination}",
                            "duration": "4 hours",
                            "cost": 0,
                            "type": "exploration"
                        }
                    ],
                    "meals": [],
                    "accommodation": {},
                    "transport": []
                }
            ],
            "recommendations": {
                "hotels": [],
                "restaurants": [],
                "tips": [f"Explore {destination} at your own pace"]
            }
        }
    
    def get_response_structure_info(self) -> Dict[str, Any]:
        """Return information about the unified response structure for frontend developers"""
        
        return {
            "unified_response_structure": {
                "itinerary": {
                    "description": "Core travel itinerary with limited, curated places",
                    "use_for": "Main itinerary display, day-by-day plans",
                    "contains": ["daily_plans", "budget_estimate", "accommodation_suggestions"]
                },
                "additional_places": {
                    "description": "ALL places found during search - comprehensive options",
                    "use_for": "'Explore More' sections, place browsing, recommendations",
                    "categories": {
                        "accommodation.hotels": "All hotels found (20+ options)",
                        "dining.restaurants": "All restaurants found (25+ options)",
                        "dining.cafes": "All cafes found (15+ options)",
                        "attractions.places": "All attractions found (30+ options)",
                        "activities.places": "All activities found (20+ options)",
                        "nightlife.places": "All nightlife found (15+ options)",
                        "shopping.places": "All shopping found (15+ options)"
                    }
                },
                "summary": {
                    "description": "Statistics and counts for both itinerary and additional places",
                    "use_for": "Displaying counts, progress indicators, UI badges"
                }
            },
            
            "frontend_usage_examples": {
                "main_itinerary_display": "response.itinerary.daily_plans",
                "explore_more_hotels": "response.additional_places.accommodation.hotels",
                "all_restaurants": "response.additional_places.dining.restaurants",
                "nightlife_section": "response.additional_places.nightlife.places",
                "total_places_count": "response.summary.total_places_available"
            },
            
            "performance_benefits": [
                "Single API call instead of 3-4 separate calls",
                "Parallel processing for maximum speed",
                "Complete data in one response",
                "No coordination needed between multiple endpoints",
                "Reduced network overhead and latency"
            ]
        }
