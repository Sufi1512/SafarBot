"""
AirIQ API Service - Handles all interactions with AirIQ API
Provides secure token management and API integration
"""
import os
import base64
import httpx
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
from config import settings

logger = logging.getLogger(__name__)

# Singleton instance for token sharing across requests
_airiq_service_instance: Optional['AirIQService'] = None


class AirIQService:
    """Service for interacting with AirIQ API"""
    
    def __init__(self, force_new: bool = False):
        """
        Initialize AirIQ Service
        By default, uses singleton pattern to share token across instances
        Set force_new=True to create a new instance
        """
        global _airiq_service_instance
        
        # Use singleton pattern to share token across requests
        if not force_new and _airiq_service_instance is not None:
            logger.debug("Reusing existing AirIQ service instance for token sharing")
            # Copy attributes from singleton
            self.base_url = _airiq_service_instance.base_url
            self.agent_id = _airiq_service_instance.agent_id
            self.username = _airiq_service_instance.username
            self.password = _airiq_service_instance.password
            self.token = _airiq_service_instance.token
            self.token_expiry = _airiq_service_instance.token_expiry
            self.token_created_at = _airiq_service_instance.token_created_at
            self.app_type = _airiq_service_instance.app_type
            self.version = _airiq_service_instance.version
            self.use_airiq = _airiq_service_instance.use_airiq
            return
        
        self.base_url = os.getenv("AIRIQ_URL", "").rstrip('/')
        self.agent_id = os.getenv("AIRIQ_AGENT_ID", "")
        self.username = os.getenv("AIRIQ_USERNAME", "")
        self.password = os.getenv("AIRIQ_PASSWORD", "")
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.token_created_at: Optional[datetime] = None  # Track when token was created
        self.app_type = "API"
        self.version = 2.0
        
        # Validate configuration
        if not all([self.base_url, self.agent_id, self.username, self.password]):
            logger.warning("AirIQ credentials not fully configured. Please set AIRIQ_URL, AIRIQ_AGENT_ID, AIRIQ_USERNAME, and AIRIQ_PASSWORD in environment variables.")
            self.use_airiq = False
        else:
            self.use_airiq = True
            logger.info("AirIQ service initialized with credentials")
        
        # Store as singleton instance
        if not force_new:
            _airiq_service_instance = self
    
    def _get_auth_header(self) -> str:
        """
        Generate Base64 encoded authorization header for AirIQ API
        Format: AgentID*Username:Password (Base64 encoded)
        Example: QUdFTlRJRCpNT0JJTEVOTzpQQVNTV09SRA==
        
        Note: AirIQ uses custom format - just the Base64 string (not "Basic " prefix)
        """
        if not all([self.agent_id, self.username, self.password]):
            raise ValueError("AirIQ credentials not configured. Please set AIRIQ_AGENT_ID, AIRIQ_USERNAME, and AIRIQ_PASSWORD")
        
        # Format: AgentID*Username:Password
        auth_string = f"{self.agent_id}*{self.username}:{self.password}"
        # Base64 encode
        encoded = base64.b64encode(auth_string.encode()).decode()
        # Return just the Base64 string (AirIQ custom format, not standard HTTP Basic Auth)
        return encoded
    
    async def login(self) -> Dict[str, Any]:
        """
        Login to AirIQ API and get authentication token
        Returns the full login response including token
        """
        try:
            url = f"{self.base_url}/Login"
            auth_header = self._get_auth_header()
            
            logger.info("Attempting AirIQ login...")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    headers={
                        "Authorization": auth_header,
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                status = data.get("Status", {})
                result_code = status.get("ResultCode", "0")
                
                if result_code == "1":
                    # Success
                    token = data.get("Token", "")
                    if not token:
                        raise Exception("Login successful but no token received in response")
                    
                    self.token = token
                    self.agent_id = data.get("AgentID", self.agent_id)
                    self.username = data.get("UserName", self.username)
                    
                    # Token expires at end of day (23:59:59)
                    now = datetime.now()
                    today = now.replace(hour=23, minute=59, second=59)
                    self.token_expiry = today
                    self.token_created_at = now  # Track when token was created
                    
                    # Update singleton instance if it exists
                    global _airiq_service_instance
                    if _airiq_service_instance and _airiq_service_instance != self:
                        _airiq_service_instance.token = token
                        _airiq_service_instance.token_expiry = today
                        _airiq_service_instance.token_created_at = now
                    
                    logger.info(f"Successfully logged in to AirIQ. Token received (length: {len(token)}), expires at {self.token_expiry}")
                    logger.debug(f"Token preview: {token[:50]}..." if len(token) > 50 else f"Token: {token}")
                    return data
                elif result_code == "0":
                    # Failure
                    error = status.get("Error", "Invalid Credentials")
                    logger.error(f"AirIQ login failed: {error}")
                    raise Exception(f"AirIQ authentication failed: {error}")
                elif result_code == "-1":
                    # Exception
                    error = status.get("Error", "EX-Unable to authenticate")
                    logger.error(f"AirIQ login exception: {error}")
                    raise Exception(f"AirIQ authentication exception: {error}")
                else:
                    error = status.get("Error", "Unknown error")
                    logger.error(f"AirIQ login unexpected response: {error}")
                    raise Exception(f"AirIQ authentication error: {error}")
                    
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP status error during AirIQ login: {e.response.status_code} - {e.response.text}")
            raise Exception(f"AirIQ API returned error: {e.response.status_code}")
        except httpx.HTTPError as e:
            logger.error(f"HTTP error during AirIQ login: {str(e)}")
            raise Exception(f"Failed to connect to AirIQ API: {str(e)}")
        except Exception as e:
            logger.error(f"Error during AirIQ login: {str(e)}")
            raise
    
    async def _get_token(self, force_refresh: bool = False) -> str:
        """
        Get or refresh authentication token
        Tokens expire at end of day (23:59:59)
        Automatically performs login if token is missing or expired
        
        Args:
            force_refresh: If True, forces a new login even if token exists
        """
        # Check if we should use existing token
        if not force_refresh:
            now = datetime.now()
            # Check if token exists and is still valid
            if self.token and self.token_expiry and now < self.token_expiry:
                # Also check if token was created recently (within last 5 minutes)
                # Some APIs require token to be used soon after creation
                if self.token_created_at:
                    time_since_creation = (now - self.token_created_at).total_seconds()
                    if time_since_creation < 300:  # 5 minutes
                        logger.debug(f"Using existing token (created {time_since_creation:.0f}s ago, expires at {self.token_expiry})")
                        return self.token
                    else:
                        logger.info(f"Token exists but is older than 5 minutes ({time_since_creation:.0f}s), refreshing...")
                else:
                    logger.debug(f"Using existing token (expires at {self.token_expiry})")
                    return self.token
        
        # Token expired, missing, or force refresh - login to get new token
        logger.info("Performing fresh login to get new token...")
        
        try:
            login_response = await self.login()
            
            if not self.token:
                raise Exception("Failed to obtain token from login response")
            
            logger.info(f"Successfully obtained new token (length: {len(self.token)}, created at {self.token_created_at})")
            return self.token
        except Exception as e:
            logger.error(f"Failed to get token: {str(e)}")
            raise Exception(f"Unable to authenticate with AirIQ API: {str(e)}")
    
    def _get_agent_info(self) -> Dict[str, Any]:
        """Get agent info for API requests"""
        return {
            "AgentId": self.agent_id,
            "UserName": self.username,
            "AppType": self.app_type,
            "Version": self.version
        }
    
    async def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        method: str = "POST"
    ) -> Dict[str, Any]:
        """
        Make authenticated request to AirIQ API
        Uses HTTP Basic Auth (AgentID*Username:Password) for all requests
        Token from login must be included in each request after login
        """
        # Ensure we have a valid token (will login if needed)
        token = None
        if endpoint != "Login":
            # Get token - will login automatically if needed
            # For critical operations, we might want to force refresh, but for now use cached if valid
            logger.info(f"Getting token for {endpoint} request...")
            token = await self._get_token(force_refresh=False)
            if not token:
                raise Exception("Failed to obtain AirIQ token. Please check credentials.")
            logger.info(f"Token obtained for {endpoint} (length: {len(token)}, created: {self.token_created_at})")
        
        url = f"{self.base_url}/{endpoint}"
        
        # Add agent info and token to payload (for all endpoints except Login)
        if endpoint != "Login":
            agent_info = self._get_agent_info()
            payload["AgentInfo"] = agent_info
            
            # Include token in payload as per AirIQ documentation
            # "The Token needs to be repeated back in each future request"
            if token:
                payload["Token"] = token
                logger.debug(f"Including token in {endpoint} request (token length: {len(token)})")
            else:
                logger.warning(f"No token available for {endpoint} request")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            # Use Basic Auth for all requests (as per AirIQ documentation)
            # Format: AgentID*Username:Password (Base64 encoded)
            auth_header = self._get_auth_header()
            
            headers = {
                "Authorization": auth_header,
                "Content-Type": "application/json"
            }
            
            # Also include token in Authorization header if available (some APIs require this)
            # AirIQ might need token in both header and payload
            if endpoint != "Login" and token:
                # Try adding token to header as well (some implementations require this)
                # Format: Bearer <token> or just <token>
                headers["X-Auth-Token"] = token  # Some APIs use custom header
                logger.debug(f"Added token to X-Auth-Token header for {endpoint}")
            
            if method == "POST":
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )
            else:
                response = await client.get(
                    url,
                    params=payload,
                    headers=headers
                )
            
            response.raise_for_status()
            data = response.json()
            
            # Check for errors in response
            status = data.get("Status", {})
            result_code = status.get("ResultCode", "0")
            error_message = status.get("Error", "")
            
            # Handle token timeout - retry with fresh login
            if result_code == "0" and ("token was timed out" in error_message.lower() or "token" in error_message.lower() and "timeout" in error_message.lower()):
                logger.warning(f"Token timeout detected for {endpoint}, attempting fresh login and retry...")
                # Force token refresh by clearing current token
                old_token = self.token
                self.token = None
                self.token_expiry = None
                
                # Get fresh token
                fresh_token = await self._get_token()
                
                if fresh_token and endpoint != "Login" and fresh_token != old_token:
                    # Update payload with fresh token
                    payload["Token"] = fresh_token
                    logger.info(f"Retrying {endpoint} with fresh token (old: {old_token[:20] if old_token else 'None'}..., new: {fresh_token[:20]}...)")
                    
                    # Retry the request with fresh token
                    if method == "POST":
                        response = await client.post(url, json=payload, headers=headers)
                    else:
                        response = await client.get(url, params=payload, headers=headers)
                    
                    response.raise_for_status()
                    data = response.json()
                    status = data.get("Status", {})
                    result_code = status.get("ResultCode", "0")
                    error_message = status.get("Error", "")
                else:
                    logger.error("Failed to get fresh token or token unchanged, cannot retry")
            
            if result_code == "1":
                return data
            elif result_code == "0":
                error = status.get("Error", "Unknown error")
                logger.error(f"AirIQ API error: {error}")
                raise Exception(f"AirIQ API error: {error}")
            elif result_code == "-1":
                error = status.get("Error", "Unknown exception")
                logger.error(f"AirIQ API exception: {error}")
                raise Exception(f"AirIQ API exception: {error}")
            else:
                error = status.get("Error", "Unknown error")
                logger.error(f"AirIQ API unexpected response: {error}")
                raise Exception(f"AirIQ API error: {error}")
    
    def _format_date(self, date_obj: date) -> str:
        """Format date to YYYYMMDD format"""
        return date_obj.strftime("%Y%m%d")
    
    def _parse_datetime(self, date_str: str) -> Dict[str, str]:
        """Parse AirIQ datetime format (DD MMM YYYY HH:MM) to components"""
        try:
            dt = datetime.strptime(date_str, "%d %b %Y %H:%M")
            return {
                "time": dt.strftime("%H:%M"),
                "date": dt.strftime("%Y-%m-%d")
            }
        except:
            return {"time": "", "date": ""}
    
    async def search_availability(
        self,
        from_location: str,
        to_location: str,
        departure_date: date,
        return_date: Optional[date] = None,
        passengers: int = 1,
        child_count: int = 0,
        infant_count: int = 0,
        class_type: str = "economy",
        airline_id: str = "",
        fare_type: str = "N",
        only_direct: bool = False,
        trip_type_special: bool = False
    ) -> Dict[str, Any]:
        """
        Search for available flights using AirIQ Availability API
        
        Args:
            from_location: 3-letter IATA departure airport code
            to_location: 3-letter IATA arrival airport code
            departure_date: Departure date
            return_date: Return date (for round trip)
            passengers: Number of adult passengers (1-9)
            child_count: Number of child passengers (0-9, total with adults max 9)
            infant_count: Number of infant passengers (0-4)
            class_type: Cabin class (economy, premium, business, first)
            airline_id: 2-letter airline code (optional, empty for all airlines)
            fare_type: Fare type (N: Normal, C: Corporate, R: Retail)
            only_direct: True for direct flights only, False for all flights
            trip_type_special: True for RoundTrip Special (Y), False for normal (O/R)
        
        Returns:
            Dict containing ItineraryFlightList, Trackid, and Status
        """
        try:
            # Validate passenger counts
            if passengers < 1 or passengers > 9:
                raise ValueError("AdultCount must be between 1 and 9")
            if child_count < 0 or child_count > 9:
                raise ValueError("ChildCount must be between 0 and 9")
            if infant_count < 0 or infant_count > 4:
                raise ValueError("InfantCount must be between 0 and 4")
            if passengers + child_count > 9:
                raise ValueError("Total of AdultCount and ChildCount cannot exceed 9")
            if infant_count > 0 and passengers == 0:
                raise ValueError("Infant alone not allowed to travel")
            
            # Determine trip type
            if trip_type_special:
                trip_type = "Y"  # RoundTrip Special
            elif return_date:
                trip_type = "R"  # RoundTrip
            else:
                trip_type = "O"  # OneWay
            
            # Map class type to AirIQ cabin codes
            cabin_map = {
                "economy": "E",
                "premium": "P",
                "premium economy": "P",
                "business": "B",
                "first": "F",
                "first class": "F"
            }
            fare_cabin = cabin_map.get(class_type.lower(), "E")
            
            # Validate and format airport codes (must be 3 letters)
            dep_station = from_location.upper().strip()[:3]
            arr_station = to_location.upper().strip()[:3]
            
            if len(dep_station) != 3 or not dep_station.isalpha():
                raise ValueError(f"Invalid departure station code: {from_location}. Must be 3-letter IATA code.")
            if len(arr_station) != 3 or not arr_station.isalpha():
                raise ValueError(f"Invalid arrival station code: {to_location}. Must be 3-letter IATA code.")
            
            # Format date as yyyymmdd
            flight_date = self._format_date(departure_date)
            
            # Build availability info for departure
            avail_info = [{
                "DepartureStation": dep_station,
                "ArrivalStation": arr_station,
                "FlightDate": flight_date,
                "FarecabinOption": fare_cabin,
                "FareType": fare_type,
                "OnlyDirectFlight": only_direct
            }]
            
            # Add return flight if round trip
            if return_date and trip_type in ["R", "Y"]:
                return_date_str = self._format_date(return_date)
                avail_info.append({
                    "DepartureStation": arr_station,  # Return from destination
                    "ArrivalStation": dep_station,    # Return to origin
                    "FlightDate": return_date_str,
                    "FarecabinOption": fare_cabin,
                    "FareType": fare_type,
                    "OnlyDirectFlight": only_direct
                })
            
            # Build request payload according to AirIQ specification
            payload = {
                "TripType": trip_type,
                "AirlineID": airline_id.upper()[:2] if airline_id else "",  # 2-letter code max
                "AvailInfo": avail_info,
                "PassengersInfo": {
                    "AdultCount": str(passengers),
                    "ChildCount": str(child_count),
                    "InfantCount": str(infant_count)
                }
            }
            
            logger.info(f"Searching availability: {dep_station} -> {arr_station} on {flight_date}, TripType: {trip_type}")
            
            # Make request to Availability endpoint
            response = await self._make_request("Availability", payload)
            
            # Validate response
            status = response.get("Status", {})
            result_code = status.get("ResultCode", "0")
            
            if result_code == "1":
                track_id = response.get("Trackid", "")
                itinerary_list = response.get("ItineraryFlightList", [])
                logger.info(f"Availability search successful. TrackId: {track_id}, Found {len(itinerary_list)} itinerary options")
                return response
            elif result_code == "0":
                error = status.get("Error", "Request format is invalid")
                logger.error(f"Availability search failed: {error}")
                raise Exception(f"Availability search failed: {error}")
            elif result_code == "-1":
                error = status.get("Error", "EX-Unable to fetch the flight results.")
                logger.error(f"Availability search exception: {error}")
                raise Exception(f"Availability search exception: {error}")
            else:
                error = status.get("Error", "Unknown error")
                logger.error(f"Availability search unexpected response: {error}")
                raise Exception(f"Availability search error: {error}")
            
        except ValueError as e:
            logger.error(f"Validation error in availability search: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error searching availability: {str(e)}")
            raise
    
    async def get_pricing(
        self,
        track_id: str,
        flight_details: List[Dict[str, Any]],
        base_origin: str,
        base_destination: str,
        trip_type: str,
        passengers: int = 1
    ) -> Dict[str, Any]:
        """Get pricing for selected flights"""
        try:
            payload = {
                "SegmentInfo": {
                    "BaseOrigin": base_origin.upper()[:3],
                    "BaseDestination": base_destination.upper()[:3],
                    "TripType": trip_type,
                    "AdultCount": str(passengers),
                    "ChildCount": "0",
                    "InfantCount": "0"
                },
                "Trackid": track_id,
                "ItineraryInfo": [{
                    "FlightDetails": flight_details,
                    "BaseAmount": "0.00",  # Will be updated from response
                    "GrossAmount": "0.00"
                }]
            }
            
            response = await self._make_request("Pricing", payload)
            return response
            
        except Exception as e:
            logger.error(f"Error getting pricing: {str(e)}")
            raise
    
    async def book_flight(
        self,
        track_id: str,
        itinerary_flights_info: List[Dict[str, Any]],
        pax_details_info: List[Dict[str, Any]],
        address_details: Dict[str, Any],
        trip_type: str,
        base_origin: str,
        base_destination: str,
        block_pnr: bool = False,
        gst_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Book a flight"""
        try:
            payload = {
                "AdultCount": len([p for p in pax_details_info if p.get("PaxType") == "ADT"]),
                "ChildCount": len([p for p in pax_details_info if p.get("PaxType") == "CHD"]),
                "InfantCount": len([p for p in pax_details_info if p.get("PaxType") == "INF"]),
                "ItineraryFlightsInfo": itinerary_flights_info,
                "PaxDetailsInfo": pax_details_info,
                "AddressDetails": address_details,
                "TripType": trip_type,
                "BlockPNR": block_pnr,
                "BaseOrigin": base_origin.upper()[:3],
                "BaseDestination": base_destination.upper()[:3],
                "TrackId": track_id
            }
            
            if gst_info:
                payload["GSTInfo"] = gst_info
            else:
                payload["GSTInfo"] = {
                    "GSTNumber": "",
                    "GSTCompanyName": "",
                    "GSTAddress": "",
                    "GSTEmailID": "",
                    "GSTMobileNumber": ""
                }
            
            response = await self._make_request("Book", payload)
            return response
            
        except Exception as e:
            logger.error(f"Error booking flight: {str(e)}")
            raise
    
    async def get_booking_details(self, airiq_pnr: str) -> Dict[str, Any]:
        """Retrieve booking details by PNR"""
        try:
            payload = {
                "Item": [{
                    "AirIqPNR": airiq_pnr
                }]
            }
            
            response = await self._make_request("RetrieveBooking", payload)
            return response
            
        except Exception as e:
            logger.error(f"Error retrieving booking: {str(e)}")
            raise
    
    async def issue_ticket(
        self,
        booking_track_id: str,
        airiq_pnr: str,
        airline_pnr: str,
        booking_amount: float,
        payment_mode: str = "T"
    ) -> Dict[str, Any]:
        """Issue ticket for blocked booking"""
        try:
            payload = {
                "BookingTrackId": booking_track_id,
                "AirIqPNR": airiq_pnr,
                "AirlinePNR": airline_pnr,
                "BookingAmount": str(booking_amount),
                "PaymentMode": payment_mode
            }
            
            response = await self._make_request("IssueTicket", payload)
            return response
            
        except Exception as e:
            logger.error(f"Error issuing ticket: {str(e)}")
            raise
    
    async def get_balance(self) -> Dict[str, Any]:
        """Get account balance"""
        try:
            payload = {}
            response = await self._make_request("GetBalance", payload)
            return response
            
        except Exception as e:
            logger.error(f"Error getting balance: {str(e)}")
            raise

