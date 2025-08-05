# Google Flights Booking Options API Integration

## Overview

This document describes the integration of Google Flights Booking Options API into the SafarBot backend. The integration allows users to get detailed booking options for specific flights using booking tokens obtained from flight search results.

## API Structure

### Endpoint
```
GET /flights/booking-options/{booking_token}
```

### Response Model
The API returns a structured response containing:

1. **Selected Flights**: Details of the flights selected for booking
2. **Baggage Prices**: Baggage allowance and pricing information
3. **Booking Options**: Available booking options from different sellers
4. **Price Insights**: Price analysis and recommendations

## Implementation Details

### 1. Backend Models (`server/models.py`)

New Pydantic models have been added to support the booking options structure:

```python
class LocalPrice(BaseModel):
    currency: str
    price: float

class BookingRequest(BaseModel):
    url: str
    post_data: str

class BookingOption(BaseModel):
    book_with: str
    airline_logos: List[str]
    marketed_as: List[str]
    price: float
    local_prices: List[LocalPrice]
    option_title: Optional[str] = None
    extensions: List[str] = []
    baggage_prices: List[str] = []
    booking_request: Optional[BookingRequest] = None
    booking_phone: Optional[str] = None
    estimated_phone_service_fee: Optional[float] = None

class BookingOptionGroup(BaseModel):
    separate_tickets: bool = False
    together: Optional[BookingOption] = None
    departing: Optional[BookingOption] = None
    returning: Optional[BookingOption] = None

class PriceInsights(BaseModel):
    lowest_price: int
    price_level: str
    typical_price_range: List[int]
    price_history: Optional[List[List[int]]] = None

class BookingOptionsResponse(BaseModel):
    selected_flights: List[Dict[str, Any]]
    baggage_prices: Dict[str, List[str]]
    booking_options: List[BookingOptionGroup]
    price_insights: Optional[PriceInsights] = None
```

### 2. Flight Service (`server/services/flight_service.py`)

The `FlightService` class has been enhanced with:

#### New Methods:
- `get_booking_options(booking_token: str)`: Retrieves booking options using SERP API
- `_parse_booking_options()`: Parses SERP API response
- `_parse_booking_option_detail()`: Parses individual booking option details

#### Key Features:
- **Real API Integration**: Uses Google SERP API when valid API key is provided
- **Mock Data Fallback**: Provides realistic mock data for testing
- **Error Handling**: Graceful fallback to mock data on API errors
- **Structured Parsing**: Properly structures SERP API responses

### 3. API Router (`server/routers/flights.py`)

The booking options endpoint has been updated:

```python
@router.get("/flights/booking-options/{booking_token}", response_model=BookingOptionsResponse)
async def get_booking_options(booking_token: str):
    """Get booking options for a specific flight using booking token"""
    try:
        logger.info(f"Getting booking options for token: {booking_token}")
        booking_options = await flight_service.get_booking_options(booking_token)
        return booking_options
    except Exception as e:
        logger.error(f"Error getting booking options: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting booking options: {str(e)}")
```

## API Response Structure

### Example Response
```json
{
  "selected_flights": [
    {
      "id": "mock_flight_1",
      "price": 8500,
      "currency": "INR",
      "stops": 0,
      "total_duration": "2h 15m",
      "flight_type": "One way",
      "airline_logo": "https://www.gstatic.com/flights/airline_logos/70px/AI.png",
      "carbon_emissions": {
        "this_flight": 85000,
        "typical_for_route": 80000,
        "difference_percent": 6
      },
      "extensions": [
        "Average legroom (30 in)",
        "Wi-Fi for a fee",
        "In-seat power outlet"
      ],
      "flight_segments": [...],
      "layovers": [],
      "rating": 4.2,
      "amenities": ["WiFi", "Entertainment", "Meal"]
    }
  ],
  "baggage_prices": {
    "together": [
      "1 free carry-on",
      "1st checked bag: ₹1500-2500"
    ]
  },
  "booking_options": [
    {
      "separate_tickets": false,
      "together": {
        "book_with": "Air India",
        "airline_logos": [
          "https://www.gstatic.com/flights/airline_logos/70px/AI.png"
        ],
        "marketed_as": ["AI 101"],
        "price": 8500,
        "local_prices": [
          {
            "currency": "INR",
            "price": 8500
          }
        ],
        "option_title": "Basic Economy",
        "extensions": [
          "No refunds",
          "Ticket changes for a fee",
          "Seat selection for a fee",
          "Standard seat"
        ],
        "baggage_prices": [
          "1 free carry-on",
          "1st checked bag: ₹1500"
        ],
        "booking_request": {
          "url": "https://www.airindia.in/booking",
          "post_data": "mock_booking_data"
        },
        "booking_phone": "+91-1800-180-1407",
        "estimated_phone_service_fee": 500
      }
    }
  ],
  "price_insights": {
    "lowest_price": 8100,
    "price_level": "typical",
    "typical_price_range": [7500, 12000]
  }
}
```

