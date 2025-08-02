# SafarBot Setup Instructions

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Google Gemini API Key (Required for AI functionality)
GOOGLE_API_KEY=your_google_gemini_api_key_here

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Frontend API URL (Optional - defaults to localhost:8000)
REACT_APP_API_URL=http://localhost:8000/api/v1

# Development Settings
DEBUG=true
LOG_LEVEL=INFO
```

## Getting Started

### Option 1: Docker (Recommended)
```bash
# Build and start the application
docker-compose up --build

# Access the application
open http://localhost:8000
```

### Option 2: Development Setup

#### Using the provided scripts:
```bash
# On Linux/Mac:
chmod +x start-dev.sh
./start-dev.sh

# On Windows:
start-dev.bat
```

#### Manual setup:
```bash
# Backend setup
cd server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend setup (in another terminal)
cd client
npm install
npm start
```

## API Key Setup

1. Get a Google Gemini 2.0 Flash API key from: https://aistudio.google.com/apikey
2. Add the API key to your `.env` file
3. Restart the application

## Testing the Application

1. Open http://localhost:8000 (Docker) or http://localhost:3000 (Development)
2. Fill out the travel form with your preferences
3. Click "Generate My Itinerary"
4. View your personalized travel plan
5. Use the chat widget for additional assistance 