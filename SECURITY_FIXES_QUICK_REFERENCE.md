# Quick Security Fixes Reference

## 🔴 CRITICAL - Fix Immediately

### 1. Remove Master Password Backdoor
**File:** `server/services/auth_service.py`

**Current Code (Lines 25-26, 42-56):**
```python
MASTER_PASSWORD = os.getenv("MASTER_PASSWORD", "")
MASTER_PASSWORD_ENABLED = os.getenv("MASTER_PASSWORD_ENABLED", "false").lower() == "true"

def is_master_password(password: str) -> bool:
    if not MASTER_PASSWORD_ENABLED or not MASTER_PASSWORD:
        return False
    return password == MASTER_PASSWORD
```

**Fix:** Remove the function and its usage in `server/routers/auth.py:422`

---

### 2. Fix CORS Configuration
**File:** `server/main.py` (Lines 108-126)

**Current Issues:**
- `"null"` origin allows file:// attacks
- `allow_headers=["*"]` too permissive
- `expose_headers=["*"]` exposes sensitive data

**Fix:**
```python
# Replace with:
allowed_origins = [
    origin.strip() 
    for origin in os.getenv("CORS_ORIGINS", "").split(",") 
    if origin.strip() and origin.strip() != "null"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
)
```

---

### 3. Add WebSocket Authentication
**File:** `server/main.py` (Lines 191-199)

**Current Code:**
```python
@app.websocket("/chat/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, user_id: str, user_name: str = None):
    await chat_service.handle_websocket(websocket, user_id, user_name)
```

**Fix:**
```python
@app.websocket("/chat/{user_id}")
async def chat_websocket_endpoint(websocket: WebSocket, user_id: str):
    # Get token from query params
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return
    
    # Verify token
    payload = AuthService.verify_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Verify user_id matches token
    token_user_id = payload.get("sub")
    if token_user_id != user_id:
        await websocket.close(code=1008, reason="Unauthorized")
        return
    
    # Get user info
    user = await AuthService.get_user_by_id(token_user_id)
    user_name = f"{user.first_name} {user.last_name}" if user else None
    
    await chat_service.handle_websocket(websocket, user_id, user_name)
```

---

### 4. Add ObjectId Validation Helper
**File:** Create `server/utils/validation.py`

```python
from bson import ObjectId
from fastapi import HTTPException, status

def validate_object_id(id_str: str, field_name: str = "ID") -> ObjectId:
    """Validate and convert string to ObjectId"""
    if not id_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} is required"
        )
    
    if not ObjectId.is_valid(id_str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )
    
    try:
        return ObjectId(id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name} format"
        )
```

**Usage in routers:**
```python
from utils.validation import validate_object_id

itinerary_obj_id = validate_object_id(itinerary_id, "Itinerary ID")
user_obj_id = validate_object_id(user_id, "User ID")
```

---

## 🟠 HIGH PRIORITY - Fix Soon

### 5. Replace Print Statements with Logging
**Files:** All files with `print()` statements (300+ instances found)

**Find all print statements:**
```bash
grep -r "print(" server/ --include="*.py"
```

**Replace pattern:**
```python
# Before:
print(f"DEBUG: User {user_id} connected")

# After:
logger.debug(f"User {user_id} connected")
```

**Add logging import at top:**
```python
import logging
logger = logging.getLogger(__name__)
```

---

### 6. Sanitize Error Messages
**Pattern to find:**
```bash
grep -r "detail=f\"Failed" server/routers/ --include="*.py"
```

**Replace:**
```python
# Before:
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Failed to send invitation: {str(e)}"
    )

# After:
except Exception as e:
    logger.error(f"Failed to send invitation: {str(e)}", exc_info=True)
    raise HTTPException(
        status_code=500,
        detail="Failed to send invitation. Please try again later."
    )
```

---

## 📊 Summary Statistics

- **Total Issues Found:** 15
- **Critical:** 3
- **High:** 4
- **Medium:** 5
- **Low:** 3
- **Print Statements:** 300+ (needs cleanup)
- **Master Password References:** 2 files

---

## 🚀 Quick Win Checklist

- [ ] Remove master password feature
- [ ] Fix CORS configuration
- [ ] Add WebSocket authentication
- [ ] Create ObjectId validation helper
- [ ] Replace top 10 most critical print statements
- [ ] Sanitize error messages in auth endpoints
- [ ] Review and test all fixes

---

## 📝 Testing After Fixes

1. **Test Master Password Removal:**
   ```bash
   # Should fail if master password is used
   curl -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"master_password"}'
   ```

2. **Test CORS:**
   ```bash
   # Should reject null origin
   curl -H "Origin: null" http://localhost:8000/health
   ```

3. **Test WebSocket Auth:**
   ```bash
   # Should reject connection without token
   wscat -c ws://localhost:8000/chat/user123
   ```

---

**Last Updated:** $(date)