## Usage Flow

### 1. Flight Search
1. User searches for flights using `/flights/search`
2. Each flight in the response includes a `booking_token`
3. Frontend stores the booking token for selected flights

### 2. Get Booking Options
1. User selects a flight
2. Frontend calls `/flights/booking-options/{booking_token}`
3. Backend retrieves detailed booking options from SERP API
4. Response includes all available booking channels and prices

### 3. Booking Process
1. User selects a booking option
2. Frontend can use the `booking_request` data to redirect to the booking site
3. Alternative booking via phone using provided phone numbers

## Configuration

### Environment Variables
```bash
# SERP API Key for Google Flights
SERP_API_KEY=your_serp_api_key_here
```

### API Key Setup
1. Sign up for SERP API at https://serpapi.com/
2. Get your API key from the dashboard
3. Add the key to your environment variables
4. The system will automatically use real API when key is valid

## Testing

### Test Script
Run the test script to verify integration:

```bash
python test_booking_options.py
```

### Test Coverage
- ✅ Booking options retrieval with mock data
- ✅ Flight search with booking tokens
- ✅ Response structure validation
- ✅ Error handling and fallback

## Mock Data

When no valid SERP API key is provided, the system uses realistic mock data including:

- **Multiple Booking Options**: Air India, MakeMyTrip, Goibibo, Yatra
- **Price Variations**: Different prices for same flight
- **Baggage Information**: Realistic baggage policies
- **Booking Details**: Phone numbers and booking URLs
- **Price Insights**: Typical price ranges and recommendations

## Error Handling

### Fallback Strategy
1. **Primary**: Use SERP API with valid key
2. **Fallback**: Use mock data for testing
3. **Error Response**: Proper HTTP error codes and messages

### Common Issues
- **Invalid API Key**: Falls back to mock data
- **API Rate Limits**: Handled gracefully
- **Network Errors**: Proper error logging and fallback
- **Invalid Booking Token**: Returns appropriate error response

## Frontend Integration

### API Calls
```javascript
// Get booking options for a flight
const response = await fetch(`/api/flights/booking-options/${bookingToken}`);
const bookingOptions = await response.json();

// Display booking options
bookingOptions.booking_options.forEach(option => {
  console.log(`Book with: ${option.together.book_with}`);
  console.log(`Price: ₹${option.together.price}`);
  console.log(`Phone: ${option.together.booking_phone}`);
});
```

### UI Components
- **Booking Options List**: Display all available booking channels
- **Price Comparison**: Show price differences between options
- **Baggage Information**: Display baggage policies
- **Booking Actions**: Direct booking links and phone numbers

## Future Enhancements

### Planned Features
1. **Real-time Price Updates**: WebSocket integration for live pricing
2. **Booking Confirmation**: Track booking status
3. **Payment Integration**: Direct payment processing
4. **Multi-currency Support**: Dynamic currency conversion
5. **Advanced Filtering**: Filter by price, airline, booking channel

### Performance Optimizations
1. **Caching**: Cache booking options for frequently searched routes
2. **Rate Limiting**: Implement proper rate limiting for API calls
3. **Response Compression**: Compress large responses
4. **CDN Integration**: Serve static assets via CDN

## Troubleshooting

### Common Issues

#### 1. No Booking Options Returned
- Check if booking token is valid
- Verify SERP API key is configured
- Check API rate limits

#### 2. Mock Data Always Used
- Verify SERP_API_KEY environment variable
- Check API key validity
- Review error logs for API issues

#### 3. Invalid Response Structure
- Check model definitions in `models.py`
- Verify SERP API response format
- Review parsing logic in flight service

### Debug Steps
1. Check server logs for error messages
2. Verify environment variables
3. Test with mock booking token
4. Validate API key with SERP API dashboard

## Support

For issues related to:
- **SERP API**: Contact SERP API support
- **Integration**: Check this documentation
- **Backend Issues**: Review server logs and error messages

## Changelog

### Version 1.0.0
- Initial integration of Google Flights Booking Options API
- Mock data support for testing
- Complete response model structure
- Error handling and fallback mechanisms
- Test script for validation 