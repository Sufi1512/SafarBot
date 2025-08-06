from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

# Create FastAPI app
app = FastAPI(
    title="SafarBot API",
    description="AI-powered travel planning API",
    version="1.0.0"
)

# CORS middleware for Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://*.vercel.app",
        "https://*.vercel.com",
        "https://safarbot.vercel.app",
        "https://safarbot-git-main-sufi1512.vercel.app",
        "https://safarbot-sufi1512.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Basic endpoints for testing
@app.get("/")
async def root():
    return {
        "message": "SafarBot API is running on Vercel!",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "SafarBot API"}

@app.get("/api/test")
async def test_api():
    return {"message": "API endpoint is working!"}

@app.post("/api/v1/chat")
async def chat_endpoint():
    return {"message": "Chat endpoint is working!"}

# Export for Vercel
handler = app 