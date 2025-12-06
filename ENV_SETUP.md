# Environment Variables Setup

## LOCAL_DEV Configuration

Add `LOCAL_DEV` to your `.env` file to distinguish between development and production modes.

### Local Development (.env file)
```bash
LOCAL_DEV=true
```

### Production Deployment (Render/other platforms)
```bash
LOCAL_DEV=false
```

## Usage in Code

You can now use `settings.local_dev` anywhere in your code:

```python
from config import settings

if settings.local_dev:
    print("Running in development mode")
    # Development-specific code
else:
    print("Running in production mode")
    # Production-specific code
```

## Example .env File

Create a `.env` file in the `server/` directory:

```bash
# Environment Mode
LOCAL_DEV=true

# Database Configuration
MONGODB_URL=mongodb://localhost:27017

# API Keys
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
SERP_API_KEY=your_serp_api_key_here
OPEN_WEATHER_API_KEY=your_weather_api_key_here
BREVO_API_KEY=your_brevo_api_key_here

# Optional: Redis Configuration
REDIS_URL=redis://localhost:6379

# Application URL
APP_URL=http://localhost:3000

# Currency Rate
USD_TO_INR_RATE=83.0

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Default Behavior

- If `LOCAL_DEV` is not set, it defaults to `true` (development mode)
- Set `LOCAL_DEV=false` explicitly for production deployments

## Render Deployment

In Render, add `LOCAL_DEV` as an environment variable:
- Key: `LOCAL_DEV`
- Value: `false`

