# API URL Configuration

## Overview
The frontend now uses a centralized configuration system that automatically switches between localhost (development) and the Render backend URL (production).

## Backend URL
- **Production**: `https://safarbot-n24f.onrender.com`
- **Development**: `http://localhost:8000`

## How It Works

### Automatic Detection
The system automatically detects the environment:
- **Development** (`npm run dev`): Uses `http://localhost:8000`
- **Production** (`npm run build`): Uses `https://safarbot-n24f.onrender.com`

### Environment Variable Override
You can override the default URL using environment variables:

```bash
# In .env file (create one in the client/ directory)
VITE_API_URL=https://your-custom-backend.com
# OR
VITE_API_BASE_URL=https://your-custom-backend.com
```

## Files Updated

### 1. Centralized Config (`client/src/config/apiConfig.ts`)
- New file that provides a single source of truth for API URLs
- Functions:
  - `getApiBaseUrl()`: Returns the base API URL
  - `getWebSocketUrl(path)`: Returns WebSocket URL (ws:// or wss://)
  - `getApiBaseUrlWithoutProtocol()`: Returns URL without protocol (for Socket.IO)

### 2. Updated Files
- ✅ `client/src/services/api.ts` - Main API service
- ✅ `client/src/components/ItineraryRoomManager.tsx` - Collaboration room manager
- ✅ `client/src/hooks/useChatCollaboration.ts` - Chat collaboration hook
- ✅ `client/src/hooks/useWebSocket.ts` - WebSocket hook
- ✅ `client/vite.config.ts` - Vite proxy configuration

## Usage

### In Your Code
```typescript
import { getApiBaseUrl, getWebSocketUrl } from '@/config/apiConfig';

// Get API base URL
const apiUrl = getApiBaseUrl(); // http://localhost:8000 or https://safarbot-n24f.onrender.com

// Get WebSocket URL
const wsUrl = getWebSocketUrl('/chat/user123'); // ws://localhost:8000/chat/user123 or wss://...
```

### For API Calls
The main `api.ts` service automatically uses the correct URL, so you don't need to change anything:

```typescript
import { itineraryAPI } from '@/services/api';

// This automatically uses the correct backend URL
const response = await itineraryAPI.generateEnhancedItinerary(data);
```

## Development Setup

1. **Local Development** (default):
   - No configuration needed
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`
   - Automatically detected

2. **Custom Backend**:
   - Create `.env` file in `client/` directory:
   ```bash
   VITE_API_URL=https://your-backend.com
   ```

3. **Production Build**:
   - Automatically uses Render URL
   - No configuration needed

## Vite Proxy (Development)

The Vite dev server proxy is configured to forward `/api/*` requests to the backend:
- Development: Proxies to `http://localhost:8000` (or `VITE_API_URL` if set)
- This allows you to use relative URLs like `/api/health` in development

## WebSocket URLs

WebSocket URLs are automatically converted:
- `http://localhost:8000` → `ws://localhost:8000`
- `https://safarbot-n24f.onrender.com` → `wss://safarbot-n24f.onrender.com`

## Server-Side

The server-side code automatically detects the backend URL from incoming requests using `get_backend_url_from_request()` in `server/utils/image_utils.py`, so no changes are needed there.

## Testing

1. **Test Local Development**:
   ```bash
   cd client
   npm run dev
   # Should connect to http://localhost:8000
   ```

2. **Test Production Build**:
   ```bash
   cd client
   npm run build
   npm run preview
   # Should connect to https://safarbot-n24f.onrender.com
   ```

3. **Test Custom Backend**:
   ```bash
   # Create .env file
   echo "VITE_API_URL=https://custom-backend.com" > client/.env
   npm run dev
   # Should connect to https://custom-backend.com
   ```

## Notes

- All hardcoded URLs have been removed from the codebase
- The system uses environment variables for flexibility
- WebSocket URLs are automatically converted (ws/wss)
- Server-side image proxying automatically detects the correct URL from requests

