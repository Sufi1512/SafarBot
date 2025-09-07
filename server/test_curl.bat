@echo off
REM SafarBot Collaboration API Test Script for Windows
REM This script provides curl commands to test the collaboration invitation API

echo 🚀 SafarBot Collaboration API Test Script
echo ==========================================

REM Configuration
set BASE_URL=http://localhost:8000
set API_URL=%BASE_URL%/api/v1

echo.
echo ========================================
echo   CHECKING SERVER
echo ========================================

REM Check if server is running
curl -s "%BASE_URL%/health" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server is not running. Please start it first:
    echo    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    pause
    exit /b 1
)

echo ✅ Server is running

echo.
echo ========================================
echo   AUTHENTICATION
echo ========================================

set /p EMAIL="Enter your email: "
set /p PASSWORD="Enter your password: "

echo ℹ️  Logging in...

REM Login and get token
for /f "tokens=*" %%i in ('curl -s -X POST "%API_URL%/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"') do set LOGIN_RESPONSE=%%i

echo Login Response: %LOGIN_RESPONSE%

echo.
echo ========================================
echo   GETTING ITINERARIES
echo ========================================

echo ℹ️  Fetching user itineraries...

REM Get itineraries (you'll need to manually extract the token and itinerary ID from the responses)
echo Please copy the access_token from the login response above and run:
echo.
echo curl -X GET "%API_URL%/saved-itinerary/" -H "Authorization: Bearer YOUR_TOKEN_HERE"
echo.
echo Then copy an itinerary ID and run:
echo.
echo curl -X POST "%API_URL%/collaboration/invite" ^
echo   -H "Content-Type: application/json" ^
echo   -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
echo   -d "{\"itinerary_id\":\"YOUR_ITINERARY_ID\",\"email\":\"test@example.com\",\"role\":\"editor\",\"message\":\"Test invitation\"}"
echo.

pause
