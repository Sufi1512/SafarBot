@echo off
echo Starting SafarBot with Docker...
echo.

echo Checking if Docker Desktop is running...
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker Desktop is not running!
    echo.
    echo Please:
    echo 1. Start Docker Desktop from your Start menu
    echo 2. Wait for it to fully start (you'll see the Docker icon in system tray)
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Docker Desktop is running
echo.

echo Building and starting services...
echo Note: Make sure you're in the root SafarBot directory!
echo.

docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Services started successfully!
    echo.
    echo 🌐 Frontend: http://localhost:3000
    echo 🔧 Backend API: http://localhost:8000
    echo 🗄️  MongoDB: localhost:27017
    echo ❤️  Health Check: http://localhost:8000/health
    echo.
    echo To view logs: docker-compose logs -f
    echo To stop services: docker-compose down
) else (
    echo.
    echo ❌ Failed to start services. Check the error messages above.
    echo.
    echo Make sure you're in the root SafarBot directory (not in server/ or client/)
)

pause
