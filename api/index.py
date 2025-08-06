import sys
import os

# Add the server directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

# Import the FastAPI app from server/main.py
from main import app

# Export the app for Vercel
handler = app 