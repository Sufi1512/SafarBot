# AI Generation Tracking Implementation

## Overview
This document describes the AI usage tracking system implemented for SafarBot. The system tracks all AI API calls, token consumption, costs, and generation metrics.

## Components Implemented

### 1. Database Model (`mongo_models.py`)
- **AIUsageDocument**: MongoDB model for storing AI usage data
  - Tracks: provider, model, tokens, costs, request/response metadata
  - Stores: user info, API endpoint, timestamps, success/failure status

### 2. AI Tracking Service (`services/ai_tracking_service.py`)
- **AITrackingService**: Service for logging and querying AI usage
  - Calculates costs based on provider pricing
  - Logs all AI calls to MongoDB
  - Provides usage statistics aggregation

### 3. OpenAI Service Updates (`services/openai_service.py`)
- Modified to capture token usage from API responses
- Tracks: prompt tokens, completion tokens, response time
- Logs all OpenAI calls automatically

### 4. Workflow Updates (`workflows/optimized_prefetch_workflow.py`)
- Modified Gemini workflow to track token usage
- Extracts token counts from Gemini API responses
- Logs itinerary generation calls

### 5. API Endpoint Logging
- **Chat API** (`routers/chat.py`): Comprehensive logging for chat requests
- **Itinerary API** (`routers/itinerary.py`): Detailed logging for itinerary generation

## What Gets Tracked

### For Each AI Call:
1. **Request Information**
   - API endpoint
   - HTTP method
   - User ID and email (if authenticated)
   - Client IP and user agent

2. **AI Provider Details**
   - Provider (OpenAI/Gemini)
   - Model name
   - Task type (itinerary_generation, chat_response, etc.)

3. **Token Usage**
   - Prompt tokens (input)
   - Completion tokens (output)
   - Total tokens

4. **Cost Tracking**
   - Estimated cost in USD
   - Based on current provider pricing

5. **Performance Metrics**
   - Response time (milliseconds)
   - Prompt length (characters)
   - Response length (characters)

6. **Request Context**
   - Destination (for itinerary requests)
   - Request parameters
   - Response metadata

7. **Status**
   - Success/failure
   - Error messages (if failed)

## API Logging Details

### When User Hits API:

#### Itinerary Generation Endpoint (`/itinerary/generate-itinerary-complete`)
Logs include:
- Destination, dates, travelers, budget
- Interests, accommodation preferences
- User information (ID, email, IP)
- Request parameters
- Response metrics (days generated, places used, etc.)

#### Chat Endpoint (`/chat`)
Logs include:
- Message content (first 50 chars)
- Message length
- User information
- Response length

## Database Collection

All AI usage data is stored in: **`ai_usage`** collection

## Usage Statistics

You can query usage statistics using:
```python
from services.ai_tracking_service import ai_tracking_service

# Get stats for a user
stats = await ai_tracking_service.get_usage_stats(user_id="...")

# Get stats by provider
stats = await ai_tracking_service.get_usage_stats(provider=AIProvider.OPENAI)

# Get stats for date range
stats = await ai_tracking_service.get_usage_stats(
    start_date=datetime(2024, 1, 1),
    end_date=datetime(2024, 12, 31)
)
```

## Pricing Reference

### OpenAI (per 1M tokens):
- GPT-4 Turbo: $10 input / $30 output
- GPT-4: $30 input / $60 output
- GPT-3.5 Turbo: $0.50 input / $1.50 output

### Gemini (per 1M tokens):
- Gemini 2.5 Flash: $0.075 input / $0.30 output
- Gemini Pro: $0.50 input / $1.50 output

## Example Log Output

When a user hits the itinerary API, you'll see logs like:

```
================================================================================
🚀 ITINERARY API - Complete Generation Request
   📍 Endpoint: /itinerary/generate-itinerary-complete
   🌍 Destination: Paris
   📅 Dates: 2024-06-01 to 2024-06-05
   👥 Travelers: 2 (Couple)
   💰 Budget: $2000 (mid_range)
   🎯 Interests: culture, food, history
   👤 User: 507f1f77bcf86cd799439011 (user@example.com)
   🌐 IP: 192.168.1.1
================================================================================

✅ AI Usage Logged: gemini/gemini-2.5-flash | Tokens: 15234 (12456 prompt + 2778 completion) | Cost: $0.001234 | Endpoint: /itinerary/generate-itinerary-complete

================================================================================
✅ ITINERARY API - Complete generation finished
   📋 Itinerary: 5 days
   🗺️  Place details: 23 places with full metadata
   🎯 Additional places: 47 places
   📊 Total places prefetched: 70
   📊 Places used in itinerary: 23
   🌤️  Weather included: True
================================================================================
```

## Next Steps

To view tracked data:
1. Query MongoDB `ai_usage` collection
2. Use the tracking service's `get_usage_stats()` method
3. Create admin dashboard endpoints to display metrics

