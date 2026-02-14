#!/bin/bash
# SafarBot Backend Deployment Script
# Checks for venv, creates/activates it, installs dependencies, and runs the server

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_DIR="venv"
REQUIREMENTS="requirements.txt"

# Check if venv exists, create if not
if [ ! -d "$VENV_DIR" ]; then
    echo "Virtual environment not found. Creating venv..."
    python3 -m venv "$VENV_DIR"
    echo "Virtual environment created."
else
    echo "Virtual environment found."
fi

# Activate venv and install dependencies
echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

echo "Installing/upgrading dependencies..."
pip install -r "$REQUIREMENTS" --quiet --upgrade

echo "Starting server..."
exec python -m uvicorn main:app --host 0.0.0.0 --port 8000
