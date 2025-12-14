# AirIQ API Integration Guide

## Overview
This document describes the AirIQ API integration for actual flight booking in SafarBot. The integration replaces the SERP API for flight search and provides real booking capabilities.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# AirIQ API Configuration
AIRIQ_URL=https://api.airiqonline.in  # Base URL for AirIQ API
AIRIQ_AGENT_ID=your_agent_id
AIRIQ_USERNAME=your_username
AIRIQ_PASSWORD=your_password
```

## Architecture

### Services

1. **AirIQService** (`server/services/airiq_service.py`)
   - Handles authentication and token management
   - Provides methods for all AirIQ API endpoints
   - Manages token expiry (tokens expire at end of day)

2. **AirIQMapper** (`server/services/airiq_mapper.py`)
   - Converts AirIQ API responses to frontend-expected format
   - Maps availability, pricing, and booking responses

3. **FlightService** (`server/services/flight_service.py`)
   - Updated to use AirIQ as primary API
   - Falls back to SERP API if AirIQ is unavailable
   - Provides unified interface for flight operations

### API Endpoints

#### 1. Search Flights
- **Endpoint**: `POST /flights/search`
- **Uses**: AirIQ Availability API
- **Returns**: List of available flights in frontend format

#### 2. Get Booking Options
- **Endpoint**: `GET /flights/booking-options/{booking_token}`
- **Uses**: AirIQ TrackId from availability response
- **Returns**: Booking options structure

#### 3. Book Flight
- **Endpoint**: `POST /flights/book`
- **Uses**: AirIQ Booking API
- **Request Body**:
```json
{
  "track_id": "AQ...",
  "flight_details": [...],
  "passenger_details": [...],
  "contact_info": {...},
  "trip_type": "O",
  "base_origin": "BOM",
  "base_destination": "DEL",
  "block_pnr": false
}
```

## Authentication

AirIQ uses HTTP Basic Authentication:
- Format: `AgentID*Username:Password` (Base64 encoded)
- Token is obtained via Login endpoint
- Token expires at end of day
- Token is automatically refreshed when needed

## Data Flow

1. **Search Flow**:
   - User searches flights → AirIQ Availability API → Mapper converts response → Frontend receives flights

2. **Booking Flow**:
   - User selects flight → Get pricing (optional) → Book flight → AirIQ Booking API → Return booking confirmation

## Error Handling

- All AirIQ API errors are caught and logged
- User-friendly error messages are returned
- Fallback to SERP API if AirIQ fails (for search only)

## Security

- All credentials stored in environment variables
- No hardcoded values
- Token management with automatic refresh
- Secure HTTP requests with timeout handling

## Testing

To test the integration:

1. Set up environment variables
2. Test search: `POST /flights/search` with flight search request
3. Test booking: `POST /flights/book` with booking request

## Notes

- AirIQ API requires valid credentials from AiriqOnline.in
- Maximum 5 concurrent logins per account
- Tokens expire at end of day (23:59:59)
- Booking requires pricing step before actual booking

