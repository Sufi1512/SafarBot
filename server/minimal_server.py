from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv('.env')

# Import only the flights router
from routers.flights import router as flights_router

app = FastAPI(
    title="SafarBot Flight API",
    description="Flight booking API",
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

# Include only flights router
app.include_router(flights_router, prefix="/api/v1", tags=["flights"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafarBot Flight API"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Minimal Flight Server...")
    print("   This server only includes the flight service")
    print("   Access at: http://localhost:8000")
    print("   API docs at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000) 