# Unused Backend Files Analysis

## Analysis Summary

Analyzing which backend files are not in use by checking imports and references across the codebase.

## Files to Check

### Services Directory
Checking each service file for usage:

1. ✅ **additional_places_service.py** - USED (itinerary router)
2. ✅ **auth_service.py** - USED (auth router, middleware, google_auth router)
3. ✅ **booking_service.py** - USED (dashboard_service)
4. ✅ **cache_service.py** - USED (multiple services)
5. ❓ **chat_collaboration_service.py** - USED (main.py WebSocket)
6. ✅ **chat_service.py** - USED (chat router)
7. ❓ **coordinate_service.py** - NEEDS CHECK
8. ✅ **dashboard_service.py** - USED (dashboard router)
9. ✅ **email_service.py** - USED (collaboration router, auth router)
10. ✅ **fast_itinerary_service.py** - USED (itinerary router)
11. ✅ **firebase_auth_service.py** - USED (google_auth router)
12. ✅ **flight_service.py** - USED (flights router)
13. ✅ **hotel_service.py** - USED (hotels router)
14. ✅ **itinerary_service.py** - USED (itinerary router)
15. ❓ **native_websocket_service.py** - NEEDS CHECK (vs websocket_service)
16. ✅ **openai_service.py** - USED (chat_service)
17. ✅ **otp_service.py** - USED (auth router)
18. ✅ **place_details_service.py** - USED (itinerary router)
19. ❓ **place_service.py** - PARTIALLY USED (only place_by_id, endpoint might be unused)
20. ✅ **restaurant_service.py** - USED (restaurants router)
21. ✅ **saved_itinerary_service.py** - USED (saved_itinerary router)
22. ✅ **serp_cache_service.py** - USED (workflows)
23. ✅ **serp_places_service.py** - USED (itinerary router, but endpoints commented out)
24. ✅ **session_service.py** - USED (dashboard router)
25. ✅ **unified_itinerary_service.py** - USED (itinerary router)
26. ✅ **weather_service.py** - USED (weather router)
27. ❓ **websocket_service.py** - USED (main.py startup, but Socket.IO disabled)

### Tools Directory
- ✅ **places_search_tool.py** - USED (multiple services)

### Utils Directory
- ❓ **location_utils.py** - NEEDS CHECK

### Workflows Directory
- ✅ **optimized_prefetch_workflow.py** - USED (itinerary_service)

## Potential Unused Files

### 1. coordinate_service.py
**Status:** ❌ NOT USED
**Reason:** No imports found in codebase
**Action:** Can be removed if not needed

### 2. native_websocket_service.py
**Status:** ❓ NEEDS VERIFICATION
**Reason:** May be duplicate of websocket_service.py
**Action:** Check if it's actually used or if websocket_service is preferred

### 3. place_service.py
**Status:** ⚠️ PARTIALLY USED
**Reason:** Only `place_by_id` method used, but endpoint `/places/by-id` might be commented out
**Action:** Check if endpoint is active

### 4. websocket_service.py
**Status:** ⚠️ CONDITIONALLY USED
**Reason:** Imported in main.py but Socket.IO is disabled
**Action:** Check if Socket.IO endpoints are needed

### 5. location_utils.py
**Status:** ❓ NEEDS CHECK
**Reason:** Need to verify if imported anywhere

## Recommendations

1. **Remove coordinate_service.py** if coordinates are handled elsewhere
2. **Consolidate websocket services** - choose one (websocket_service or native_websocket_service)
3. **Clean up place_service.py** - remove if only place_by_id is used and endpoint is inactive
4. **Check location_utils.py** usage

