#!/bin/bash

# SafarBot Deployment Script for Render
echo "🚀 Starting SafarBot deployment..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r server/requirements.txt

# Set environment variables (these should be set in Render dashboard)
echo "🔧 Setting up environment..."

# Start the application
echo "🌟 Starting SafarBot API server..."
cd server
uvicorn main:app --host 0.0.0.0 --port $PORT
