@echo off
echo 🚀 Starting SafarBot Development Environment

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found!
    echo Please create a .env file with your Google API key:
    echo GOOGLE_API_KEY=your_api_key_here
    echo CHROMA_PERSIST_DIRECTORY=./chroma_db
    echo.
)

echo 🔧 Starting FastAPI backend...
cd server
start "SafarBot Backend" python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo 🎨 Starting React frontend...
cd ../client
start "SafarBot Frontend" npm start

echo.
echo ✅ SafarBot is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop...
pause >nul 