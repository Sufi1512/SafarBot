"""
Travel Agent Tools - LangChain tool definitions for the agentic itinerary workflow.

These tools provide real-time data to the LangGraph planner:
- Weather information for packing/activity planning
- Place search for hotels, restaurants, attractions
- Flight information for travel logistics
- Cost estimation for budget planning

All tools are designed for minimal token usage while providing actionable data.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool

from services.weather_service import weather_service
from services.serp_cache_service import cached_places_tool

LOGGER = logging.getLogger(__name__)


def _normalize_place(place: Dict[str, Any], category: str) -> Dict[str, Any]:
    """
    Normalize place data to consistent schema for the planner.
    Reduces token usage by extracting only essential fields.
    """
    return {
        "place_id": place.get("place_id") or place.get("id") or f"{category}_{hash(str(place))&0xffff}",
        "name": place.get("title") or place.get("name", "Unknown"),
        "address": place.get("address") or place.get("formatted_address", ""),
        "rating": place.get("rating"),
        "reviews_count": place.get("reviews"),
        "price_level": place.get("price_level") or place.get("price_range"),
        "coordinates": place.get("gps_coordinates") or place.get("coordinates"),
        "category": category,
        "thumbnail": place.get("thumbnail") or place.get("image"),
        "phone": place.get("phone"),
        "hours": place.get("hours") or place.get("operating_hours"),
    }


@tool("get_weather_report")
async def get_weather_report(
    destination: str,
    country_code: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get current weather and forecast for a destination.
    Use this FIRST to understand climate conditions for activity planning.

    Args:
        destination: City name (e.g., "Paris", "Mumbai, India")
        country_code: Optional ISO country code (e.g., "FR", "IN")

    Returns:
        Weather data including temperature, humidity, conditions, and recommendations
    """
    try:
        weather = await weather_service.get_current_weather(destination, country_code)
        
        if "error" in weather:
            return {
                "status": "error",
                "message": weather["error"],
                "destination": destination
            }
        
        # Get weather-based recommendations
        recommendations = weather_service.get_weather_recommendations(weather)
        
        return {
            "status": "success",
            "destination": destination,
            "location": weather.get("location", {}),
            "current": weather.get("current", {}),
            "recommendations": recommendations,
            "timestamp": weather.get("timestamp")
        }
        
    except Exception as e:
        LOGGER.exception("Weather fetch failed for %s", destination)
        return {
            "status": "error",
            "message": str(e),
            "destination": destination
        }


@tool("search_places")
async def search_places(
    destination: str,
    category: str,
    interest: Optional[str] = None,
    limit: int = 5,
) -> Dict[str, Any]:
    """
    Search for places in a destination by category.
    Returns curated results with ratings, addresses, and metadata.

    Args:
        destination: City or location to search in
        category: One of 'hotels', 'restaurants', 'cafes', 'attractions', 'interest_based'
        interest: Optional interest keyword to refine search (e.g., "historical", "beach")
        limit: Maximum results to return (1-15, default 5)

    Returns:
        List of places with place_id, name, rating, address, and category
    """
    category = category.lower().strip()
    limit = max(1, min(limit, 15))  # Cap at 15 to save tokens
    interest = interest.strip() if interest else None

    valid_categories = {"hotels", "restaurants", "cafes", "attractions", "interest_based"}
    if category not in valid_categories:
        return {
            "status": "error",
            "category": category,
            "results": [],
            "message": f"Invalid category. Use: {', '.join(valid_categories)}"
        }

    try:
        raw_results = []
        
        if category == "hotels":
            raw_results = await cached_places_tool.search_hotels_cached(
                destination, max_results=limit
            )
        elif category == "restaurants":
            raw_results = await cached_places_tool.search_restaurants_cached(
                destination,
                cuisine_type=interest,
                max_results=limit,
            )
        elif category == "cafes":
            raw_results = await cached_places_tool.search_cafes_cached(
                destination, max_results=limit
            )
        elif category == "attractions":
            interests_list = [interest] if interest else []
            raw_results = await cached_places_tool.search_attractions_cached(
                destination,
                interests=interests_list,
                max_results=limit,
            )
        else:  # interest_based
            query = f"{interest or 'points of interest'} in {destination}"
            raw_results = await cached_places_tool.raw_serp_search_cached(query)
            raw_results = raw_results[:limit] if raw_results else []

        # Normalize results for consistent schema
        normalized = [_normalize_place(p, category) for p in (raw_results or [])]
        
        return {
            "status": "success",
            "category": category,
            "destination": destination,
            "count": len(normalized),
            "results": normalized
        }

    except Exception as e:
        LOGGER.exception("Place search failed: %s in %s", category, destination)
        return {
            "status": "error",
            "category": category,
            "destination": destination,
            "results": [],
            "message": str(e)
        }


