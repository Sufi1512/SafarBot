"""
Service for getting additional places suggestions beyond the itinerary
Returns all places found during SERP searches as "You might also like" suggestions
"""

import logging
from typing import List, Dict, Any, Optional
from tools.places_search_tool import PlacesSearchTool
from models import SerpSearchResponse
import asyncio

logger = logging.getLogger(__name__)

class AdditionalPlacesService:
    """Service to provide additional place suggestions"""
    
    def __init__(self):
        """Initialize the additional places service"""
        self.places_tool = PlacesSearchTool()
        print("🌟 ADDITIONAL PLACES SERVICE - Initialized")
    
    async def get_all_place_suggestions(self, destination: str, interests: List[str]) -> Dict[str, Any]:
        """
        Get comprehensive place suggestions for a destination
        Returns ALL places found during searches, not just the limited ones in itinerary
        
        Args:
            destination: Travel destination
            interests: User interests to tailor suggestions
            
        Returns:
            Dictionary with categorized place suggestions
        """
        print(f"\n🌟 ADDITIONAL PLACES SERVICE - Finding all places in {destination}")
        print("-" * 70)
        
        all_suggestions = {
            "destination": destination,
            "hotels": [],
            "restaurants": [],
            "cafes": [],
            "attractions": [],
            "activities": [],
            "shopping": [],
            "nightlife": [],
            "total_places_found": 0
        }
        
        try:
            # Search with higher limits to get more comprehensive results
            print(f"   🏨 Searching ALL hotels in {destination}")
            hotels = await self.places_tool.search_hotels(
                location=destination,
                max_results=20  # Much higher than itinerary limit
            )
            all_suggestions["hotels"] = hotels
            print(f"      ✅ Found {len(hotels)} hotels")
            
            print(f"   🍽️  Searching ALL restaurants in {destination}")
            restaurants = await self.places_tool.search_restaurants(
                location=destination,
                max_results=25  # Much higher than itinerary limit
            )
            all_suggestions["restaurants"] = restaurants
            print(f"      ✅ Found {len(restaurants)} restaurants")
            
            print(f"   ☕ Searching ALL cafes in {destination}")
            cafes = await self.places_tool.search_cafes(
                location=destination,
                max_results=15  # Much higher than itinerary limit
            )
            all_suggestions["cafes"] = cafes
            print(f"      ✅ Found {len(cafes)} cafes")
            
            print(f"   🎯 Searching ALL attractions in {destination}")
            attractions = await self.places_tool.search_attractions(
                location=destination,
                interests=interests,
                max_results=30  # Much higher than itinerary limit
            )
            all_suggestions["attractions"] = attractions
            print(f"      ✅ Found {len(attractions)} attractions")
            
            # Search for interest-specific places
            print(f"   🎪 Searching interest-based places")
            interest_places = await self._search_interest_places(destination, interests)
            all_suggestions.update(interest_places)
            
            # Calculate totals
            total_found = sum([
                len(all_suggestions["hotels"]),
                len(all_suggestions["restaurants"]),
                len(all_suggestions["cafes"]),
                len(all_suggestions["attractions"]),
                len(all_suggestions["activities"]),
                len(all_suggestions["shopping"]),
                len(all_suggestions["nightlife"])
            ])
            
            all_suggestions["total_places_found"] = total_found
            
            print(f"\n   📊 TOTAL ADDITIONAL PLACES FOUND: {total_found}")
            print(f"      🏨 Hotels: {len(all_suggestions['hotels'])}")
            print(f"      🍽️  Restaurants: {len(all_suggestions['restaurants'])}")
            print(f"      ☕ Cafes: {len(all_suggestions['cafes'])}")
            print(f"      🎯 Attractions: {len(all_suggestions['attractions'])}")
            print(f"      🎪 Activities: {len(all_suggestions['activities'])}")
            print(f"      🛍️  Shopping: {len(all_suggestions['shopping'])}")
            print(f"      🌃 Nightlife: {len(all_suggestions['nightlife'])}")
            
            return all_suggestions
            
        except Exception as e:
            print(f"   ❌ Error getting additional places: {str(e)}")
            logger.error(f"Error getting additional places for {destination}: {str(e)}")
            return all_suggestions
    
    async def _search_interest_places(self, destination: str, interests: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """Search for places based on specific user interests"""
        
        interest_places = {
            "activities": [],
            "shopping": [],
            "nightlife": []
        }
        
        try:
            # Map interests to search queries
            interest_mapping = {
                "nightlife": ["bars", "clubs", "pubs", "nightlife"],
                "shopping": ["shopping malls", "markets", "boutiques", "shopping districts"],
                "activities": ["activities", "entertainment", "recreation", "experiences"],
                "beaches": ["beaches", "beach clubs", "waterfront"],
                "hiking": ["hiking trails", "nature walks", "parks"],
                "culture": ["museums", "galleries", "cultural centers"],
                "history": ["historical sites", "monuments", "heritage"],
                "art": ["art galleries", "art museums", "studios"],
                "food": ["food markets", "street food", "local cuisine"],
                "sports": ["sports venues", "stadiums", "sports activities"],
                "relaxation": ["spas", "wellness centers", "peaceful places"]
            }
            
            for interest in interests:
                if interest.lower() in interest_mapping:
                    queries = interest_mapping[interest.lower()]
                    
                    for query in queries[:2]:  # Limit to 2 queries per interest
                        print(f"      🔍 Searching {query} in {destination}")
                        
                        # Use raw SERP search for more comprehensive results
                        places = await self._raw_serp_search(f"{query} in {destination}")
                        
                        # Categorize results
                        if "nightlife" in query or "bar" in query or "club" in query:
                            interest_places["nightlife"].extend(places[:10])
                        elif "shopping" in query or "market" in query or "mall" in query:
                            interest_places["shopping"].extend(places[:10])
                        else:
                            interest_places["activities"].extend(places[:10])
            
            # Remove duplicates and limit results
            for category in interest_places:
                interest_places[category] = self._remove_duplicates(interest_places[category])[:15]
                print(f"      ✅ {category.title()}: {len(interest_places[category])} places")
                
        except Exception as e:
            print(f"      ❌ Error searching interest places: {str(e)}")
            logger.error(f"Error searching interest places: {str(e)}")
        
        return interest_places
    
    async def _raw_serp_search(self, query: str) -> List[Dict[str, Any]]:
        """Perform raw SERP search and return results"""
        
        if not self.places_tool.api_key:
            return []
        
        try:
            import serpapi
            
            search = serpapi.GoogleSearch({
                "q": query,
                "api_key": self.places_tool.api_key,
                "engine": "google_maps",
                "type": "search",
                "num": 15
            })
            
            results = search.get_dict()
            local_results = results.get("local_results", [])
            
            # Convert to our format
            formatted_results = []
            for place in local_results:
                formatted_place = {
                    "place_id": place.get("place_id", ""),
                    "name": place.get("title", ""),
                    "address": place.get("address", ""),
                    "rating": place.get("rating", 0),
                    "reviews": place.get("reviews", 0),
                    "type": place.get("type", ""),
                    "price": place.get("price", ""),
                    "thumbnail": place.get("thumbnail", ""),
                    "gps_coordinates": place.get("gps_coordinates", {}),
                    "hours": place.get("hours", ""),
                    "phone": place.get("phone", ""),
                    "website": place.get("website", ""),
                    "description": place.get("description", "")
                }
                formatted_results.append(formatted_place)
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error in raw SERP search: {str(e)}")
            return []
    
    def _remove_duplicates(self, places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate places based on name and address"""
        
        seen = set()
        unique_places = []
        
        for place in places:
            # Create a key based on name and address
            key = f"{place.get('name', '').lower()}_{place.get('address', '').lower()}"
            
            if key not in seen and place.get('name'):
                seen.add(key)
                unique_places.append(place)
        
        return unique_places
    
    def format_for_frontend(self, suggestions: Dict[str, Any]) -> Dict[str, Any]:
        """Format suggestions for frontend consumption"""
        
        return {
            "destination": suggestions["destination"],
            "summary": {
                "total_places": suggestions["total_places_found"],
                "categories": {
                    "accommodation": len(suggestions["hotels"]),
                    "dining": len(suggestions["restaurants"]) + len(suggestions["cafes"]),
                    "attractions": len(suggestions["attractions"]),
                    "activities": len(suggestions["activities"]),
                    "shopping": len(suggestions["shopping"]),
                    "nightlife": len(suggestions["nightlife"])
                }
            },
            "suggestions": {
                "accommodation": {
                    "hotels": suggestions["hotels"],
                    "total": len(suggestions["hotels"])
                },
                "dining": {
                    "restaurants": suggestions["restaurants"],
                    "cafes": suggestions["cafes"],
                    "total": len(suggestions["restaurants"]) + len(suggestions["cafes"])
                },
                "attractions": {
                    "places": suggestions["attractions"],
                    "total": len(suggestions["attractions"])
                },
                "activities": {
                    "places": suggestions["activities"],
                    "total": len(suggestions["activities"])
                },
                "shopping": {
                    "places": suggestions["shopping"],
                    "total": len(suggestions["shopping"])
                },
                "nightlife": {
                    "places": suggestions["nightlife"],
                    "total": len(suggestions["nightlife"])
                }
            },
            "message": f"Found {suggestions['total_places_found']} additional places you might enjoy in {suggestions['destination']}!"
        }
