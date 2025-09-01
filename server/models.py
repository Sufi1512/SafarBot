from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import date, datetime

class ItineraryRequest(BaseModel):
    destination: str = Field(..., description="Travel destination")
    start_date: str = Field(..., description="Start date of the trip (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date of the trip (YYYY-MM-DD)")
    budget: Optional[float] = Field(None, description="Budget in USD")
    interests: List[str] = Field(default=[], description="List of interests (nature, food, history, etc.)")
    travelers: int = Field(default=1, description="Number of travelers")
    accommodation_type: Optional[str] = Field(None, description="Type of accommodation (budget, luxury, etc.)")

    @field_validator('start_date', 'end_date')
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        """Validate date format is YYYY-MM-DD"""
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
    
    def get_start_date(self) -> date:
        """Convert string to date object"""
        return datetime.strptime(self.start_date, '%Y-%m-%d').date()
    
    def get_end_date(self) -> date:
        """Convert string to date object"""
        return datetime.strptime(self.end_date, '%Y-%m-%d').date()

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    context: Optional[Dict[str, Any]] = Field(None, description="Chat context")

class HotelSearchRequest(BaseModel):
    location: str = Field(..., description="Location to search for hotels")
    check_in: date = Field(..., description="Check-in date")
    check_out: date = Field(..., description="Check-out date")
    guests: int = Field(default=1, description="Number of guests")
    budget_range: Optional[str] = Field(None, description="Budget range (budget, mid-range, luxury)")

class RestaurantRequest(BaseModel):
    location: str = Field(..., description="Location to search for restaurants")
    cuisine: Optional[str] = Field(None, description="Preferred cuisine type")
    budget: Optional[str] = Field(None, description="Budget range")
    rating: Optional[float] = Field(None, description="Minimum rating")

class DailyPlan(BaseModel):
    day: int = Field(..., description="Day number")
    date: str = Field(..., description="Date")
    activities: List[Dict[str, Any]] = Field(..., description="List of activities")
    meals: List[Dict[str, Any]] = Field(..., description="Meal suggestions")
    accommodation: Optional[Dict[str, Any]] = Field(None, description="Accommodation details")
    transport: List[Dict[str, Any]] = Field(..., description="Transportation details")

class ItineraryResponse(BaseModel):
    destination: str
    total_days: int
    budget_estimate: float
    daily_plans: List[DailyPlan]
    recommendations: Dict[str, Any]
    weather_info: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    context: Optional[Dict[str, Any]] = None

class HotelInfo(BaseModel):
    name: str
    address: str
    price_range: str
    rating: float
    amenities: List[str]
    description: str
    booking_url: Optional[str] = None

class RestaurantInfo(BaseModel):
    name: str
    cuisine: str
    address: str
    price_range: str
    rating: float
    specialties: List[str]
    description: str

# Flight Models
class FlightSegment(BaseModel):
    id: str
    airline: str
    airline_logo: Optional[str] = None
    flight_number: str
    departure: Dict[str, Any]
    arrival: Dict[str, Any]
    duration: str
    duration_minutes: int
    amenities: List[str]
    aircraft: str
    travel_class: str
    legroom: Optional[str] = None
    overnight: bool = False
    often_delayed: bool = False
    ticket_also_sold_by: List[str] = []
    plane_and_crew_by: Optional[str] = None

class Layover(BaseModel):
    duration: int
    airport: str
    airport_name: str
    overnight: bool = False

class CarbonEmissions(BaseModel):
    this_flight: int
    typical_for_route: int
    difference_percent: int

class Flight(BaseModel):
    id: str
    price: float
    currency: str = "INR"
    stops: int
    total_duration: str
    total_duration_minutes: int
    flight_type: str
    airline_logo: Optional[str] = None
    departure_token: Optional[str] = None
    booking_token: Optional[str] = None
    carbon_emissions: CarbonEmissions
    extensions: List[str] = []
    flight_segments: List[FlightSegment]
    layovers: List[Layover]
    rating: float
    amenities: List[str]

# Booking Options Models
class LocalPrice(BaseModel):
    currency: str
    price: float

class BookingRequest(BaseModel):
    url: str
    post_data: Optional[str] = None