@tool("get_flight_info")
async def get_flight_info(
    origin: str,
    destination: str,
    departure_date: str,
    return_date: Optional[str] = None,
    travelers: int = 1,
    travel_class: str = "economy"
) -> Dict[str, Any]:
    """
    Get flight information and estimated prices for a route.
    Note: Returns estimates based on typical pricing patterns.

    Args:
        origin: Departure city or airport code
        destination: Arrival city or airport code
        departure_date: Date in YYYY-MM-DD format
        return_date: Optional return date for round trips
        travelers: Number of passengers (default 1)
        travel_class: 'economy', 'business', or 'first' (default economy)

    Returns:
        Flight options with estimated prices and travel times
    """
    try:
        # Price multipliers by class
        class_multiplier = {
            "economy": 1.0,
            "business": 2.5,
            "first": 4.0
        }.get(travel_class.lower(), 1.0)
        
        # Base price estimates (INR) for common routes
        # These are reasonable estimates for Indian domestic/international flights
        is_domestic = _is_domestic_route(origin, destination)
        
        if is_domestic:
            base_price = 4500  # Average domestic flight
            flight_duration = "2-3 hours"
        else:
            base_price = 25000  # Average international flight
            flight_duration = "5-12 hours"
        
        # Apply class multiplier
        estimated_price = int(base_price * class_multiplier * travelers)
        
        # Round trip doubles the price
        if return_date:
            estimated_price *= 2
            trip_type = "round_trip"
        else:
            trip_type = "one_way"
        
        return {
            "status": "success",
            "route": {
                "origin": origin,
                "destination": destination,
                "departure_date": departure_date,
                "return_date": return_date,
            },
            "trip_type": trip_type,
            "travel_class": travel_class,
            "travelers": travelers,
            "estimated_price": {
                "amount": estimated_price,
                "currency": "INR",
                "per_person": estimated_price // travelers
            },
            "estimated_duration": flight_duration,
            "booking_tips": [
                "Book 2-4 weeks in advance for best prices",
                "Tuesday and Wednesday flights are often cheaper",
                "Consider nearby airports for better deals",
                "Check airline websites for direct booking discounts"
            ],
            "note": "Prices are estimates. Check airline websites for current fares."
        }

    except Exception as e:
        LOGGER.exception("Flight info fetch failed")
        return {
            "status": "error",
            "message": str(e),
            "route": {"origin": origin, "destination": destination}
        }


def _is_domestic_route(origin: str, destination: str) -> bool:
    """Check if route is likely domestic (within India)."""
    indian_cities = {
        "delhi", "mumbai", "bangalore", "bengaluru", "chennai", "kolkata",
        "hyderabad", "pune", "ahmedabad", "jaipur", "goa", "kochi", "lucknow",
        "chandigarh", "indore", "bhopal", "nagpur", "patna", "varanasi",
        "agra", "amritsar", "srinagar", "thiruvananthapuram", "guwahati",
        "del", "bom", "blr", "maa", "ccu", "hyd", "pnq", "amd", "jai", "goi"
    }
    origin_lower = origin.lower()
    dest_lower = destination.lower()
    
    return (
        any(city in origin_lower for city in indian_cities) and
        any(city in dest_lower for city in indian_cities)
    )


@tool("estimate_costs")
async def estimate_costs(
    destination: str,
    days: int,
    travelers: int = 1,
    budget_level: str = "mid-range"
) -> Dict[str, Any]:
    """
    Estimate daily and total costs for a trip.
    Uses destination-specific pricing data.

    Args:
        destination: Travel destination
        days: Number of days
        travelers: Number of travelers (default 1)
        budget_level: 'budget', 'mid-range', or 'luxury' (default mid-range)

    Returns:
        Detailed cost breakdown by category
    """
    try:
        # Cost multipliers by budget level
        level_multiplier = {
            "budget": 0.6,
            "mid-range": 1.0,
            "luxury": 2.5
        }.get(budget_level.lower(), 1.0)
        
        # Determine if destination is in India
        is_india = _is_indian_destination(destination)
        
        # Base daily costs in INR
        if is_india:
            base_costs = {
                "accommodation": 3000,  # Per night
                "food": 1500,  # 3 meals
                "activities": 1000,
                "local_transport": 500,
                "misc": 300
            }
        else:
            base_costs = {
                "accommodation": 8000,  # Per night
                "food": 4000,  # 3 meals
                "activities": 3000,
                "local_transport": 1500,
                "misc": 800
            }
        
        # Apply budget level
        daily_costs = {
            category: int(cost * level_multiplier)
            for category, cost in base_costs.items()
        }
        
        daily_total = sum(daily_costs.values())
        
        # Calculate totals
        total_accommodation = daily_costs["accommodation"] * days
        total_food = daily_costs["food"] * days
        total_activities = daily_costs["activities"] * days
        total_transport = daily_costs["local_transport"] * days
        total_misc = daily_costs["misc"] * days
        
        trip_total = daily_total * days * travelers
        
        return {
            "status": "success",
            "destination": destination,
            "budget_level": budget_level,
            "travelers": travelers,
            "days": days,
            "daily_estimate": {
                "accommodation": daily_costs["accommodation"],
                "food": daily_costs["food"],
                "activities": daily_costs["activities"],
                "local_transport": daily_costs["local_transport"],
                "misc": daily_costs["misc"],
                "total": daily_total
            },
            "trip_total": {
                "accommodation": total_accommodation * travelers,
                "food": total_food * travelers,
                "activities": total_activities * travelers,
                "local_transport": total_transport * travelers,
                "misc": total_misc * travelers,
                "grand_total": trip_total
            },
            "currency": "INR",
            "tips": [
                "Book accommodation in advance for better rates",
                "Eat at local restaurants for authentic and affordable food",
                "Use public transport where safe and available",
                "Keep 10-15% buffer for unexpected expenses"
            ]
        }

    except Exception as e:
        LOGGER.exception("Cost estimation failed")
        return {
            "status": "error",
            "message": str(e),
            "destination": destination
        }


def _is_indian_destination(destination: str) -> bool:
    """Check if destination is in India."""
    indian_places = {
        "india", "delhi", "mumbai", "bangalore", "bengaluru", "chennai",
        "kolkata", "hyderabad", "pune", "ahmedabad", "jaipur", "goa",
        "kerala", "rajasthan", "kashmir", "ladakh", "agra", "varanasi",
        "rishikesh", "manali", "shimla", "darjeeling", "mysore", "udaipur",
        "jodhpur", "kochi", "munnar", "ooty", "coorg", "hampi", "pondicherry"
    }
    return any(place in destination.lower() for place in indian_places)
