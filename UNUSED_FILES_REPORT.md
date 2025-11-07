# Unused Backend Files Report

## Analysis Date
Analysis completed to identify unused files in the backend.

## Unused Files (Can be Removed)

### 1. ❌ `server/services/coordinate_service.py`
**Status:** NOT USED
**Reason:** No imports found in the entire codebase
**Details:**
- Class `CoordinateService` is defined but never imported or instantiated
- Methods like `get_destination_coordinates()` and `get_coordinates_for_frontend()` are never called
- Coordinates are handled by `PlacesSearchTool` and other services directly
**Recommendation:** ✅ **SAFE TO DELETE**

### 2. ❌ `server/services/native_websocket_service.py`
**Status:** NOT USED
**Reason:** Only defined but never imported or used
**Details:**
- Class `NativeWebSocketService` exists but is never imported
- `websocket_service.py` is used instead (imported in main.py)
- Appears to be a duplicate/unused implementation
**Recommendation:** ✅ **SAFE TO DELETE**

### 3. ⚠️ `server/services/websocket_service.py`
**Status:** CONDITIONALLY USED (Socket.IO disabled)
**Reason:** Imported in main.py but Socket.IO endpoints are disabled
**Details:**
- Imported in `main.py` line 122: `from services.websocket_service import websocket_service`
- Initialized in startup: `await websocket_service.initialize()`
- BUT Socket.IO mount is commented out (line 168): `# from services.websocket_service import socketio_app`
- Uses Socket.IO library which may not be needed
**Current Usage:** Only initialization, no actual endpoints
**Recommendation:** ⚠️ **REVIEW** - If Socket.IO is not needed, can be removed. Otherwise, keep for future use.

## Partially Used Files

### 4. ⚠️ `server/services/place_service.py`
**Status:** PARTIALLY USED (only one method)
**Reason:** Only `place_by_id()` method is used
**Details:**
- Used in `routers/itinerary.py` line 277: `place_service.place_by_id()`
- Endpoint `/itinerary/places/by-id` is active (line 273)
- `search_place()` method is NOT used (endpoint was commented out)
**Recommendation:** ⚠️ **KEEP** - Still used by active endpoint

### 5. ⚠️ `server/services/serp_places_service.py`
**Status:** PARTIALLY USED (endpoints disabled)
**Reason:** Service is imported but endpoints are commented out
**Details:**
- Imported in `routers/itinerary.py` line 8: `from services.serp_places_service import SerpPlacesService`
- Instantiated but endpoints `/places/serp/details` and `/places/serp/search` are commented out
- Service methods may still be used internally by other services
**Recommendation:** ⚠️ **REVIEW** - Check if methods are used internally

## Used Files (Keep)

All other services are actively used:
- ✅ `additional_places_service.py` - Used in itinerary router
- ✅ `auth_service.py` - Used in auth router, middleware, google_auth
- ✅ `booking_service.py` - Used in dashboard_service
- ✅ `cache_service.py` - Used in multiple services
- ✅ `chat_collaboration_service.py` - Used in main.py WebSocket
- ✅ `chat_service.py` - Used in chat router
- ✅ `dashboard_service.py` - Used in dashboard router
- ✅ `email_service.py` - Used in collaboration and auth routers
- ✅ `fast_itinerary_service.py` - Used in itinerary router
- ✅ `firebase_auth_service.py` - Used in google_auth router
- ✅ `flight_service.py` - Used in flights router
- ✅ `hotel_service.py` - Used in hotels router
- ✅ `itinerary_service.py` - Used in itinerary router
- ✅ `openai_service.py` - Used in chat_service
- ✅ `otp_service.py` - Used in auth router
- ✅ `place_details_service.py` - Used in itinerary router
- ✅ `restaurant_service.py` - Used in restaurants router
- ✅ `saved_itinerary_service.py` - Used in saved_itinerary router
- ✅ `serp_cache_service.py` - Used in workflows
- ✅ `session_service.py` - Used in dashboard router
- ✅ `unified_itinerary_service.py` - Used in itinerary router
- ✅ `weather_service.py` - Used in weather router

### Utils
- ✅ `utils/location_utils.py` - Used in weather_service.py

### Tools
- ✅ `tools/places_search_tool.py` - Used in multiple services

### Workflows
- ✅ `workflows/optimized_prefetch_workflow.py` - Used in itinerary_service

## Summary

### Files Deleted (Unused)
1. ✅ **DELETED** - `server/services/coordinate_service.py` - Not used anywhere
2. ✅ **DELETED** - `server/services/native_websocket_service.py` - Not used, duplicate

### Files Disabled (Not Used)
1. ✅ **DISABLED** - `server/services/websocket_service.py` - Socket.IO disabled in main.py (commented out)
2. ✅ **REMOVED** - `server/services/serp_places_service.py` - Removed from imports (endpoints were commented out)

### Total Files Removed
- **2 files** deleted
- **2 services** removed from active code

## Action Taken

1. ✅ **Deleted unused files:**
   - `server/services/coordinate_service.py` - DELETED
   - `server/services/native_websocket_service.py` - DELETED

2. ✅ **Removed unused imports:**
   - `server/services/serp_places_service.py` - Removed from itinerary.py imports
   - `SerpPlaceRequest`, `SerpPlaceResponse`, `SerpSearchRequest`, `SerpSearchResponse` - Removed from models import

3. ✅ **Disabled unused service:**
   - `server/services/websocket_service.py` - Disabled in main.py (commented out initialization)

4. ✅ **Kept active services:**
   - All other services are actively used
   - `place_service.py` - Still used by active endpoint `/itinerary/places/by-id`

## Final Status

- **2 files deleted** ✅
- **1 service removed from active code** ✅
- **1 service disabled** ✅
- **Backend cleaned up** ✅

