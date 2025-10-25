"""
Service for fetching detailed place information including images, reviews, coordinates, etc.
"""

import logging
from typing import List, Dict, Any, Optional
from models import PlaceDetails, PlaceImage, PlaceReview, PlaceLocation
from tools.places_search_tool import PlacesSearchTool
import asyncio
import serpapi

logger = logging.getLogger(__name__)

class PlaceDetailsService:
    """Service to provide detailed information about places"""
    
    def __init__(self):
        """Initialize the place details service"""
        self.places_tool = PlacesSearchTool()
        print("🏢 PLACE DETAILS SERVICE - Initialized")
    
    async def get_place_details(self, place_ids: List[str]) -> List[PlaceDetails]:
        """
        Get detailed information for a list of place IDs
        
        Args:
            place_ids: List of place IDs to get details for
            
        Returns:
            List of PlaceDetails objects with complete information
        """
        print(f"\n🔍 PLACE DETAILS SERVICE - Fetching details for {len(place_ids)} places")
        print("-" * 60)
        
        place_details = []
        
        for place_id in place_ids:
            try:
                print(f"   📍 Processing place ID: {place_id}")
                
                # Determine place type from ID
                place_type = self._extract_place_type(place_id)
                print(f"      🏷️  Type: {place_type}")
                
                # Get detailed information based on type
                details = await self._fetch_place_details(place_id, place_type)
                
                if details:
                    place_details.append(details)
                    print(f"      ✅ Details fetched successfully")
                else:
                    print(f"      ⚠️  No details found for {place_id}")
                    
            except Exception as e:
                print(f"      ❌ Error fetching details for {place_id}: {str(e)}")
                logger.error(f"Error fetching place details for {place_id}: {str(e)}")
        
        print(f"\n📊 TOTAL PLACE DETAILS FETCHED: {len(place_details)}")
        return place_details
    
    def _extract_place_type(self, place_id: str) -> str:
        """Extract place type from place ID"""
        if place_id.startswith('hotel_'):
            return 'hotel'
        elif place_id.startswith('restaurant_'):
            return 'restaurant'
        elif place_id.startswith('cafe_'):
            return 'cafe'
        elif place_id.startswith('attraction_'):
            return 'attraction'
        else:
            return 'unknown'
    
    async def _fetch_place_details(self, place_id: str, place_type: str) -> Optional[PlaceDetails]:
        """Fetch detailed information for a specific place using SERP API"""
        
        if not self.places_tool.api_key:
            print(f"      ⚠️  SERP API key not available - returning mock data for {place_id}")
            # Fallback to mock data if no API key
            if place_type == 'hotel':
                return self._create_mock_hotel_details(place_id)
            elif place_type == 'restaurant':
                return self._create_mock_restaurant_details(place_id)
            elif place_type == 'cafe':
                return self._create_mock_cafe_details(place_id)
            elif place_type == 'attraction':
                return self._create_mock_attraction_details(place_id)
            else:
                return None
        
        try:
            print(f"      🌐 Fetching real place details via SERP API")
            
            # Use SERP API to get place details by place_id
            place_data = await self._get_serp_place_details(place_id, place_type)
            
            if place_data:
                print(f"      ✅ Real SERP data retrieved for {place_id}")
                return self._convert_serp_to_place_details(place_data, place_id)
            else:
                print(f"      ⚠️  No SERP data found - using mock data for {place_id}")
                # Fallback to mock data
                return self._create_mock_hotel_details(place_id) if place_type == 'hotel' else None
                
        except Exception as e:
            print(f"      ❌ SERP API error for {place_id}: {str(e)}")
            logger.error(f"SERP API error for {place_id}: {str(e)}")
            # Fallback to mock data on error
            if place_type == 'hotel':
                return self._create_mock_hotel_details(place_id)
            else:
                return None
    
    async def _get_serp_place_details(self, place_id: str, place_type: str) -> Optional[Dict[str, Any]]:
        """Get place details from SERP API using place_id or search"""
        
        try:
            # First try to get by place_id if it looks like a Google place_id
            if len(place_id) > 20 and not place_id.startswith(('hotel_', 'restaurant_', 'cafe_', 'attraction_')):
                # This looks like a real Google place_id
                search = serpapi.GoogleSearch({
                    "engine": "google_maps",
                    "place_id": place_id,
                    "api_key": self.places_tool.api_key
                })
                
                results = search.get_dict()
                return results.get('place_results', {})
            
            else:
                # This is one of our generated place_ids, need to search by name/type
                # For now, return None to use mock data
                return None
                
        except Exception as e:
            logger.error(f"Error fetching SERP place details: {str(e)}")
            return None
    
    def _convert_serp_to_place_details(self, serp_data: Dict[str, Any], place_id: str) -> PlaceDetails:
        """Convert SERP API response to PlaceDetails format"""
        
        # Extract basic information
        name = serp_data.get('title', 'Unknown Place')
        description = serp_data.get('description', serp_data.get('about', {}).get('summary', ''))
        
        # Extract location information
        location_data = serp_data.get('gps_coordinates', {})
        address = serp_data.get('address', '')
        
        location = PlaceLocation(
            latitude=location_data.get('latitude', 0.0),
            longitude=location_data.get('longitude', 0.0),
            address=address,
            neighborhood=serp_data.get('neighborhood', '')
        )
        
        # Extract images
        images = []
        photos = serp_data.get('photos', [])
        for photo in photos[:5]:  # Limit to 5 images
            images.append(PlaceImage(
                url=photo.get('image', ''),
                caption=photo.get('title', 'Place Photo')
            ))
        
        # Extract reviews
        reviews = []
        review_data = serp_data.get('reviews', [])
        for review in review_data[:5]:  # Limit to 5 reviews
            reviews.append(PlaceReview(
                rating=float(review.get('rating', 0)),
                review_text=review.get('snippet', ''),
                author=review.get('user', {}).get('name', 'Anonymous'),
                date=review.get('date', ''),
                source='Google Reviews'
            ))
        
        # Extract other details
        rating = serp_data.get('rating', 0.0)
        price_level = self._convert_price_level(serp_data.get('price', ''))
        
        # Extract opening hours
        hours_data = serp_data.get('hours', {})
        opening_hours = []
        if isinstance(hours_data, dict):
            for day, hours in hours_data.items():
                if hours:
                    opening_hours.append(f"{day}: {hours}")
        
        # Extract contact information
        contact = {}
        if serp_data.get('phone'):
            contact['phone'] = serp_data.get('phone')
        if serp_data.get('website'):
            contact['website'] = serp_data.get('website')
        
        # Extract amenities/services
        amenities = []
        service_options = serp_data.get('service_options', {})
        if isinstance(service_options, dict):
            for key, value in service_options.items():
                if value:
                    amenities.append(key.replace('_', ' ').title())
        
        # Determine type
        place_type = serp_data.get('type', self._extract_place_type(place_id))
        
        return PlaceDetails(
            place_id=place_id,
            name=name,
            description=description,
            location=location,
            images=images,
            reviews=reviews,
            rating=rating,
            price_level=price_level,
            opening_hours=opening_hours,
            contact=contact,
            amenities=amenities,
            type=place_type,
            thumbnail=serp_data.get('thumbnail'),
            serpapi_thumbnail=serp_data.get('serpapi_thumbnail'),
            high_res_image=serp_data.get('high_res_image')
        )
    
    def _convert_price_level(self, price_str: str) -> str:
        """Convert SERP price format to our format"""
        if not price_str:
            return "$"
        
        # Count dollar signs or convert descriptive text
        if '$' in price_str:
            return price_str
        elif any(word in price_str.lower() for word in ['expensive', 'luxury', 'high-end']):
            return "$$$"
        elif any(word in price_str.lower() for word in ['moderate', 'mid-range']):
            return "$$"
        else:
            return "$"
    
    def _create_mock_hotel_details(self, place_id: str) -> PlaceDetails:
        """Create mock hotel details with realistic data"""
        
        hotel_data = {
            'hotel_001': {
                'name': 'Grand Palace Hotel Rome',
                'description': 'Luxurious 5-star hotel in the heart of Rome, featuring elegant rooms with marble bathrooms, rooftop terrace with panoramic city views, and world-class dining. Located just steps from the Trevi Fountain and Spanish Steps.',
                'location': PlaceLocation(
                    latitude=41.9028,
                    longitude=12.4964,
                    address='Via del Corso, 126, 00186 Roma RM, Italy',
                    neighborhood='Historic Center'
                ),
                'rating': 4.7,
                'price_level': '$$$'
            },
            'hotel_002': {
                'name': 'Boutique Hotel Artemide',
                'description': 'Charming boutique hotel near Termini Station with contemporary design, rooftop bar, and exceptional service. Perfect blend of modern comfort and Roman elegance.',
                'location': PlaceLocation(
                    latitude=41.9007,
                    longitude=12.4969,
                    address='Via Nazionale, 22, 00184 Roma RM, Italy',
                    neighborhood='Repubblica'
                ),
                'rating': 4.5,
                'price_level': '$$'
            }
        }
        
        # Default hotel if not found
        if place_id not in hotel_data:
            place_id = 'hotel_001'
        
        data = hotel_data[place_id]
        
        return PlaceDetails(
            place_id=place_id,
            name=data['name'],
            description=data['description'],
            location=data['location'],
            images=[
                PlaceImage(
                    url=f"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Hotel Exterior"
                ),
                PlaceImage(
                    url=f"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Luxury Room"
                )
            ],
            reviews=[
                PlaceReview(
                    rating=5.0,
                    review_text="Exceptional service and beautiful rooms. The location is perfect for exploring Rome!",
                    author="Sarah M.",
                    date="2024-01-15",
                    source="Google Reviews"
                ),
                PlaceReview(
                    rating=4.5,
                    review_text="Great hotel with amazing breakfast. Staff was very helpful and friendly.",
                    author="Marco T.",
                    date="2024-01-10",
                    source="TripAdvisor"
                )
            ],
            rating=data['rating'],
            price_level=data['price_level'],
            opening_hours=["24 hours"],
            contact={
                "phone": "+39 06 679 2341",
                "website": "www.grandpalacerome.com",
                "email": "info@grandpalacerome.com"
            },
            amenities=["WiFi", "Breakfast", "Room Service", "Concierge", "Parking", "Bar", "Restaurant"],
            type="hotel"
        )
    
    def _create_mock_restaurant_details(self, place_id: str) -> PlaceDetails:
        """Create mock restaurant details with realistic data"""
        
        restaurant_data = {
            'restaurant_001': {
                'name': 'Trattoria da Enzo',
                'description': 'Authentic Roman trattoria serving traditional dishes made with fresh, local ingredients. Family-owned for three generations, known for their exceptional carbonara and cacio e pepe.',
                'location': PlaceLocation(
                    latitude=41.8919,
                    longitude=12.4755,
                    address='Via dei Vascellari, 29, 00153 Roma RM, Italy',
                    neighborhood='Trastevere'
                ),
                'rating': 4.6,
                'price_level': '$$'
            }
        }
        
        if place_id not in restaurant_data:
            place_id = 'restaurant_001'
            
        data = restaurant_data[place_id]
        
        return PlaceDetails(
            place_id=place_id,
            name=data['name'],
            description=data['description'],
            location=data['location'],
            images=[
                PlaceImage(
                    url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Restaurant Interior"
                ),
                PlaceImage(
                    url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Signature Pasta Dish"
                )
            ],
            reviews=[
                PlaceReview(
                    rating=5.0,
                    review_text="Best carbonara in Rome! Authentic atmosphere and friendly staff.",
                    author="Elena R.",
                    date="2024-01-12",
                    source="Google Reviews"
                )
            ],
            rating=data['rating'],
            price_level=data['price_level'],
            opening_hours=[
                "Mon: 12:30-15:00, 19:30-23:00",
                "Tue: 12:30-15:00, 19:30-23:00", 
                "Wed: Closed",
                "Thu-Sun: 12:30-15:00, 19:30-23:00"
            ],
            contact={
                "phone": "+39 06 581 2260",
                "website": "www.trattoriadaenzo.com"
            },
            amenities=["Outdoor Seating", "Wine List", "Reservations", "Credit Cards"],
            type="restaurant"
        )
    
    def _create_mock_cafe_details(self, place_id: str) -> PlaceDetails:
        """Create mock cafe details with realistic data"""
        
        return PlaceDetails(
            place_id=place_id,
            name="Caffè Sant'Eustachio",
            description="Historic Roman coffee roastery and café famous for its secret blend and traditional espresso preparation. A must-visit for coffee lovers since 1938.",
            location=PlaceLocation(
                latitude=41.8986,
                longitude=12.4768,
                address="Piazza di S. Eustachio, 82, 00186 Roma RM, Italy",
                neighborhood="Pantheon"
            ),
            images=[
                PlaceImage(
                    url="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Historic Café Interior"
                )
            ],
            reviews=[
                PlaceReview(
                    rating=4.8,
                    review_text="The best espresso in Rome! Historic atmosphere and perfect coffee.",
                    author="Francesco L.",
                    date="2024-01-08",
                    source="Google Reviews"
                )
            ],
            rating=4.8,
            price_level="$",
            opening_hours=[
                "Mon-Thu: 06:30-01:00",
                "Fri-Sat: 06:30-02:00",
                "Sun: 06:30-01:00"
            ],
            contact={
                "phone": "+39 06 6880 2048"
            },
            amenities=["Takeaway", "Standing Bar", "Outdoor Seating"],
            type="cafe"
        )
    
    def _create_mock_attraction_details(self, place_id: str) -> PlaceDetails:
        """Create mock attraction details with realistic data"""
        
        return PlaceDetails(
            place_id=place_id,
            name="Colosseum",
            description="Iconic ancient Roman amphitheatre and UNESCO World Heritage Site. Built in 70-80 AD, it could hold 50,000-80,000 spectators and hosted gladiatorial contests and public spectacles.",
            location=PlaceLocation(
                latitude=41.8902,
                longitude=12.4922,
                address="Piazza del Colosseo, 1, 00184 Roma RM, Italy",
                neighborhood="Colosseum"
            ),
            images=[
                PlaceImage(
                    url="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Colosseum Exterior"
                ),
                PlaceImage(
                    url="https://images.unsplash.com/photo-1539650116574-75c0c6d7bf6e?w=800&h=600",
                    width=800,
                    height=600,
                    caption="Interior Arena View"
                )
            ],
            reviews=[
                PlaceReview(
                    rating=4.5,
                    review_text="Absolutely breathtaking! A must-see when visiting Rome. Book skip-the-line tickets in advance.",
                    author="Jennifer K.",
                    date="2024-01-14",
                    source="TripAdvisor"
                )
            ],
            rating=4.5,
            price_level="$$",
            opening_hours=[
                "Daily: 08:30-19:15 (varies by season)"
            ],
            contact={
                "phone": "+39 06 3996 7700",
                "website": "www.coopculture.it"
            },
            amenities=["Audio Guide", "Guided Tours", "Accessibility", "Gift Shop"],
            type="attraction"
        )
