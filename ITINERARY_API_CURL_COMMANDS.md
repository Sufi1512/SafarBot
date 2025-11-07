# Itinerary API - cURL Commands for Testing

Base URL:
- **Local**: `http://localhost:8000`
- **Production**: `https://safarbot-n24f.onrender.com`

Replace `{BASE_URL}` with your base URL in the commands below.

---

## 1. Generate AI Itinerary Only (Fast - 30-60 seconds)

**Endpoint**: `POST /itinerary/generate-itinerary-ai`

**Description**: Returns AI-generated itinerary structure without place data.

### Minimal Request (Required fields only)

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05"
  }'
```

### Full Request (With all optional fields)

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "start_date": "2025-07-15",
    "end_date": "2025-07-22",
    "budget": 3000,
    "budget_range": "mid-range",
    "travelers": 2,
    "travel_companion": "couple",
    "trip_pace": "balanced",
    "interests": ["culture", "food", "nature"],
    "departure_city": "New York",
    "flight_class_preference": "economy",
    "hotel_rating_preference": "4-star",
    "accommodation_type": "mid-range",
    "email": "user@example.com",
    "dietary_preferences": ["halal"],
    "halal_preferences": "strict",
    "vegetarian_preferences": null
  }'
```

### With Authentication (if required)

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-ai" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "destination": "Bali, Indonesia",
    "start_date": "2025-08-01",
    "end_date": "2025-08-07",
    "travelers": 2,
    "interests": ["beaches", "adventure", "spa"]
  }'
```

---

## 2. Get Additional Places Only

**Endpoint**: `POST /itinerary/places/additional`

**Description**: Returns comprehensive place suggestions beyond the itinerary.

### Minimal Request

```bash
curl -X POST "{BASE_URL}/itinerary/places/additional" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "interests": []
  }'
```

### With Interests

```bash
curl -X POST "{BASE_URL}/itinerary/places/additional" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "interests": ["culture", "food", "nightlife", "shopping"]
  }'
```

### With Authentication (if required)

```bash
curl -X POST "{BASE_URL}/itinerary/places/additional" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "destination": "Bali, Indonesia",
    "interests": ["beaches", "adventure", "spa", "yoga"]
  }'
```

---

## 3. Generate Complete Itinerary (AI + Places + Details)

**Endpoint**: `POST /itinerary/generate-itinerary-complete`

**Description**: Returns everything in one response (AI itinerary + place details + additional places). Takes 2-3 minutes.

### Minimal Request

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-complete" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05"
  }'
```

### Full Request

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-complete" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "start_date": "2025-07-15",
    "end_date": "2025-07-22",
    "budget": 3000,
    "budget_range": "mid-range",
    "travelers": 2,
    "travel_companion": "couple",
    "trip_pace": "balanced",
    "interests": ["culture", "food", "nature"],
    "departure_city": "New York",
    "flight_class_preference": "economy",
    "hotel_rating_preference": "4-star",
    "accommodation_type": "mid-range",
    "email": "user@example.com",
    "dietary_preferences": ["halal"],
    "halal_preferences": "strict",
    "vegetarian_preferences": null
  }'
```

### With Authentication (if required)

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-complete" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "destination": "Bali, Indonesia",
    "start_date": "2025-08-01",
    "end_date": "2025-08-07",
    "travelers": 2,
    "interests": ["beaches", "adventure", "spa"]
  }'
```

---

## 4. Generate Itinerary (Backward Compatibility)

**Endpoint**: `POST /itinerary/generate-itinerary`

**Description**: Redirects to `/generate-itinerary-complete` for backward compatibility.

### Minimal Request

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05"
  }'
```

### Full Request

```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "start_date": "2025-07-15",
    "end_date": "2025-07-22",
    "budget": 3000,
    "travelers": 2,
    "interests": ["culture", "food"]
  }'
```

---

## Quick Test Script

Save this as `test_itinerary_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"  # Change to production URL if needed

echo "Testing Itinerary API Endpoints..."
echo "=================================="
echo ""

# 1. Test AI Itinerary Only (Fast)
echo "1. Testing /generate-itinerary-ai (Fast AI-only)..."
curl -X POST "${BASE_URL}/itinerary/generate-itinerary-ai" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05",
    "travelers": 2,
    "interests": ["culture", "food"]
  }' | jq '.'
