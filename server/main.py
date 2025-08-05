from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

from routers import itinerary, chat, hotels, restaurants, flights, bookings
from config import settings

# LangSmith setup function
def setup_langsmith():
    """
    Initialize LangSmith tracking
    """
    try:
        # Set LangSmith environment variables
        if settings.langsmith_api_key:
            os.environ["LANGSMITH_API_KEY"] = settings.langsmith_api_key
            os.environ["LANGSMITH_PROJECT"] = settings.langsmith_project
            os.environ["LANGSMITH_ENDPOINT"] = settings.langsmith_endpoint
            
            # Enable LangSmith tracing
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
            
            print("LangSmith tracking initialized successfully")
            return True
        else:
            print("LangSmith API key not found. LangSmith tracking will be disabled.")
            return False
    except Exception as e:
        print(f"Failed to initialize LangSmith: {str(e)}")
        return False

# Initialize LangSmith tracking
setup_langsmith()

app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router, prefix="/api/v1", tags=["itinerary"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(hotels.router, prefix="/api/v1", tags=["hotels"])
app.include_router(restaurants.router, prefix="/api/v1", tags=["restaurants"])
app.include_router(flights.router, prefix="/api/v1", tags=["flights"])
app.include_router(bookings.router, prefix="/api/v1", tags=["bookings"])

# Serve static files (React build)
if os.path.exists("client/build"):
    app.mount("/static", StaticFiles(directory="client/build/static"), name="static")
    
    @app.get("/")
    async def serve_frontend():
        return FileResponse("client/build/index.html")
    
    @app.get("/{full_path:path}")
    async def serve_frontend_routes(full_path: str):
        return FileResponse("client/build/index.html")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafarBot API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 