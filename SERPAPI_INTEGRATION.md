# SerpApi Google Flights Integration

This document describes the integration of SerpApi Google Flights API into the SafarBot application for real-time flight search and booking options.

## Overview

The integration provides:
- **Flight Search**: Real-time flight search using Google Flights data
- **Booking Options**: Detailed booking options with pricing from multiple providers
- **Mock Data Fallback**: Comprehensive mock data when API is not available
- **Error Handling**: Graceful fallback to mock data on API errors

## API Endpoints

### 1. Flight Search
```
POST /api/v1/flights/search
```

**Request Body:**
```json
{
  "from_location": "CDG",
  "to_location": "LHR", 
  "departure_date": "2025-08-03",
  "return_date": "2025-08-09",
  "passengers": 1,
  "class_type": "economy"
}
```

**Response:**
```json
{
  "success": true,
  "flights": [
    {
      "id": "flight_1",
      "price": 8500,
      "currency": "INR",
      "booking_token": "WyJDalJJYjJkRGNubFBWekpGVkhkQlFUazJTa0ZDUnkwdExTMHRMUzB0TFhCbVltWnhOa0ZCUVVGQlIxWm5UWE5SUlY5RU4wRkJFZ2RDUVRNeU9DTXhHZ3NJMTVJQkVBSWFBMVZUUkRnY2NOZVNBUT09IixbWyJDREciLCIyMDIzLTEyLTA1IiwiTEhSIixudWxsLCJCQSIsIjMwMyJdXSxbWyJMSFIiLCIyMDIzLTEyLTI4IiwiQ0RHIixudWxsLCJCQSIsIjMyOCJdXV0=",
      "flight_segments": [...],
      "carbon_emissions": {...}
    }
  ],
  "total_count": 1,
  "message": "Found 1 flights from CDG to LHR"
}
```

### 2. Booking Options
```
GET /api/v1/flights/booking-options/{booking_token}
```

**Response:**
```json
{
  "selected_flights": [
    {
      "id": "selected_flight_1",
      "flight_segments": [
        {
          "airline": "British Airways",
          "flight_number": "BA 303",
          "departure": {
            "airport": "CDG",
            "airport_name": "Paris Charles de Gaulle",
            "time": "07:15",
            "date": "2023-12-05"
          },
          "arrival": {
            "airport": "LHR", 
            "airport_name": "Heathrow Airport",
            "time": "07:40",
            "date": "2023-12-05"
          },
          "duration": "1h 25m",
          "amenities": ["WiFi", "Power Outlets", "Entertainment"]
        }
      ]
    }
  ],
  "booking_options": [
    {
      "separate_tickets": false,
      "together": {
        "book_with": "British Airways",
        "price": 8500,
        "local_prices": [{"currency": "INR", "price": 8500}],
        "option_title": "Basic Economy",
        "extensions": ["No refunds", "Ticket changes for a fee"],
        "baggage_prices": ["1 free carry-on", "1st checked bag: ₹1500"],
        "booking_request": {
          "url": "https://www.britishairways.com/booking",
          "post_data": "booking_data"
        },
        "booking_phone": "+44-20-8738-5050"
      }
    }
  ],
  "price_insights": {
    "lowest_price": 8100,
    "price_level": "typical",
    "typical_price_range": [7500, 12000]
  },
  "baggage_prices": {
    "together": ["1 free carry-on", "1st checked bag: ₹1500-2500"]
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# SerpApi Configuration
SERP_API_KEY=your_serp_api_key_here

# Optional: Override default settings
SERP_API_CURRENCY=INR
SERP_API_LANGUAGE=en
```

### API Key Setup

