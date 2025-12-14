from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from datetime import date
from services.flight_service import FlightService
from models import FlightSearchRequest, FlightSearchResponse, Flight, BookingOptionsResponse
from pydantic import BaseModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize flight service
flight_service = FlightService()

@router.get("/popular", response_model=List[Flight])
async def get_popular_flights():
    """Get popular flight routes"""
    try:
        popular_flights = await flight_service.get_popular_flights()
        return popular_flights
    except Exception as e:
        logger.error(f"Error getting popular flights: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get popular flights: {str(e)}")

@router.post("/search", response_model=FlightSearchResponse)
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

@router.get("/booking-options/{booking_token}")
async def get_booking_options(booking_token: str):
    """Get booking options for a specific flight using booking token"""
    try:
        logger.info(f"Getting booking options for token: {booking_token}")
        logger.info(f"Flight service instance: {flight_service}")
        logger.info(f"Flight service use_real_api: {flight_service.use_real_api}")
        
        booking_options = await flight_service.get_booking_options(booking_token)
        logger.info(f"Booking options result: {booking_options}")
        logger.info(f"Booking options keys: {list(booking_options.keys()) if booking_options else 'None'}")
        
        return booking_options
    except Exception as e:
        logger.error(f"Error getting booking options: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error getting booking options: {str(e)}")

@router.get("/airports/suggestions")
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

@router.get("/{flight_id}", response_model=Flight)
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

# AirIQ endpoints for backward compatibility (also available at /airiq/*)
from AIRIQBackend import AirIQService, AirIQMapper
from AIRIQBackend.models import AirIQLoginResponse

# Initialize AirIQ service (singleton - same instance as in AIRIQBackend)
airiq_service = AirIQService()

@router.post("/airiq/login", response_model=AirIQLoginResponse)
async def airiq_login():
    """Login to AirIQ API and get authentication token (backward compatibility endpoint)"""
    try:
        login_response = await airiq_service.login()
        
        # Get the token from the service (it's stored after login)
        token = airiq_service.token or login_response.get("Token", "")
        
        return AirIQLoginResponse(
            success=True,
            agent_id=login_response.get("AgentID", ""),
            username=login_response.get("UserName", ""),
            token=token,
            token_received=bool(token),
            status=login_response.get("Status", {}),
            message="Login successful"
        )
    except Exception as e:
        logger.error(f"AirIQ login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AirIQ login failed: {str(e)}")

@router.post("/airiq/availability")
async def test_airiq_availability(
    from_location: str = Body(...),
    to_location: str = Body(...),
    departure_date: str = Body(...),
    return_date: Optional[str] = Body(None),
    passengers: int = Body(1),
    child_count: int = Body(0),
    infant_count: int = Body(0),
    class_type: str = Body("economy"),
    airline_id: str = Body(""),
    fare_type: str = Body("N"),
    only_direct: bool = Body(False)
):
    """Test AirIQ Availability endpoint (backward compatibility endpoint)"""
    try:
        from datetime import datetime
        
        # Parse dates
        dep_date = datetime.strptime(departure_date, "%Y-%m-%d").date()
        ret_date = None
        if return_date:
            ret_date = datetime.strptime(return_date, "%Y-%m-%d").date()
        
        # Call availability
        response = await airiq_service.search_availability(
            from_location=from_location,
            to_location=to_location,
            departure_date=dep_date,
            return_date=ret_date,
            passengers=passengers,
            child_count=child_count,
            infant_count=infant_count,
            class_type=class_type,
            airline_id=airline_id,
            fare_type=fare_type,
            only_direct=only_direct
        )
        
        return {
            "success": True,
            "track_id": response.get("Trackid", ""),
            "itinerary_count": len(response.get("ItineraryFlightList", [])),
            "status": response.get("Status", {}),
            "response": response
        }
    except Exception as e:
        logger.error(f"AirIQ availability error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AirIQ availability failed: {str(e)}")

class FlightBookingRequest(BaseModel):
    track_id: str
    flight_details: List[Dict[str, Any]]
    passenger_details: List[Dict[str, Any]]
    contact_info: Dict[str, Any]
    trip_type: str = "O"
    base_origin: str
    base_destination: str
    block_pnr: bool = False

@router.post("/book")
async def book_flight(booking_data: FlightBookingRequest = Body(...)):
    """Book a flight using AirIQ API"""
    try:
        logger.info(f"Booking flight with track_id: {booking_data.track_id}")
        
        # Book the flight
        booking_result = await flight_service.book_flight_airiq(
            track_id=booking_data.track_id,
            flight_details=booking_data.flight_details,
            passenger_details=booking_data.passenger_details,
            contact_info=booking_data.contact_info,
            trip_type=booking_data.trip_type,
            base_origin=booking_data.base_origin,
            base_destination=booking_data.base_destination,
            block_pnr=booking_data.block_pnr
        )
        
        return booking_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error booking flight: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error booking flight: {str(e)}") 