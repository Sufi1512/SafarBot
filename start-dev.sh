#!/bin/bash

echo "🚀 Starting SafarBot Development Environment"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with your Google API key:"
    echo "GOOGLE_API_KEY=your_api_key_here"
    echo "CHROMA_PERSIST_DIRECTORY=./chroma_db"
    echo ""
fi

# Start backend
echo "🔧 Starting FastAPI backend..."
cd server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting React frontend..."
cd ../client
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ SafarBot is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services"

# Wait for user to stop
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "🛑 SafarBot stopped" 