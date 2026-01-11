"""
AirIQ Router - FastAPI endpoints for AirIQ API operations
All endpoints (except /login) are protected and require TOKEN header
"""
from fastapi import APIRouter, HTTPException, Body, Header, Depends
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from .service import AirIQService
from .mapper import AirIQMapper
from .models import (
    AirIQAvailabilityRequest,
    AirIQAvailabilityResponse,
    AirIQPricingRequest,
    AirIQPricingResponse,
    AirIQBookingRequest,
    AirIQBookingResponse,
    AirIQLoginResponse
)

router = APIRouter(prefix="/airiq", tags=["AirIQ"])
logger = logging.getLogger(__name__)

# Initialize AirIQ service (singleton)
airiq_service = AirIQService()


async def verify_token(
    TOKEN: Optional[str] = Header(None, alias="TOKEN"),
    Token: Optional[str] = Header(None, alias="Token")
) -> str:
    """
    Dependency to verify TOKEN header for all protected AirIQ endpoints
    All AirIQ APIs are locked and require a valid login token
    
    Args:
        TOKEN: Token in uppercase header (primary)
        Token: Token in lowercase header (fallback)
    
    Returns:
        Valid token string
    
    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    # Check for token in headers (try uppercase first, then lowercase)
    token = TOKEN or Token
    
    # If no token in header, try to get from .env file (AIR_IQ_ACCESS_TOKEN)
    if not token:
        env_token = airiq_service.config.access_token if hasattr(airiq_service, 'config') else None
        if env_token:
            token = env_token
            logger.info("Using token from .env file (AIR_IQ_ACCESS_TOKEN) since no TOKEN header provided")
        else:
            logger.warning("AirIQ endpoint accessed without TOKEN header and no token in .env file")
            raise HTTPException(
                status_code=401,
                detail="TOKEN header is required. All AirIQ APIs are locked and require a valid login token. "
                       "Please provide TOKEN header or set AIR_IQ_ACCESS_TOKEN in .env file. "
                       "You can also login at /airiq/login to get a token."
            )
    
    # If service has a stored token, verify they match
    if airiq_service.token:
        if token != airiq_service.token:
            logger.warning(f"Token mismatch. Service token: {airiq_service.token[:20]}..., Provided: {token[:20]}...")
            raise HTTPException(
                status_code=401,
                detail="Invalid TOKEN. Token does not match the active session. Please login again at /airiq/login"
            )
        
        # Check if stored token is expired
        from datetime import datetime
        if airiq_service.token_expiry and datetime.now() >= airiq_service.token_expiry:
            logger.warning("Stored token has expired")
            raise HTTPException(
                status_code=401,
                detail="TOKEN has expired. Please login again at /airiq/login to get a new token"
            )
    else:
        # Service doesn't have a token stored, but user provided one
        # Accept the provided token and store it in the service for future use
        logger.info(f"Service has no stored token, accepting provided token and storing it")
        airiq_service.token = token
        # Set expiry to 24 hours from now (tokens are valid for 24 hours)
        from datetime import datetime, timedelta
        now = datetime.now()
        airiq_service.token_expiry = now + timedelta(hours=24)
        airiq_service.token_created_at = now
    
    logger.debug(f"Token verified successfully for request")
    return token


@router.post("/login", response_model=AirIQLoginResponse)
async def airiq_login():
    """
    Login to AirIQ API and get authentication token
    This endpoint is mainly for testing - token is automatically managed by the service
    """
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


@router.post("/availability")
async def search_availability(
    request: AirIQAvailabilityRequest,
    token: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Search for available flights using AirIQ Availability API
    
    **REQUIRES TOKEN**: This endpoint is locked and requires a valid TOKEN header.
    Get token by calling /airiq/login first.
    
    Headers:
        TOKEN: Valid login token (required)
    
    Returns raw AirIQ response with Trackid, ItineraryFlightList, and Status
    """
    try:
        logger.info(f"Searching availability: {request.from_location} -> {request.to_location} on {request.departure_date}")
        
        # Call AirIQ Availability API with provided token (no auto-login)
        response = await airiq_service.search_availability(
            from_location=request.from_location,
            to_location=request.to_location,
            departure_date=request.departure_date,
            return_date=request.return_date,
            passengers=request.passengers,
            child_count=request.child_count,
            infant_count=request.infant_count,
            class_type=request.class_type,
            airline_id=request.airline_id,
            fare_type=request.fare_type,
            only_direct=request.only_direct,
            trip_type_special=request.trip_type_special,
            provided_token=token  # Pass token from header, no auto-login
        )
        
        # Return raw AirIQ response only
        track_id = response.get("Trackid", "")
        itinerary_flight_list = response.get("ItineraryFlightList", [])
        status = response.get("Status", {})
        
        # Return response matching exact AirIQ structure
        return {
            "Trackid": track_id,
            "ItineraryFlightList": itinerary_flight_list,
            "Status": status
        }
        
    except ValueError as e:
        logger.error(f"Validation error in availability search: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"AirIQ availability error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AirIQ availability failed: {str(e)}")


@router.post("/availability/test")
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
    only_direct: bool = Body(False),
    token: str = Depends(verify_token)
):
    """
    Test AirIQ Availability endpoint directly (for debugging)
    Returns raw AirIQ response
    """
    try:
        # Parse dates
        dep_date = datetime.strptime(departure_date, "%Y-%m-%d").date()
        ret_date = None
        if return_date:
            ret_date = datetime.strptime(return_date, "%Y-%m-%d").date()
        
        # Call availability with provided token (no auto-login)
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
            only_direct=only_direct,
            provided_token=token  # Pass token from header, no auto-login
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


