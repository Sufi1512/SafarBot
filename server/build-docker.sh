#!/bin/bash

# SafarBot Backend Docker Build Script

echo "🐳 Building SafarBot Backend Docker Image..."

# Build the Docker image
docker build -t safarbot-backend:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "🚀 To run the backend:"
echo "   docker run -p 8000:8000 safarbot-backend:latest"
echo ""
echo "🔧 To run with environment variables:"
echo "   docker run -p 8000:8000 -e REDIS_URL=redis://localhost:6379 safarbot-backend:latest"
echo ""
echo "📖 For development with docker-compose:"
echo "   docker-compose up safarbot-backend"


