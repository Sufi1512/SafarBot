# Google Flights Booking Options API - Frontend Integration Guide

## Overview
This guide explains how to integrate the Google Flights Booking Options API with the SafarBot frontend to display booking options for flights.

## Backend Implementation Status ✅

The backend has been successfully implemented with:
- ✅ Booking options API endpoint: `/api/v1/flights/booking-options/{booking_token}`
- ✅ Mock data generation for testing
- ✅ Proper data structure matching Google Flights API
- ✅ Route configuration fixed (booking options route moved before flight details route)

## Frontend Integration Steps

### 1. API Service Configuration ✅

The frontend API service (`client/src/services/api.ts`) has been updated to:
- Use the correct endpoint: `/api/v1/flights/booking-options/{booking_token}`
- Match the backend response structure

### 2. Data Structure Alignment ✅

The frontend interfaces have been updated to match the backend response:

```typescript
export interface BookingOptionsResponse {
  selected_flights: any[];
  baggage_prices: BaggagePrices;
  booking_options: BookingOption[];
  price_insights?: PriceInsights;
}
```

### 3. Booking Options Page ✅

The `BookingOptionsPage.tsx` has been updated to:
- Display flight details
- Show booking options with pricing
- Display baggage information
- Show price insights
- Handle booking actions

## Testing the Integration

### Step 1: Start the Backend Server

```bash
cd server
python main.py
```

### Step 2: Start the Frontend

```bash
cd client
npm run dev
```

### Step 3: Test the Flow

1. **Search for Flights**: Go to the flight booking page and search for flights
2. **Select a Flight**: Choose a flight that has a booking token
3. **View Booking Options**: Click "View Booking Options" button
4. **Verify Display**: Check that booking options are displayed correctly

## API Response Structure

The booking options API returns:

```json
{
  "selected_flights": [
    {
      "id": "flight_id",
      "price": 8500,
      "currency": "INR",
      "flight_segments": [...],
      "layovers": [...],
      "carbon_emissions": {...}
    }
  ],
  "baggage_prices": {
    "together": ["1 free carry-on", "1st checked bag: ₹1500-2500"]
  },
  "booking_options": [
    {
      "separate_tickets": false,
      "together": {
        "book_with": "Air India",
        "airline_logos": ["https://..."],
        "marketed_as": ["AI 101"],
        "price": 8500,
        "local_prices": [{"currency": "INR", "price": 8500}],
        "option_title": "Basic Economy",
        "extensions": ["No refunds", "Ticket changes for a fee"],
        "baggage_prices": ["1 free carry-on", "1st checked bag: ₹1500"],
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

## Frontend Features

### 1. Flight Details Display
- Shows selected flight information
- Displays flight segments with times and airports
- Shows layover information

### 2. Booking Options
- Multiple booking options from different providers
- Price comparison
- Airline logos and branding
- Booking features and restrictions

### 3. Baggage Information
- Carry-on and checked baggage details
- Pricing information for additional baggage

### 4. Price Insights
- Lowest price available
- Price level indicator
- Typical price range

### 5. Booking Actions
- "Book Now" button that opens booking provider website
- Phone booking option with service fee information

## Troubleshooting

### Issue: Booking Options Not Showing
**Solution**: 
1. Check that the flight has a `booking_token`
2. Verify the API endpoint is accessible
3. Check browser console for errors
4. Ensure CORS is properly configured

### Issue: Empty Data Returned
**Solution**:
1. Restart the backend server
2. Check server logs for errors
3. Verify the route configuration

### Issue: Frontend Not Loading
**Solution**:
1. Ensure the frontend server is running on port 5173
2. Check for compilation errors
3. Verify all dependencies are installed

## Production Deployment

For production deployment with real Google Flights API:

1. **Get SERP API Key**: Obtain a valid SERP API key
2. **Update Environment**: Set `SERP_API_KEY` in `.env` file
3. **Enable Real API**: The backend will automatically use real API when key is available
4. **Test with Real Tokens**: Use actual booking tokens from flight search results

## Code Examples

### Making API Call from Frontend

```typescript
const loadBookingOptions = async () => {
  try {
    const data = await flightAPI.getBookingOptions(bookingToken);
    setBookingData(data);
  } catch (err: any) {
    setError(err.message || 'Failed to load booking options');
  }
};
```

### Displaying Booking Options

```typescript
const renderBookingOption = (option: BookingOption, index: number) => {
  const details = option.together || option.departing;
  if (!details) return null;

  return (
    <div key={index} className="booking-option-card">
      <div className="provider-info">
        <h3>{details.book_with}</h3>
        <p>{details.option_title}</p>
      </div>
      <div className="price-info">
        <div className="price">{formatPrice(details.price)}</div>
      </div>
      <div className="actions">
        <button onClick={() => handleBookNow(option)}>
          Book Now
        </button>
      </div>
    </div>
  );
};
```

## Next Steps

1. **Test the Integration**: Follow the testing steps above
2. **Add Real API Key**: For production use
3. **Enhance UI**: Add more styling and features
4. **Add Error Handling**: Improve error messages and fallbacks
5. **Performance Optimization**: Add loading states and caching

## Support

If you encounter any issues:
1. Check the server logs for backend errors
2. Check browser console for frontend errors
3. Verify all API endpoints are accessible
4. Ensure proper CORS configuration 