class BookingOption(BaseModel):
    book_with: str
    airline_logos: List[str]
    marketed_as: List[str]
    price: float
    local_prices: List[LocalPrice]
    option_title: Optional[str] = None
    extensions: List[str] = []
    baggage_prices: List[str] = []
    booking_request: Optional[Dict[str, Any]] = None
    booking_phone: Optional[str] = None
    estimated_phone_service_fee: Optional[float] = None

class BookingOptionGroup(BaseModel):
    separate_tickets: bool = False
    together: Optional[BookingOption] = None
    departing: Optional[BookingOption] = None
    returning: Optional[BookingOption] = None

class PriceInsights(BaseModel):
    lowest_price: int
    price_level: str
    typical_price_range: List[int]
    price_history: Optional[List[List[int]]] = None

class BookingOptionsResponse(BaseModel):
    selected_flights: List[Dict[str, Any]]
    baggage_prices: Dict[str, List[str]]
    booking_options: List[BookingOptionGroup]
    price_insights: Optional[PriceInsights] = None

class FlightSearchRequest(BaseModel):
    from_location: str = Field(..., description="Departure location")
    to_location: str = Field(..., description="Arrival location")
    departure_date: date = Field(..., description="Departure date")
    return_date: Optional[date] = Field(None, description="Return date")
    passengers: int = Field(default=1, description="Number of passengers")
    class_type: str = Field(default="economy", description="Travel class")

class FlightSearchResponse(BaseModel):
    success: bool
    flights: List[Flight]
    total_count: int
    message: str = ""

# Place Details Models
class PlaceImage(BaseModel):
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    caption: Optional[str] = None

class PlaceReview(BaseModel):
    rating: float
    review_text: str
    author: str
    date: Optional[str] = None
    source: Optional[str] = None

class PlaceLocation(BaseModel):
    latitude: float
    longitude: float
    address: str
    neighborhood: Optional[str] = None

class PlaceDetails(BaseModel):
    place_id: str
    name: str
    description: str
    location: PlaceLocation
    images: List[PlaceImage] = []
    reviews: List[PlaceReview] = []
    rating: Optional[float] = None
    price_level: Optional[str] = None
    opening_hours: Optional[List[str]] = []
    contact: Optional[Dict[str, str]] = {}  # phone, website, etc.
    amenities: List[str] = []
    type: str  # hotel, restaurant, attraction, etc.
    
class PlaceDetailsRequest(BaseModel):
    place_ids: List[str] = Field(..., description="List of place IDs to get details for")

class PlaceDetailsResponse(BaseModel):
    places: List[PlaceDetails]
    total_count: int
    message: str = ""

# Raw SERP API Models
class SerpPlaceRequest(BaseModel):
    place_id: str = Field(..., description="Google place_id to get details for")

class SerpPlaceResponse(BaseModel):
    place_data: Optional[Dict[str, Any]] = None
    message: str = ""

class SerpSearchRequest(BaseModel):
    query: str = Field(..., description="Search query for places")
    location: Optional[str] = Field(None, description="Location to search around")
    place_type: Optional[str] = Field(None, description="Type of place to search for")

class SerpSearchResponse(BaseModel):
    places: List[Dict[str, Any]] = []
    total_count: int
    message: str = ""

# Additional Places Models
class AdditionalPlacesRequest(BaseModel):
    destination: str = Field(..., description="Destination to get additional places for")
    interests: List[str] = Field(default=[], description="User interests to tailor suggestions")

class AdditionalPlacesResponse(BaseModel):
    destination: str
    summary: Dict[str, Any]
    suggestions: Dict[str, Any]
    message: str = ""

# Unified Itinerary Models
class UnifiedItineraryRequest(BaseModel):
    destination: str = Field(..., description="Travel destination")
    start_date: str = Field(..., description="Start date of the trip (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date of the trip (YYYY-MM-DD)")
    budget: Optional[float] = Field(None, description="Budget in USD")
    interests: List[str] = Field(default=[], description="List of interests")
    travelers: int = Field(default=1, description="Number of travelers")
    accommodation_type: Optional[str] = Field(None, description="Type of accommodation")

class UnifiedItineraryResponse(BaseModel):
    success: bool
    destination: str
    dates: Dict[str, Any]
    request_info: Dict[str, Any]
    itinerary: Dict[str, Any]
    additional_places: Dict[str, Any]
    summary: Dict[str, Any]
    usage_guide: Dict[str, Any]
    message: str = ""

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None 