@router.post("/pricing", response_model=AirIQPricingResponse)
async def get_pricing(
    request: AirIQPricingRequest,
    token: str = Depends(verify_token)
):
    """
    Get pricing for selected flights using AirIQ Pricing API
    
    **REQUIRES TOKEN**: This endpoint is locked and requires a valid TOKEN header.
    Get token by calling /airiq/login first.
    
    Headers:
        TOKEN: Valid login token (required)
    """
    try:
        logger.info(f"Getting pricing for track_id: {request.track_id}")
        
        response = await airiq_service.get_pricing(
            track_id=request.track_id,
            flight_details=request.flight_details,
            base_origin=request.base_origin,
            base_destination=request.base_destination,
            trip_type=request.trip_type,
            passengers=request.passengers,
            child_count=request.child_count,
            infant_count=request.infant_count,
            provided_token=token  # Pass token from header, no auto-login
        )
        
        # Map response
        mapped_response = AirIQMapper.map_pricing_response(response)
        
        return AirIQPricingResponse(
            success=True,
            track_id=mapped_response.get("track_id", request.track_id),
            pricing_details=mapped_response.get("pricing_details", {}),
            status=mapped_response.get("status", {}),
            message="Pricing retrieved successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting pricing: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting pricing: {str(e)}")


@router.post("/book", response_model=AirIQBookingResponse)
async def book_flight(
    request: AirIQBookingRequest,
    token: str = Depends(verify_token)
):
    """
    Book a flight using AirIQ Booking API
    
    **REQUIRES TOKEN**: This endpoint is locked and requires a valid TOKEN header.
    Get token by calling /airiq/login first.
    
    Headers:
        TOKEN: Valid login token (required)
    """
    try:
        logger.info(f"Booking flight with track_id: {request.track_id}")
        
        # Convert Pydantic models to dicts for AirIQ API
        pax_details_dict = [pax.dict() for pax in request.pax_details_info]
        address_details_dict = request.address_details.dict()
        gst_info_dict = request.gst_info.dict() if request.gst_info else None
        
        # Book the flight with provided token (no auto-login)
        response = await airiq_service.book_flight(
            track_id=request.track_id,
            itinerary_flights_info=request.itinerary_flights_info,
            pax_details_info=pax_details_dict,
            address_details=address_details_dict,
            trip_type=request.trip_type,
            base_origin=request.base_origin,
            base_destination=request.base_destination,
            block_pnr=request.block_pnr,
            gst_info=gst_info_dict,
            provided_token=token  # Pass token from header, no auto-login
        )
        
        # Map response
        mapped_response = AirIQMapper.map_booking_response(response)
        
        return AirIQBookingResponse(
            success=mapped_response.get("success", False),
            track_id=mapped_response.get("track_id", request.track_id),
            airiq_pnr=mapped_response.get("airiq_pnr"),
            airline_pnr=mapped_response.get("airline_pnr"),
            booking_amount=mapped_response.get("booking_amount"),
            booking_status=mapped_response.get("booking_status"),
            message=mapped_response.get("message", "Booking processed"),
            raw_response=response
        )
        
    except Exception as e:
        logger.error(f"Error booking flight: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error booking flight: {str(e)}")


@router.get("/booking/{airiq_pnr}")
async def get_booking_details(
    airiq_pnr: str,
    token: str = Depends(verify_token)
):
    """
    Retrieve booking details by AirIQ PNR
    """
    try:
        logger.info(f"Retrieving booking details for PNR: {airiq_pnr}")
        
        response = await airiq_service.get_booking_details(airiq_pnr, provided_token=token)
        
        return {
            "success": True,
            "booking_details": response,
            "message": "Booking details retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error retrieving booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving booking: {str(e)}")


@router.post("/issue-ticket")
async def issue_ticket(
    booking_track_id: str = Body(...),
    airiq_pnr: str = Body(...),
    airline_pnr: str = Body(...),
    booking_amount: float = Body(...),
    payment_mode: str = Body("T"),
    token: str = Depends(verify_token)
):
    """
    Issue ticket for blocked booking using AirIQ IssueTicket API
    """
    try:
        logger.info(f"Issuing ticket for PNR: {airiq_pnr}")
        
        response = await airiq_service.issue_ticket(
            booking_track_id=booking_track_id,
            airiq_pnr=airiq_pnr,
            airline_pnr=airline_pnr,
            booking_amount=booking_amount,
            payment_mode=payment_mode,
            provided_token=token  # Pass token from header, no auto-login
        )
        
        return {
            "success": True,
            "response": response,
            "message": "Ticket issued successfully"
        }
        
    except Exception as e:
        logger.error(f"Error issuing ticket: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error issuing ticket: {str(e)}")


@router.get("/balance")
async def get_balance(token: str = Depends(verify_token)):
    """
    Get account balance using AirIQ GetBalance API
    """
    try:
        response = await airiq_service.get_balance(provided_token=token)
        
        return {
            "success": True,
            "balance": response,
            "message": "Balance retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error getting balance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting balance: {str(e)}")

