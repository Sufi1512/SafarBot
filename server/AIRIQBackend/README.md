# AIRIQ Backend

Clean, organized implementation of AirIQ API integration for flight search and booking.

## Structure

```
AIRIQBackend/
├── __init__.py          # Package exports
├── config.py            # AirIQ configuration and credentials
├── service.py           # Core AirIQ service with token management
├── mapper.py            # Response transformation to frontend format
├── models.py            # Pydantic request/response models
├── router.py            # FastAPI endpoints
└── README.md           # This file
```

## Features

- **Singleton Token Management**: Shared token across all requests to prevent timeouts
- **Automatic Token Refresh**: Handles token expiration and retries automatically
- **Clean Architecture**: Separated concerns (config, service, mapper, router)
- **Type Safety**: Pydantic models for request/response validation
- **Error Handling**: Comprehensive error handling with retry logic

## Configuration

Set the following environment variables:

```bash
AIRIQ_URL=https://api.airiq.com
AIRIQ_AGENT_ID=your_agent_id
AIRIQ_USERNAME=your_username
AIRIQ_PASSWORD=your_password
```

## API Endpoints

All endpoints are prefixed with `/airiq`:

- `POST /airiq/login` - Login and get authentication token
- `POST /airiq/availability` - Search for available flights
- `POST /airiq/availability/test` - Test endpoint (returns raw response)
- `POST /airiq/pricing` - Get pricing for selected flights
- `POST /airiq/book` - Book a flight
- `GET /airiq/booking/{airiq_pnr}` - Retrieve booking details
- `POST /airiq/issue-ticket` - Issue ticket for blocked booking
- `GET /airiq/balance` - Get account balance

## Usage

### In Code

```python
from AIRIQBackend import AirIQService, AirIQMapper

# Initialize service (singleton pattern)
airiq = AirIQService()

# Search for flights
response = await airiq.search_availability(
    from_location="DEL",
    to_location="BOM",
    departure_date=date(2024, 12, 25),
    passengers=1,
    class_type="economy"
)

# Map to frontend format
flights = AirIQMapper.map_availability_to_flights(response)
```

### Via API

```bash
# Search flights
curl -X POST "http://localhost:8000/airiq/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "from_location": "DEL",
    "to_location": "BOM",
    "departure_date": "2024-12-25",
    "passengers": 1,
    "class_type": "economy"
  }'
```

## Authentication

### HTTP Basic Authentication

Per AirIQ documentation:
- **Format**: `AgentID*Username:Password` (Base64 encoded)
- **Authorization Header**: Contains only the Base64 string (no "Basic " prefix)
- **Example**: `QUdFTlRJRCpNT0JJTEVOTzpQQVNTV09SRA==`

### Response Codes
- **ResultCode "1"**: Success - Token received
- **ResultCode "0"**: Failure - Invalid Credentials
- **ResultCode "-1"**: Exception - Unable to authenticate

#### Token Management

**IMPORTANT: All AirIQ APIs are locked and require a valid login token.**

The service uses a singleton pattern to share tokens across requests and minimize logins:

1. **First Request**: Logs in and stores token
2. **Subsequent Requests**: Reuses existing token if valid (tokens valid until end of day)
3. **Token Expiry**: Automatically refreshes when token expires (end of day at 23:59:59)
4. **Timeout Handling**: Automatically retries with fresh token on timeout errors
5. **Token in Requests**: Token is included in both:
   - Request payload (`payload["Token"]`) - **Required for all APIs**
   - X-Auth-Token header (for compatibility)

**Key Points:**
- **All APIs require token**: Availability, Pricing, Booking, etc. all need a valid token
- **Token reuse**: Tokens are reused until end of day to avoid unnecessary logins
- **No API access without token**: If login fails, all other APIs will fail

### Login Limits

- **Maximum 5 active logins** allowed per user account (enforced by AirIQ API)
- If exceeded, new login attempts will be blocked by AirIQ
- **Impact**: When login limit is exceeded, ALL APIs become inaccessible
- The singleton pattern helps prevent multiple concurrent logins
- **Solution**: Contact AirIQ support to clear active sessions or wait for sessions to expire

## Integration with Flight Service

The `FlightService` in `services/flight_service.py` uses this backend:

```python
from AIRIQBackend import AirIQService, AirIQMapper

# FlightService automatically uses AirIQ backend
flight_service = FlightService()
flights = await flight_service.search_flights(...)
```

## Important Notes

- **All AirIQ APIs are locked and depend on login token** - No API can be accessed without a valid token
- Tokens expire at end of day (23:59:59) - Reused until expiration to minimize logins
- Token is included in both payload and X-Auth-Token header
- All requests use HTTP Basic Auth (AgentID*Username:Password Base64 encoded)
- Automatic retry on token timeout errors
- **Login limit exceeded error**: If you see "login limit has been exceeded", contact AirIQ support

