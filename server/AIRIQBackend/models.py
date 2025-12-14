"""
AirIQ Pydantic Models - Request and Response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import date


class AirIQAvailabilityRequest(BaseModel):
    """Request model for AirIQ availability search"""
    from_location: str = Field(..., description="3-letter IATA departure airport code")
    to_location: str = Field(..., description="3-letter IATA arrival airport code")
    departure_date: date = Field(..., description="Departure date")
    return_date: Optional[date] = Field(None, description="Return date (for round trip)")
    passengers: int = Field(1, ge=1, le=9, description="Number of adult passengers")
    child_count: int = Field(0, ge=0, le=9, description="Number of child passengers")
    infant_count: int = Field(0, ge=0, le=4, description="Number of infant passengers")
    class_type: str = Field("economy", description="Cabin class (economy, premium, business, first)")
    airline_id: str = Field("", description="2-letter airline code (optional)")
    fare_type: str = Field("N", description="Fare type (N: Normal, C: Corporate, R: Retail)")
    only_direct: bool = Field(False, description="True for direct flights only")
    trip_type_special: bool = Field(False, description="True for RoundTrip Special")


class AirIQAvailabilityResponse(BaseModel):
    """Response model for AirIQ availability search"""
    success: bool
    track_id: str
    itinerary_count: int
    flights: List[Dict[str, Any]] = Field(default_factory=list)
    status: Dict[str, Any] = Field(default_factory=dict)
    message: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = Field(None, description="Raw AirIQ API response for reference")
    # Raw AirIQ structure
    ItineraryFlightList: Optional[List[Dict[str, Any]]] = Field(None, description="Raw AirIQ ItineraryFlightList structure")


class AirIQPricingRequest(BaseModel):
    """Request model for AirIQ pricing"""
    track_id: str = Field(..., description="Track ID from availability search")
    flight_details: List[Dict[str, Any]] = Field(..., description="Selected flight details")
    base_origin: str = Field(..., description="Base origin airport code")
    base_destination: str = Field(..., description="Base destination airport code")
    trip_type: str = Field(..., description="Trip type (O: OneWay, R: RoundTrip, Y: RoundTrip Special)")
    passengers: int = Field(1, ge=1, le=9)
    child_count: int = Field(0, ge=0, le=9)
    infant_count: int = Field(0, ge=0, le=4)


class AirIQPricingResponse(BaseModel):
    """Response model for AirIQ pricing"""
    success: bool
    track_id: str
    pricing_details: Dict[str, Any] = Field(default_factory=dict)
    status: Dict[str, Any] = Field(default_factory=dict)
    message: Optional[str] = None


class PassengerDetail(BaseModel):
    """Passenger detail model for booking"""
    PaxType: str = Field(..., description="Passenger type (ADT, CHD, INF)")
    FirstName: str = Field(..., description="First name")
    LastName: str = Field(..., description="Last name")
    Title: str = Field(..., description="Title (Mr, Mrs, Miss, Ms)")
    DateOfBirth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    Gender: str = Field(..., description="Gender (M, F)")
    PassportNumber: Optional[str] = Field(None, description="Passport number")
    PassportExpiry: Optional[str] = Field(None, description="Passport expiry (YYYY-MM-DD)")
    PassportIssuingCountry: Optional[str] = Field(None, description="Passport issuing country")
    Email: str = Field(..., description="Email address")
    MobileNumber: str = Field(..., description="Mobile number")
    Nationality: Optional[str] = Field(None, description="Nationality")


class AddressDetail(BaseModel):
    """Address detail model for booking"""
    AddressLine1: str = Field(..., description="Address line 1")
    AddressLine2: Optional[str] = Field(None, description="Address line 2")
    City: str = Field(..., description="City")
    State: str = Field(..., description="State")
    Country: str = Field(..., description="Country")
    ZipCode: str = Field(..., description="Zip code")
    ContactNumber: str = Field(..., description="Contact number")
    Email: str = Field(..., description="Email address")


class GSTInfo(BaseModel):
    """GST information model"""
    GSTNumber: Optional[str] = Field(None, description="GST number")
    GSTCompanyName: Optional[str] = Field(None, description="Company name")
    GSTAddress: Optional[str] = Field(None, description="GST address")
    GSTEmailID: Optional[str] = Field(None, description="GST email")
    GSTMobileNumber: Optional[str] = Field(None, description="GST mobile number")


class AirIQBookingRequest(BaseModel):
    """Request model for AirIQ flight booking"""
    track_id: str = Field(..., description="Track ID from availability/pricing")
    itinerary_flights_info: List[Dict[str, Any]] = Field(..., description="Flight itinerary details")
    pax_details_info: List[PassengerDetail] = Field(..., description="Passenger details")
    address_details: AddressDetail = Field(..., description="Address details")
    trip_type: str = Field(..., description="Trip type (O, R, Y)")
    base_origin: str = Field(..., description="Base origin airport code")
    base_destination: str = Field(..., description="Base destination airport code")
    block_pnr: bool = Field(False, description="Block PNR without payment")
    gst_info: Optional[GSTInfo] = Field(None, description="GST information")


class AirIQBookingResponse(BaseModel):
    """Response model for AirIQ flight booking"""
    success: bool
    track_id: str
    airiq_pnr: Optional[str] = None
    airline_pnr: Optional[str] = None
    booking_amount: Optional[float] = None
    booking_status: Optional[str] = None
    message: str
    raw_response: Optional[Dict[str, Any]] = None


class AirIQLoginResponse(BaseModel):
    """Response model for AirIQ login"""
    success: bool
    agent_id: str
    username: str
    token: Optional[str] = None
    token_received: bool
    status: Dict[str, Any] = Field(default_factory=dict)
    message: Optional[str] = None

