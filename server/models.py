from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date

class ItineraryRequest(BaseModel):
    destination: str = Field(..., description="Travel destination")
    start_date: date = Field(..., description="Start date of the trip")
    end_date: date = Field(..., description="End date of the trip")
    budget: Optional[float] = Field(None, description="Budget in USD")
    interests: List[str] = Field(default=[], description="List of interests (nature, food, history, etc.)")
    travelers: int = Field(default=1, description="Number of travelers")
    accommodation_type: Optional[str] = Field(None, description="Type of accommodation (budget, luxury, etc.)")

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

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None 