"""
AirIQ Service - Clean implementation with proper token management
Handles all interactions with AirIQ API
"""
import base64
import httpx
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
from .config import AirIQConfig

logger = logging.getLogger(__name__)

# Singleton instance for token sharing across requests
_airiq_service_instance: Optional['AirIQService'] = None


class AirIQService:
    """Service for interacting with AirIQ API with singleton token management"""
    
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
            self.config = _airiq_service_instance.config
            self.token = _airiq_service_instance.token
            self.token_expiry = _airiq_service_instance.token_expiry
            self.token_created_at = _airiq_service_instance.token_created_at
            return
        
        # Initialize new instance
        self.config = AirIQConfig()
        # Initialize token from .env file if available
        self.token: Optional[str] = self.config.access_token if self.config.access_token else None
        self.token_expiry: Optional[datetime] = None
        self.token_created_at: Optional[datetime] = None
        
        # If token loaded from .env, set expiry to 24 hours from now (tokens valid for 24 hours)
        if self.token:
            now = datetime.now()
            # Tokens are valid for 24 hours
            self.token_expiry = now + timedelta(hours=24)
            self.token_created_at = now
            logger.info(f"Token loaded from .env file (AIR_IQ_ACCESS_TOKEN), valid for 24 hours (expires at {self.token_expiry})")
        
        if not self.config.is_configured:
            raise ValueError("AirIQ credentials not configured")
        
        # Store as singleton instance
        if not force_new:
            _airiq_service_instance = self
    
    def _get_auth_header(self) -> str:
        """
        Generate Base64 encoded authorization header for AirIQ API
        
        Per AirIQ documentation:
        - Format: AgentID*Username:Password (Base64 encoded)
        - Example: QUdFTlRJRCpNT0JJTEVOTzpQQVNTV09SRA==
        - The Authorization header contains ONLY the Base64 string (no "Basic " prefix)
        
        Returns:
            Base64 encoded string for Authorization header
        """
        auth_string = self.config.get_auth_string()
        return base64.b64encode(auth_string.encode()).decode()
    
    async def login(self) -> Dict[str, Any]:
        """
        Login to AirIQ API and get authentication token
        
        Per AirIQ documentation:
        - Uses HTTP Basic Authentication with AgentID*Username:Password (Base64 encoded)
        - Token must be included in each future request after login
        - Token expires at end of day (23:59:59)
        - Maximum 5 active logins allowed per user account (enforced by AirIQ API)
        
        Response codes:
        - ResultCode "1": Success
        - ResultCode "0": Failure (Invalid Credentials)
        - ResultCode "-1": Exception (Unable to authenticate)
        
        Returns:
            Full login response including Token, AgentID, UserName, and Status
        """
        try:
            # Construct Login URL - AirIQ API uses /TravelAPI.svc/ path
            base_url = self.config.base_url.rstrip('/')
            if '/TravelAPI.svc' not in base_url:
                url = f"{base_url}/TravelAPI.svc/Login"
            else:
                base_url = base_url.rstrip('/TravelAPI.svc').rstrip('/')
                url = f"{base_url}/TravelAPI.svc/Login"
            
            auth_header = self._get_auth_header()
            
            logger.info(f"Attempting AirIQ login to: {url}")
            
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
                    # Success - ResultCode "1" per AirIQ documentation
                    token = data.get("Token", "")
                    if not token:
                        raise Exception("Login successful but no token received in response")
                    
                    self.token = token
                    self.config.agent_id = data.get("AgentID", self.config.agent_id)
                    self.config.username = data.get("UserName", self.config.username)
                    
                    # Token expires after 24 hours per AirIQ documentation
                    now = datetime.now()
                    self.token_expiry = now + timedelta(hours=24)
                    self.token_created_at = now
                    
                    # Update singleton instance if it exists
                    global _airiq_service_instance
                    if _airiq_service_instance and _airiq_service_instance != self:
                        _airiq_service_instance.token = token
                        _airiq_service_instance.token_expiry = self.token_expiry
                        _airiq_service_instance.token_created_at = now
                    
                    logger.info(f"Successfully logged in to AirIQ. Token expires at {self.token_expiry}")
                    logger.debug(f"Response: AgentID={self.config.agent_id}, UserName={self.config.username}, Token length={len(token)}")
                    return data
                elif result_code == "0":
                    # Failure - ResultCode "0" per AirIQ documentation
                    error = status.get("Error", "Invalid Credentials")
                    logger.error(f"AirIQ login failed (ResultCode 0): {error}")
                    
                    # Check for login limit exceeded error
                    if "login limit" in error.lower() or "limit has been exceeded" in error.lower():
                        error_msg = (
                            f"AirIQ login limit exceeded: {error}. "
                            "All AirIQ APIs require a valid login token. "
                            "Please contact AirIQ support to clear active sessions or wait for existing sessions to expire. "
                            "Maximum 5 concurrent logins allowed per Agent ID."
                        )
                        logger.error(error_msg)
                        raise Exception(error_msg)
                    
                    raise Exception(f"AirIQ authentication failed: {error}")
                elif result_code == "-1":
                    # Exception - ResultCode "-1" per AirIQ documentation
                    error = status.get("Error", "EX-Unable to authenticate")
                    logger.error(f"AirIQ login exception (ResultCode -1): {error}")
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
        
        IMPORTANT: All AirIQ APIs require a valid login token. This method ensures
        we have a valid token before making any API calls.
        
        Token Management:
        - Tokens are valid for 24 hours
        - We reuse existing tokens as long as they're valid (no unnecessary logins)
        - Only logs in when token is missing or expired
        - Singleton pattern ensures only one token is used across all requests
        
        Args:
            force_refresh: If True, forces a new login even if token exists
        
        Returns:
            Valid authentication token string
        
        Raises:
            Exception: If login fails (including login limit exceeded)
        """
        if not force_refresh:
            now = datetime.now()
            # Reuse token if it exists and hasn't expired (valid until end of day)
            if self.token and self.token_expiry and now < self.token_expiry:
                logger.debug(f"Reusing existing token (expires at {self.token_expiry}, valid for {int((self.token_expiry - now).total_seconds() / 60)} more minutes)")
                return self.token
        
        # Token expired, missing, or force refresh - login to get new token
        logger.info("Token missing or expired. Performing login to get new token...")
        login_response = await self.login()
        
        if not self.token:
            raise Exception("Failed to obtain token from login response")
        
        logger.info(f"Successfully obtained new token (expires at {self.token_expiry})")
        return self.token
    
    def _get_agent_info(self) -> Dict[str, Any]:
        """Get agent info for API requests"""
        return {
            "AgentId": self.config.agent_id,
            "UserName": self.config.username,
            "AppType": self.config.app_type,
            "Version": self.config.version
        }
    
    async def _make_request(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        method: str = "POST",
        provided_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Make authenticated request to AirIQ API
        
        IMPORTANT: All AirIQ APIs (except Login) require a valid authentication token.
        This method automatically ensures we have a valid token before making the request.
        
        Per AirIQ documentation:
        - Uses HTTP Basic Auth (AgentID*Username:Password Base64 encoded) for all requests
        - Token from login must be included in each future request (in payload)
        - Token is also included in X-Auth-Token header for compatibility
        - All APIs are locked and depend on the login token
        
        Args:
            endpoint: API endpoint name (e.g., "Availability", "Pricing", "Book")
            payload: Request payload dictionary
            method: HTTP method ("POST" or "GET")
        
        Returns:
            Response data dictionary
        
        Raises:
            Exception: If token cannot be obtained (including login limit exceeded)
        """
        # Use provided token or stored token (DO NOT auto-login to avoid hitting 5 login limit)
        # NOTE: All AirIQ APIs require a valid token - they are locked without it
        token = None
        if endpoint != "Login":
            # Use provided token first (from header), then fall back to stored token
            # DO NOT auto-login - user must provide token to avoid hitting login limit
            if provided_token:
                token = provided_token
                logger.info(f"Using provided token for {endpoint} request (no auto-login)")
            elif self.token:
                token = self.token
                logger.info(f"Using stored token for {endpoint} request (no auto-login)")
            else:
                raise Exception(
                    "No token provided. All AirIQ APIs require a valid login token. "
                    "Please provide TOKEN header or login first at /airiq/login. "
                    "Auto-login is disabled to prevent hitting the 5 login limit per day."
                )
        
        # Construct URL - AirIQ API uses /TravelAPI.svc/ path for all endpoints
        base_url = self.config.base_url.rstrip('/')
        # Ensure /TravelAPI.svc/ is in the path
        if '/TravelAPI.svc' not in base_url:
            url = f"{base_url}/TravelAPI.svc/{endpoint}"
        else:
            # Remove any trailing slashes and construct properly
            base_url = base_url.rstrip('/TravelAPI.svc').rstrip('/')
            url = f"{base_url}/TravelAPI.svc/{endpoint}"
        
        # Add agent info and token to payload (for all endpoints except Login)
        if endpoint != "Login":
            agent_info = self._get_agent_info()
            payload["AgentInfo"] = agent_info
            
            # Include token in payload as per AirIQ documentation
            if token:
                payload["Token"] = token
                logger.debug(f"Including token in {endpoint} request")
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            auth_header = self._get_auth_header()
            
            headers = {
                "Authorization": auth_header,
                "Content-Type": "application/json"
            }
            
            # Add token to header for all non-Login endpoints
            # AirIQ requires ONLY ONE token header: "TOKEN" (uppercase, as shown in Postman)
            # AirIQ rejects redundant/duplicate auth headers
            if endpoint != "Login" and token:
                headers["TOKEN"] = token  # Only send TOKEN header (uppercase, matching Postman)
                logger.info(f"Request URL: {url}")
                logger.info(f"Token in header: TOKEN={token[:50]}... (length: {len(token)})")
                logger.debug(f"Request payload keys: {list(payload.keys())}")
            
            if method == "POST":
                logger.debug(f"Making POST request to {url}")
                response = await client.post(url, json=payload, headers=headers)
            else:
                logger.debug(f"Making GET request to {url}")
                response = await client.get(url, params=payload, headers=headers)
            
            response.raise_for_status()
            data = response.json()
            
            # Check for errors in response
            status = data.get("Status", {})
            result_code = status.get("ResultCode", "0")
            error_message = status.get("Error", "")
            
            # Tokens are valid for 24 hours - just pass through AirIQ API errors
            # Don't preemptively detect "timeout" - let AirIQ API determine token validity
            if result_code == "1":
                return data
            elif result_code == "0":
                error = status.get("Error", "Unknown error")
                logger.error(f"AirIQ API error (ResultCode 0): {error}")
                # Pass through the actual error from AirIQ API
                raise Exception(f"AirIQ API error: {error}")
            elif result_code == "-1":
                error = status.get("Error", "Unknown exception")
                logger.error(f"AirIQ API exception (ResultCode -1): {error}")
                raise Exception(f"AirIQ API exception: {error}")
            else:
                error = status.get("Error", "Unknown error")
                logger.error(f"AirIQ API unexpected response: {error}")
                raise Exception(f"AirIQ API error: {error}")
    
    def _format_date(self, date_obj: date) -> str:
        """Format date to YYYYMMDD format"""
        return date_obj.strftime("%Y%m%d")
    
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
        trip_type_special: bool = False,
        provided_token: Optional[str] = None
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
                    "DepartureStation": arr_station,
                    "ArrivalStation": dep_station,
                    "FlightDate": return_date_str,
                    "FarecabinOption": fare_cabin,
                    "FareType": fare_type,
                    "OnlyDirectFlight": only_direct
                })
            
            # Build request payload
            payload = {
                "TripType": trip_type,
                "AirlineID": airline_id.upper()[:2] if airline_id else "",
                "AvailInfo": avail_info,
                "PassengersInfo": {
                    "AdultCount": str(passengers),
                    "ChildCount": str(child_count),
                    "InfantCount": str(infant_count)
                }
            }
            
            logger.info(f"Searching availability: {dep_station} -> {arr_station} on {flight_date}, TripType: {trip_type}")
            
            # Make request to Availability endpoint (use provided token, no auto-login)
            response = await self._make_request("Availability", payload, provided_token=provided_token)
            
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
        passengers: int = 1,
        child_count: int = 0,
        infant_count: int = 0,
        provided_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get pricing for selected flights using AirIQ Pricing API"""
        try:
            payload = {
                "SegmentInfo": {
                    "BaseOrigin": base_origin.upper()[:3],
                    "BaseDestination": base_destination.upper()[:3],
                    "TripType": trip_type,
                    "AdultCount": str(passengers),
                    "ChildCount": str(child_count),
                    "InfantCount": str(infant_count)
                },
                "Trackid": track_id,
                "ItineraryInfo": [{
                    "FlightDetails": flight_details,
                    "BaseAmount": "0.00",
                    "GrossAmount": "0.00"
                }]
            }
            
            response = await self._make_request("Pricing", payload, provided_token=provided_token)
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
        gst_info: Optional[Dict[str, Any]] = None,
        provided_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Book a flight using AirIQ Booking API"""
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
            
            response = await self._make_request("Book", payload, provided_token=provided_token)
            return response
            
        except Exception as e:
            logger.error(f"Error booking flight: {str(e)}")
            raise
    
    async def get_booking_details(self, airiq_pnr: str, provided_token: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve booking details by PNR using AirIQ RetrieveBooking API"""
        try:
            payload = {
                "Item": [{
                    "AirIqPNR": airiq_pnr
                }]
            }
            
            response = await self._make_request("RetrieveBooking", payload, provided_token=provided_token)
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
        payment_mode: str = "T",
        provided_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Issue ticket for blocked booking using AirIQ IssueTicket API"""
        try:
            payload = {
                "BookingTrackId": booking_track_id,
                "AirIqPNR": airiq_pnr,
                "AirlinePNR": airline_pnr,
                "BookingAmount": str(booking_amount),
                "PaymentMode": payment_mode
            }
            
            response = await self._make_request("IssueTicket", payload, provided_token=provided_token)
            return response
            
        except Exception as e:
            logger.error(f"Error issuing ticket: {str(e)}")
            raise
    
    async def get_balance(self, provided_token: Optional[str] = None) -> Dict[str, Any]:
        """Get account balance using AirIQ GetBalance API"""
        try:
            payload = {}
            response = await self._make_request("GetBalance", payload, provided_token=provided_token)
            return response
            
        except Exception as e:
            logger.error(f"Error getting balance: {str(e)}")
            raise