echo ""
echo "---"
echo ""

# 2. Test Additional Places
echo "2. Testing /places/additional..."
curl -X POST "${BASE_URL}/itinerary/places/additional" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "interests": ["culture", "food"]
  }' | jq '.'
echo ""
echo "---"
echo ""

# 3. Test Complete Itinerary (This will take 2-3 minutes)
echo "3. Testing /generate-itinerary-complete (Complete - takes 2-3 minutes)..."
curl -X POST "${BASE_URL}/itinerary/generate-itinerary-complete" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05",
    "travelers": 2,
    "interests": ["culture", "food"]
  }' | jq '.'
echo ""
echo "---"
echo ""

# 4. Test Backward Compatibility
echo "4. Testing /generate-itinerary (Backward compatibility)..."
curl -X POST "${BASE_URL}/itinerary/generate-itinerary" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Paris, France",
    "start_date": "2025-06-01",
    "end_date": "2025-06-05"
  }' | jq '.'
echo ""
echo "=================================="
echo "All tests completed!"
```

Make it executable:
```bash
chmod +x test_itinerary_api.sh
./test_itinerary_api.sh
```

---

## Windows PowerShell Commands

### 1. Generate AI Itinerary Only

```powershell
$baseUrl = "http://localhost:8000"
$body = @{
    destination = "Paris, France"
    start_date = "2025-06-01"
    end_date = "2025-06-05"
    travelers = 2
    interests = @("culture", "food")
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/itinerary/generate-itinerary-ai" -Method POST -Body $body -ContentType "application/json"
```

### 2. Get Additional Places

```powershell
$baseUrl = "http://localhost:8000"
$body = @{
    destination = "Paris, France"
    interests = @("culture", "food")
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/itinerary/places/additional" -Method POST -Body $body -ContentType "application/json"
```

### 3. Generate Complete Itinerary

```powershell
$baseUrl = "http://localhost:8000"
$body = @{
    destination = "Paris, France"
    start_date = "2025-06-01"
    end_date = "2025-06-05"
    travelers = 2
    interests = @("culture", "food")
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/itinerary/generate-itinerary-complete" -Method POST -Body $body -ContentType "application/json"
```

---

## Field Descriptions

### Required Fields
- `destination` (string): Travel destination (e.g., "Paris, France", "Tokyo, Japan")
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string): End date in YYYY-MM-DD format

### Optional Fields
- `budget` (float): Budget in USD
- `budget_range` (string): "budget", "mid-range", or "luxury"
- `travelers` (int): Number of travelers (default: 1)
- `travel_companion` (string): "solo", "couple", "family", "friends", "business"
- `trip_pace` (string): "relaxed", "balanced", "fast-paced"
- `interests` (array): List of interests like ["culture", "food", "nature", "adventure"]
- `departure_city` (string): Departure city
- `flight_class_preference` (string): "economy", "business", "first"
- `hotel_rating_preference` (string): "3-star", "4-star", "5-star"
- `accommodation_type` (string): "budget", "mid-range", "luxury"
- `email` (string): Email address for notifications
- `dietary_preferences` (array): ["halal", "vegetarian", "vegan"]
- `halal_preferences` (string): Halal food preferences
- `vegetarian_preferences` (string): Vegetarian food preferences

---

## Response Times

- `/generate-itinerary-ai`: **30-60 seconds** (Fast - AI only)
- `/places/additional`: **30-60 seconds** (Place search)
- `/generate-itinerary-complete`: **2-3 minutes** (Complete with all data)
- `/generate-itinerary`: **2-3 minutes** (Same as complete)

---

## Tips

1. **For quick testing**: Use `/generate-itinerary-ai` first
2. **For complete data**: Use `/generate-itinerary-complete` when you need everything
3. **For modular approach**: Use `/generate-itinerary-ai` + `/places/additional` separately
4. **Pretty print JSON**: Add `| jq '.'` to curl commands (requires jq installed)
5. **Save responses**: Add `-o response.json` to save response to file

Example with pretty print:
```bash
curl -X POST "{BASE_URL}/itinerary/generate-itinerary-ai" \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.'
```

