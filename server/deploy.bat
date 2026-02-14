@echo off
REM SafarBot Backend Deployment Script (Windows)
REM Checks for venv, creates/activates it, installs dependencies, and runs the server

cd /d "%~dp0"

set VENV_DIR=venv
set REQUIREMENTS=requirements.txt

REM Check if venv exists, create if not
if not exist "%VENV_DIR%" (
    echo Virtual environment not found. Creating venv...
    python -m venv %VENV_DIR%
    echo Virtual environment created.
) else (
    echo Virtual environment found.
)

REM Activate venv and install dependencies
echo Activating virtual environment...
call %VENV_DIR%\Scripts\activate.bat

echo Installing/upgrading dependencies...
pip install -r %REQUIREMENTS% --quiet --upgrade

echo Starting server...
python -m uvicorn main:app --host 0.0.0.0 --port 8000
