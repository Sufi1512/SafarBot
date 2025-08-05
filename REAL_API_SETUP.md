# SafarBot Flight API - Real SerpApi Integration

This guide explains how to set up and use the SafarBot Flight API with real SerpApi data instead of mock data.

## 🚀 Quick Start

### 1. Get a SerpApi Key

1. Visit [SerpApi](https://serpapi.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. The API key is required for all flight search and booking operations

### 2. Set Environment Variables

Create a `.env` file in the `server` directory:

```bash
# server/.env
SERP_API_KEY=your_actual_serp_api_key_here
```

**Important**: Replace `your_actual_serp_api_key_here` with your real SerpApi key.

### 3. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 4. Start the Server

```bash
python start_flight_server.py
```

The server will fail to start if no valid SERP_API_KEY is provided.

## 🔧 API Endpoints

### Flight Search
```http
POST /api/v1/flights/search
Content-Type: application/json

{
  "from_location": "DEL",
  "to_location": "BOM",
  "departure_date": "2025-01-15",
  "passengers": 1,
  "class_type": "economy"
}
```

### Booking Options
```http
GET /api/v1/flights/booking-options/{booking_token}
```

### Popular Flights
```http
GET /api/v1/flights/popular
```

### Airport Suggestions
```http
GET /api/v1/flights/airports/suggestions?query=del
```

## 🧪 Testing

### Test with curl

```bash
# Health check
curl http://localhost:8000/health

# Flight search
curl -X POST http://localhost:8000/api/v1/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "from_location": "DEL",
    "to_location": "BOM",
    "departure_date": "2025-01-15",
    "passengers": 1,
    "class_type": "economy"
  }'

# Popular flights
curl http://localhost:8000/api/v1/flights/popular

# Airport suggestions
curl "http://localhost:8000/api/v1/flights/airports/suggestions?query=del"
```

### Test with Python

```bash
python test_real_api.py
```

## 🔍 What's Different from Mock Data

### Real Data Features:
- ✅ **Live Flight Prices**: Real-time pricing from Google Flights
- ✅ **Actual Availability**: Real flight availability and schedules
- ✅ **Booking Tokens**: Valid tokens for booking options
- ✅ **Multiple Airlines**: Real airline data and logos
- ✅ **Price Insights**: Real price trends and recommendations
- ✅ **Baggage Information**: Actual baggage policies and prices
- ✅ **Booking Options**: Real booking providers and links

### Removed Mock Features:
- ❌ **Static Prices**: No more fixed mock prices
- ❌ **Fake Airlines**: No more mock airline data
- ❌ **Dummy Tokens**: No more invalid booking tokens
- ❌ **Mock Availability**: No more fake flight schedules

## 🚨 Error Handling

The API now has strict error handling:

1. **Missing API Key**: Server won't start without a valid SERP_API_KEY
2. **API Failures**: Errors are logged and returned to the client
3. **No Results**: Empty results are returned when no flights are found
4. **Rate Limiting**: SerpApi rate limits are respected

## 📊 Expected Response Format

### Flight Search Response
```json
{
  "success": true,
  "flights": [
    {
      "id": "1",
      "price": 8500,
      "currency": "INR",
      "booking_token": "real_booking_token_here",
      "flight_segments": [...],
      "airline_logo": "https://...",
      "total_duration": "2h 15m",
      "stops": 0
    }
  ],
  "total_count": 1,
  "message": "Found 1 flights from DEL to BOM"
}
```

### Booking Options Response
```json
{
  "selected_flights": [...],
  "booking_options": [
    {
      "together": {
        "book_with": "Air India",
        "price": 8500,
        "booking_request": {
          "url": "https://..."
        }
      }
    }
  ],
  "baggage_prices": {...},
  "price_insights": {...}
}
```

## 🔧 Configuration

### Environment Variables
- `SERP_API_KEY`: Your SerpApi API key (required)
- `CURRENCY`: Default currency (default: "INR")
- `LANGUAGE`: Default language (default: "en")

### API Limits
- SerpApi has rate limits based on your plan
- Popular flights endpoint makes multiple API calls
- Consider caching for production use

## 🚀 Production Deployment

For production deployment:

1. **Set Environment Variables**: Use your deployment platform's environment variable system
2. **Add Caching**: Implement Redis or similar for caching API responses
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Monitoring**: Add logging and monitoring for API usage
5. **Error Handling**: Implement proper error handling and fallbacks

## 🆘 Troubleshooting

### Common Issues:

1. **Server won't start**
   - Check if SERP_API_KEY is set correctly
   - Verify the API key is valid

2. **No flights returned**
   - Check if the route has available flights
   - Try different dates
   - Verify airport codes are correct

3. **API errors**
   - Check SerpApi dashboard for usage limits
   - Verify network connectivity
   - Check API key permissions

4. **Slow responses**
   - SerpApi calls can take 5-15 seconds
   - Popular flights endpoint makes multiple calls
   - Consider implementing caching

## 📞 Support

- **SerpApi Documentation**: https://serpapi.com/docs
- **API Status**: Check SerpApi status page
- **Rate Limits**: Check your SerpApi plan limits

## 🔄 Migration from Mock Data

If you were using the previous mock data version:

1. **Update Frontend**: The response format is the same
2. **Set API Key**: Add your SerpApi key to environment
3. **Test Endpoints**: Use the test scripts to verify functionality
4. **Update Error Handling**: Handle cases where no flights are found

The API endpoints and response formats remain the same, so your frontend should work without changes. 