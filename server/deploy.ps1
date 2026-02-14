# SafarBot Backend Deployment Script (PowerShell)
# Checks for venv, creates/activates it, installs dependencies, and runs the server

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$venvDir = "venv"
$requirements = "requirements.txt"

# Check if venv exists, create if not
if (-not (Test-Path $venvDir)) {
    Write-Host "Virtual environment not found. Creating venv..."
    python -m venv $venvDir
    Write-Host "Virtual environment created."
} else {
    Write-Host "Virtual environment found."
}

# Activate venv and install dependencies
Write-Host "Activating virtual environment..."
& "$venvDir\Scripts\Activate.ps1"

Write-Host "Installing/upgrading dependencies..."
pip install -r $requirements --quiet --upgrade

Write-Host "Starting server..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000
