@echo off
echo ========================================
echo SafarBot Vercel Deployment Preparation
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✓ Node.js and npm are installed
echo.

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo ✓ Vercel CLI installed
) else (
    echo ✓ Vercel CLI is already installed
)

echo.
echo ========================================
echo Deployment Steps:
echo ========================================
echo.
echo 1. Make sure your code is committed to Git
echo 2. Run: vercel login
echo 3. Run: vercel
echo 4. Follow the prompts to configure your project
echo 5. Add your environment variables when prompted:
echo    - SERP_API_KEY (required)
echo    - LANGSMITH_API_KEY (optional)
echo    - LANGSMITH_PROJECT (optional)
echo    - LANGSMITH_ENDPOINT (optional)
echo.
echo ========================================
echo Ready to deploy!
echo ========================================
echo.
echo Would you like to start the deployment now? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    echo.
    echo Starting Vercel deployment...
    vercel
) else (
    echo.
    echo Deployment preparation complete.
    echo Run 'vercel' when you're ready to deploy.
)

pause 