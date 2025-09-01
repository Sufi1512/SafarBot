"""
Coordinate Service - Provides coordinates for cities and destinations
"""

import logging
from typing import Dict, Tuple, Optional
from tools.places_search_tool import PlacesSearchTool
import serpapi

logger = logging.getLogger(__name__)

class CoordinateService:
    """Service to get coordinates for destinations and places"""
    
    def __init__(self):
        """Initialize the coordinate service"""
        self.places_tool = PlacesSearchTool()
        self.city_coordinates = self._get_common_city_coordinates()
        print("🗺️  COORDINATE SERVICE - Initialized")
    
    def _get_common_city_coordinates(self) -> Dict[str, Tuple[float, float]]:
        """Get a dictionary of common city coordinates"""
        return {
            # Major global cities
            'new york': (40.7128, -74.0060),
            'london': (51.5074, -0.1278),
            'paris': (48.8566, 2.3522),
            'tokyo': (35.6762, 139.6503),
            'rome': (41.9028, 12.4964),
            'barcelona': (41.3851, 2.1734),
            'sydney': (-33.8688, 151.2093),
            'dubai': (25.2048, 55.2708),
            'singapore': (1.3521, 103.8198),
            'mumbai': (19.0760, 72.8777),
            'delhi': (28.7041, 77.1025),
            'bangalore': (12.9716, 77.5946),
            'istanbul': (41.0082, 28.9784),
            'amsterdam': (52.3676, 4.9041),
            'berlin': (52.5200, 13.4050),
            'madrid': (40.4168, -3.7038),
            'los angeles': (34.0522, -118.2437),
            'san francisco': (37.7749, -122.4194),
            'chicago': (41.8781, -87.6298),
            'toronto': (43.6510, -79.3470),
            'vancouver': (49.2827, -123.1207),
            'beijing': (39.9042, 116.4074),
            'shanghai': (31.2304, 121.4737),
            'hong kong': (22.3193, 114.1694),
            'seoul': (37.5665, 126.9780),
            'bangkok': (13.7563, 100.5018),
            'kuala lumpur': (3.1390, 101.6869),
            'jakarta': (-6.2088, 106.8456),
            'manila': (14.5995, 120.9842),
            'moscow': (55.7558, 37.6176),
            'st petersburg': (59.9311, 30.3609),
            'cairo': (30.0444, 31.2357),
            'cape town': (-33.9249, 18.4241),
            'johannesburg': (-26.2041, 28.0473),
            'lagos': (6.5244, 3.3792),
            'nairobi': (-1.2921, 36.8219),
            'rio de janeiro': (-22.9068, -43.1729),
            'sao paulo': (-23.5558, -46.6396),
            'buenos aires': (-34.6118, -58.3960),
            'mexico city': (19.4326, -99.1332),
            'lima': (-12.0464, -77.0428),
            'miami': (25.7617, -80.1918),
            'las vegas': (36.1699, -115.1398),
            'seattle': (47.6062, -122.3321),
            'denver': (39.7392, -104.9903),
            'austin': (30.2672, -97.7431),
            'montreal': (45.5017, -73.5673),
            'oslo': (59.9139, 10.7522),
            'stockholm': (59.3293, 18.0686),
            'copenhagen': (55.6761, 12.5683),
            'helsinki': (60.1699, 24.9384),
            'vienna': (48.2082, 16.3738),
            'zurich': (47.3769, 8.5417),
            'geneva': (46.2044, 6.1432),
            'brussels': (50.8503, 4.3517),
            'lisbon': (38.7223, -9.1393),
            'prague': (50.0755, 14.4378),
            'warsaw': (52.2297, 21.0122),
            'budapest': (47.4979, 19.0402),
            'dublin': (53.3498, -6.2603),
            'edinburgh': (55.9533, -3.1883),
            'athens': (37.9838, 23.7275),
            'tel aviv': (32.0853, 34.7818),
            'casablanca': (33.5731, -7.5898),
            'marrakech': (31.6295, -7.9811),
            'tunis': (36.8065, 10.1815),
            'tehran': (35.6892, 51.3890),
            'karachi': (24.8607, 67.0011),
            'lahore': (31.5804, 74.3587),
            'islamabad': (33.7294, 73.0931),
            'dhaka': (23.8103, 90.4125),
            'colombo': (6.9271, 79.8612),
            'kathmandu': (27.7172, 85.3240),
            'almaty': (43.2381, 76.9452),
            'tashkent': (41.2995, 69.2401),
        }
    
    async def get_destination_coordinates(self, destination: str) -> Tuple[float, float]:
        """
        Get coordinates for a destination
        
        Args:
            destination: Name of the destination city/location
            
        Returns:
            Tuple of (latitude, longitude)
        """
        print(f"\n🗺️  COORDINATE SERVICE - Getting coordinates for: {destination}")
        
        # Normalize destination name
        dest_lower = destination.lower().strip()
        
        # First check our common cities cache
        if dest_lower in self.city_coordinates:
            coords = self.city_coordinates[dest_lower]
            print(f"      ✅ Found in cache: {coords}")
            return coords
        
        # Try to get from SERP API if available
        try:
            coords = await self._get_coordinates_from_serp(destination)
            if coords:
                print(f"      ✅ Found via SERP API: {coords}")
                return coords
        except Exception as e:
            print(f"      ⚠️  SERP API error: {str(e)}")
            logger.warning(f"Failed to get coordinates via SERP API for {destination}: {str(e)}")
        
        # Fallback to global default (New York)
        fallback_coords = (40.7128, -74.0060)
        print(f"      ⚠️  Using fallback coordinates: {fallback_coords}")
        return fallback_coords
    
    async def _get_coordinates_from_serp(self, destination: str) -> Optional[Tuple[float, float]]:
        """Get coordinates from SERP API"""
        
        if not self.places_tool.api_key:
            return None
        
        try:
            search = serpapi.GoogleSearch({
                "engine": "google_maps",
                "q": destination,
                "api_key": self.places_tool.api_key
            })
            
            results = search.get_dict()
            
            # Check if we got place results with coordinates
            place_results = results.get('place_results', {})
            if place_results and 'gps_coordinates' in place_results:
                gps = place_results['gps_coordinates']
                return (gps.get('latitude'), gps.get('longitude'))
            
            # Check local results
            local_results = results.get('local_results', [])
            if local_results:
                first_result = local_results[0]
                gps = first_result.get('gps_coordinates', {})
                if 'latitude' in gps and 'longitude' in gps:
                    return (gps['latitude'], gps['longitude'])
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting coordinates from SERP for {destination}: {str(e)}")
            return None
    
    def get_coordinates_for_frontend(self, destination: str) -> Dict[str, float]:
        """
        Get coordinates in frontend format
        
        Returns:
            Dict with 'lat' and 'lng' keys
        """
        # For now, use synchronous lookup from cache
        dest_lower = destination.lower().strip()
        
        if dest_lower in self.city_coordinates:
            lat, lng = self.city_coordinates[dest_lower]
            return {"lat": lat, "lng": lng}
        
        # Fallback
        return {"lat": 40.7128, "lng": -74.0060}
