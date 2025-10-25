# Docker Deployment Guide for SafarBot

This guide explains how to deploy SafarBot using Docker to resolve the Rust compilation issues on Render.

## Problem Solved

The original deployment was failing because `pydantic_core` requires Rust compilation, but Render's environment has a read-only file system that prevents the Rust toolchain from writing to necessary directories.

## Solution

We've created Docker containers that include the Rust toolchain and can compile the required packages during the build process.

## Files Created

1. **`server/Dockerfile`** - Backend container with Rust toolchain
2. **`client/Dockerfile`** - Frontend container with Nginx
3. **`docker-compose.yml`** - Local development setup
4. **`render.yaml`** - Render deployment configuration
5. **`.dockerignore`** files - Optimize Docker builds
6. **`server/requirements.txt`** - Simplified requirements (alternative)

## Local Development

### Prerequisites
- Docker and Docker Compose installed
- Environment variables configured

### Running Locally

1. **Clone and navigate to the project:**
   ```bash
   cd SafarBot
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with your API keys:
   ```env
   MONGODB_URL=mongodb://admin:password123@localhost:27017/safarbot?authSource=admin
   SECRET_KEY=your-super-secret-jwt-key
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   GOOGLE_API_KEY=your-google-api-key
   FIREBASE_PROJECT_ID=safar-bot
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@safar-bot.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=117732099857172305-xxxxx
   SERP_API_KEY=your-serp-api-key
   LANGSMITH_API_KEY=your-langsmith-api-key
   CHROMA_PERSIST_DIRECTORY=./chroma_db
   BREVO_API_KEY=your-brevo-api-key
   BREVO_SMTP_PASSWORD=your-brevo-smtp-password
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Check service status:**
   ```bash
   docker-compose ps
   ```

5. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f mongodb
   ```

6. **Stop services:**
   ```bash
   docker-compose down
   ```

### Services

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **MongoDB**: localhost:27017
- **Health Check**: http://localhost:8000/health

## Render Deployment

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the new Docker files
2. **Connect your repository to Render**
3. **Render will automatically detect the `render.yaml` file** and use Docker deployment
4. **Set your environment variables** in the Render dashboard

### Option 2: Manual Docker Service

1. **Create a new Web Service on Render**
2. **Select "Docker" as the environment**
3. **Set the Dockerfile path**: `./server/Dockerfile`
4. **Set the Docker context**: `./server`
5. **Configure environment variables**
6. **Deploy**

### Environment Variables for Render

Set these in your Render service dashboard:

```
MONGODB_URL=your-mongodb-connection-string
SECRET_KEY=your-super-secret-jwt-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
GOOGLE_API_KEY=your-google-api-key
FIREBASE_PROJECT_ID=safar-bot
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@safar-bot.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=117732099857172305-xxxxx
SERP_API_KEY=your-serp-api-key
LANGSMITH_API_KEY=your-langsmith-api-key
CHROMA_PERSIST_DIRECTORY=./chroma_db
BREVO_API_KEY=your-brevo-api-key
BREVO_SMTP_PASSWORD=your-brevo-smtp-password
FRONTEND_URL=https://safarbot.vercel.app
```

## Alternative: Simplified Requirements

If you want to avoid Docker, you can also use the simplified `server/requirements.txt` file which excludes packages that require Rust compilation. However, this might limit some functionality.

To use this approach:
1. Replace `requirements_frozen.txt` with `requirements.txt` in your Dockerfile
2. Or update your Render service to use `requirements.txt` instead

## Troubleshooting

### Build Issues
- Ensure all environment variables are set
- Check Docker logs for specific error messages
- Verify that all required files are present

### Runtime Issues
- Check service health endpoints
- Verify database connectivity
- Review application logs

### Performance
- The Docker build might take longer due to Rust compilation
- Consider using multi-stage builds for production
- Monitor memory usage during builds

## Benefits of Docker Approach

1. **Solves Rust compilation issues** on platforms with read-only filesystems
2. **Consistent environment** across development and production
3. **Easy local development** with all services in containers
4. **Scalable deployment** options
5. **Better dependency management**

## Next Steps

1. Test the Docker setup locally
2. Deploy to Render using the Docker configuration
3. Update your frontend to point to the new backend URL
4. Monitor the deployment and adjust as needed

The Docker approach should resolve your Render deployment issues while providing a more robust and scalable solution.
