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

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None 