@echo off
REM SafarBot Backend Docker Build Script for Windows

echo 🐳 Building SafarBot Backend Docker Image...

REM Build the Docker image
docker build -t safarbot-backend:latest .

if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker image built successfully!
    echo.
    echo 🚀 To run the backend:
    echo    docker run -p 8000:8000 safarbot-backend:latest
    echo.
    echo 🔧 To run with environment variables:
    echo    docker run -p 8000:8000 -e REDIS_URL=redis://localhost:6379 safarbot-backend:latest
    echo.
    echo 📖 For development with docker-compose:
    echo    docker-compose up safarbot-backend
) else (
    echo ❌ Docker build failed!
    exit /b 1
)


