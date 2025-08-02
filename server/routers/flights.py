from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from services.flight_service import FlightService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize flight service
flight_service = FlightService()

class FlightSearchRequest(BaseModel):
    from_location: str
    to_location: str
    departure_date: date
    return_date: Optional[date] = None
    passengers: int = 1
    class_type: str = "economy"

class Flight(BaseModel):
    id: str
    airline: str
    flight_number: str
    departure: dict
    arrival: dict
    duration: str
    price: float
    stops: int
    rating: float
    amenities: List[str]

class FlightSearchResponse(BaseModel):
    success: bool
    flights: List[Flight]
    total_count: int
    message: str = ""

@router.get("/flights/popular", response_model=List[Flight])
async def get_popular_flights():
    """Get popular flight routes"""
    try:
        popular_flights = await flight_service.get_popular_flights()
        return popular_flights
    except Exception as e:
        logger.error(f"Error getting popular flights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular flights: {str(e)}")

@router.post("/flights/search", response_model=FlightSearchResponse)
async def search_flights(request: FlightSearchRequest):
    """Search for flights based on criteria"""
    try:
        logger.info(f"Searching flights from {request.from_location} to {request.to_location}")
        
        flights = await flight_service.search_flights(
            from_location=request.from_location,
            to_location=request.to_location,
            departure_date=request.departure_date,
            return_date=request.return_date,
            passengers=request.passengers,
            class_type=request.class_type
        )
        
        return FlightSearchResponse(
            success=True,
            flights=flights,
            total_count=len(flights),
            message=f"Found {len(flights)} flights from {request.from_location} to {request.to_location}"
        )
    except Exception as e:
        logger.error(f"Error searching flights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching flights: {str(e)}")

@router.get("/flights/{flight_id}", response_model=Flight)
async def get_flight_details(flight_id: str):
    """Get detailed information about a specific flight"""
    try:
        flight_details = await flight_service.get_flight_details(flight_id)
        if not flight_details:
            raise HTTPException(status_code=404, detail="Flight not found")
        return flight_details
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting flight details: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting flight details: {str(e)}")

@router.post("/flights/book")
async def book_flight(flight_id: str, passengers: int = 1):
    """Book a flight"""
    try:
        # Mock booking response
        booking_reference = f"SB{flight_id.upper()}{passengers}2025"
        return {
            "success": True,
            "booking_reference": booking_reference,
            "message": f"Flight {flight_id} booked successfully for {passengers} passenger(s)",
            "total_price": 850.0 * passengers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error booking flight: {str(e)}")

@router.get("/flights/airports/suggestions")
async def get_airport_suggestions(query: str):
    """Get airport suggestions for autocomplete"""
    try:
        if len(query) < 2:
            return []
        
        suggestions = await flight_service.get_airport_suggestions(query)
        return suggestions
    except Exception as e:
        logger.error(f"Error getting airport suggestions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting airport suggestions: {str(e)}") 