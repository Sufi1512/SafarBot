@echo off
echo Stopping SafarBot services...
echo.

docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ✅ Services stopped successfully!
) else (
    echo.
    echo ❌ Failed to stop services. Check the error messages above.
)

echo.
pause