1. Sign up at [SerpApi](https://serpapi.com/)
2. Get your API key from the dashboard
3. Add it to your `.env` file
4. The system will automatically use real API when key is available

## Integration Features

### 1. Real API Integration
- **Flight Search**: Uses SerpApi Google Flights engine
- **Booking Options**: Retrieves real booking options with pricing
- **Airport Data**: Real airport information and codes
- **Flight Details**: Comprehensive flight information including amenities

### 2. Mock Data Fallback
- **Automatic Fallback**: When API key is not available
- **Comprehensive Mock Data**: Realistic flight and booking data
- **Consistent Format**: Same response structure as real API
- **Testing Support**: Full functionality for development

### 3. Error Handling
- **API Errors**: Graceful fallback to mock data
- **Network Issues**: Automatic retry and fallback
- **Invalid Tokens**: Proper error messages
- **Rate Limiting**: Handled automatically by SerpApi

### 4. Data Parsing
- **Flight Segments**: Parsed from SerpApi response
- **Amenities**: Extracted from flight extensions
- **Pricing**: Multiple currency support
- **Carbon Emissions**: Environmental impact data

## Usage Examples

### Frontend Integration

```typescript
// Search for flights
const searchResponse = await flightAPI.searchFlights({
  from_location: "CDG",
  to_location: "LHR",
  departure_date: "2025-08-03",
  return_date: "2025-08-09",
  passengers: 1,
  class_type: "economy"
});

// Get booking options
const bookingOptions = await flightAPI.getBookingOptions(
  searchResponse.flights[0].booking_token
);
```

### Backend Testing

```python
# Test flight service directly
flight_service = FlightService()
flights = await flight_service.search_flights(
    from_location="CDG",
    to_location="LHR", 
    departure_date=date(2025, 8, 3),
    return_date=date(2025, 8, 9)
)

# Test booking options
booking_options = await flight_service.get_booking_options(
    flights[0]["booking_token"]
)
```

## Server Startup

### Option 1: Full Server (with all services)
```bash
cd server
python main.py
```

### Option 2: Flight Service Only (recommended for testing)
```bash
python start_flight_server.py
```

### Option 3: Minimal Server
```bash
cd server
python minimal_server.py
```

## Testing

### Run Integration Tests
```bash
python test_serpapi_integration.py
```

### Test Frontend Flow
```bash
python test_frontend_flow.py
```

### Test API Endpoints
```bash
python test_api_debug.py
```

## API Response Structure

### Flight Search Response
- `success`: Boolean indicating success
- `flights`: Array of flight objects
- `total_count`: Number of flights found
- `message`: Human-readable message

### Flight Object
- `id`: Unique flight identifier
- `price`: Flight price
- `currency`: Price currency
- `booking_token`: Token for booking options
- `flight_segments`: Array of flight segments
- `carbon_emissions`: Environmental data
- `amenities`: Available amenities

### Booking Options Response
- `selected_flights`: Array of selected flight details
- `booking_options`: Array of booking options
- `price_insights`: Price analysis data
- `baggage_prices`: Baggage pricing information

## Error Codes

- `200`: Success
- `400`: Bad request (invalid parameters)
- `404`: Flight or booking token not found
- `500`: Internal server error
- `503`: Service unavailable (API error)

## Rate Limits

SerpApi has rate limits based on your plan:
- **Free Plan**: 100 searches/month
- **Paid Plans**: Higher limits available

The system handles rate limiting automatically.

## Troubleshooting

### Common Issues

1. **No flights returned**
   - Check API key validity
   - Verify date format (YYYY-MM-DD)
   - Check airport codes

2. **Booking options not available**
   - Ensure booking token is valid
   - Check if flight is still available
   - Verify API key permissions

3. **Server won't start**
   - Install required dependencies
   - Check Python version (3.7+)
   - Verify file permissions

### Debug Mode

Enable debug logging by setting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Dependencies

Required packages:
```
fastapi
uvicorn
python-dotenv
serpapi
requests
```

Install with:
```bash
pip install fastapi uvicorn python-dotenv serpapi requests
```

## Security Considerations

- **API Key Protection**: Store API keys in environment variables
- **Input Validation**: All inputs are validated using Pydantic
- **CORS Configuration**: Properly configured for frontend access
- **Error Handling**: No sensitive data in error messages

## Performance

- **Caching**: Consider implementing response caching
- **Connection Pooling**: SerpApi handles connection management
- **Async Operations**: All API calls are asynchronous
- **Timeout Handling**: 30-second timeout for API calls

## Future Enhancements

- **Response Caching**: Cache flight search results
- **WebSocket Support**: Real-time flight updates
- **Multi-Provider**: Support for additional flight APIs
- **Advanced Filtering**: More sophisticated search filters 