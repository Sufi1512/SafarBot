# 🚀 Deploy SafarBot Backend on Render

This guide will walk you through deploying your SafarBot backend to Render without Docker.

## ⚡ Quick Start

```bash
1. Push code to GitHub
2. Create Web Service on Render
3. Connect your repository
4. Use these settings:
   - Build Command: pip install --no-cache-dir -r server/requirements_frozen.txt
   - Start Command: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
5. Add environment variables
6. Deploy!
```

## 📋 Prerequisites

- A Render account (sign up at [render.com](https://render.com))
- MongoDB Atlas account (or any MongoDB instance)
- A GitHub repository with your SafarBot code
- All necessary API keys (OpenAI, SERP, OpenWeather, Brevo, etc.)

## 🔧 Step 1: Update render.yaml Configuration

Since we removed Docker, we need to update the `render.yaml` file to use native Python deployment.

**Replace the entire content of `render.yaml` with:**

```yaml
services:
  - type: web
    name: safarbot-backend
    env: python
    region: oregon
    plan: starter
    buildCommand: pip install --no-cache-dir -r server/requirements_frozen.txt
    startCommand: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: MONGODB_URL
        sync: false
      - key: SECRET_KEY
        sync: false
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: 30
      - key: REFRESH_TOKEN_EXPIRE_DAYS
        value: 7
      - key: GOOGLE_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: FIREBASE_PROJECT_ID
        value: safar-bot
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_CLIENT_ID
        sync: false
      - key: SERP_API_KEY
        sync: false
      - key: LANGSMITH_API_KEY
        sync: false
      - key: CHROMA_PERSIST_DIRECTORY
        value: ./chroma_db
      - key: BREVO_API_KEY
        sync: false
      - key: BREVO_SMTP_PASSWORD
        sync: false
      - key: FRONTEND_URL
        value: https://safarbot.vercel.app
      - key: REDIS_URL
        sync: false
      - key: OPEN_WEATHER_API_KEY
        sync: false
    healthCheckPath: /health
    autoDeploy: true
```

## 🌐 Step 2: Prepare Your Code

1. **Ensure your repository is pushed to GitHub** with all the latest changes
2. **Remove or update `render.yaml`** if it references Docker files

## 📦 Step 3: Set Up MongoDB (if needed)

If you don't have MongoDB Atlas set up:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get your connection string

## 🔑 Step 4: Create a Render Service

1. **Log in to Render Dashboard**: Go to [dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**:
   - Click "New +" button
   - Select "Web Service"

3. **Connect Your Repository**:
   - Connect your GitHub account if not already connected
   - Select your SafarBot repository

4. **Configure the Service**:
   - **Name**: `safarbot-backend` (or any name you prefer)
   - **Region**: Choose the closest region to your users
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: Leave empty (it will deploy from root)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir -r server/requirements_frozen.txt`
   - **Start Command**: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Set Environment Variables**:
   Click "Advanced" and add all these environment variables:

   ```
   PYTHON_VERSION=3.11.0
   MONGODB_URL=mongodb://your-connection-string
   SECRET_KEY=your-super-secret-jwt-key-here
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   GOOGLE_API_KEY=your-google-api-key
   OPENAI_API_KEY=your-openai-api-key
   FIREBASE_PROJECT_ID=safar-bot
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@safar-bot.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-firebase-client-id
   SERP_API_KEY=your-serp-api-key
   LANGSMITH_API_KEY=your-langsmith-api-key
   CHROMA_PERSIST_DIRECTORY=./chroma_db
   BREVO_API_KEY=your-brevo-api-key
   BREVO_SMTP_PASSWORD=your-brevo-smtp-password
   FRONTEND_URL=https://safarbot.vercel.app
   REDIS_URL=your-redis-url (optional)
   OPEN_WEATHER_API_KEY=your-openweather-api-key
   ```

6. **Configure Health Check**:
   - Health Check Path: `/health`

7. **Choose Plan**:
   - Free tier: Good for development/testing
   - Starter ($7/month): Recommended for production

## 🚀 Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying your service
3. Monitor the build logs for any errors
4. Once deployed, you'll get a URL like: `https://safarbot-backend.onrender.com`

## ✅ Step 6: Verify Deployment

1. Visit your service URL
2. Check the health endpoint: `https://your-service-url.onrender.com/health`
3. View API documentation: `https://your-service-url.onrender.com/docs`
4. Test an endpoint: `https://your-service-url.onrender.com/`

## 🔧 Step 7: Update Frontend (if needed)

Update your frontend API endpoint to point to your new Render backend:

```typescript
// In your frontend config
const API_URL = 'https://your-service-url.onrender.com'
```

## 🐛 Troubleshooting Common Issues

### Issue: Render is trying to use Docker instead of Python

**Error Message**: `error: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory`

**Solution**: Render is auto-detecting Docker because it found `.dockerignore` files in your repository. 

**First, remove the .dockerignore files from Git:**
```bash
git rm .dockerignore server/.dockerignore
git commit -m "Remove .dockerignore files"
git push
```

**Then, configure the Render service:**

1. Go to your Render service dashboard
2. Click on "Settings" tab
3. Scroll down to "Build & Deploy"
4. Change:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install --no-cache-dir -r server/requirements_frozen.txt`
   - **Start Command**: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Important**: Make sure **"Docker" is NOT selected** in the "Docker" section
6. Click "Save Changes"
7. Manually trigger a deploy by clicking "Manual Deploy"

Alternatively, if you're using `render.yaml`, make sure it's pushed to your GitHub repository and Render is set to "Auto-Deploy" from the `render.yaml` file.

### Issue: Build fails with "Rust compilation error" or "pydantic_core" issues

**Solution**: This happens because some packages (like ChromaDB) require Rust. If you encounter this issue, you have several options:

**Option 1**: Use `requirements_frozen.txt` which has pre-built binaries:
```bash
# Update render.yaml buildCommand:
buildCommand: pip install --no-cache-dir -r server/requirements_frozen.txt
```

**Option 2**: If the above fails, try installing Rust first:
```bash
buildCommand: curl -sSf https://sh.rustup.rs | sh -s -- -y && pip install --no-cache-dir -r server/requirements.txt
```

**Option 3**: Remove ChromaDB if not critical (it's only used for certain features):
Edit `server/requirements.txt` and remove or comment out:
```
# chromadb
```

Then update your code to handle the missing dependency gracefully.

### Issue: MongoDB connection timeout

**Solution**: 
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check the connection string in environment variables
- Verify the database user has proper permissions

### Issue: Redis connection fails

**Solution**: 
- Redis is optional. If not using Redis, the app will continue without caching
- Or add a Redis instance in Render (Dashboard → New + → Redis)

### Issue: Port binding error

**Solution**: Make sure your start command uses `$PORT`:
```bash
cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Issue: Static file errors

**Solution**: 
- Render doesn't persist the file system, so don't save files locally
- Use cloud storage (S3, etc.) for file uploads
- For ChromaDB, consider using a cloud-hosted instance

## 📊 Monitoring

- View logs in the Render dashboard
- Set up alerts for deployment failures
- Monitor response times in the Metrics tab
- Check health checks automatically

## 🔄 Auto-Deployment

Render automatically deploys when you push to your main branch. To disable:

1. Go to Settings
2. Turn off "Auto-Deploy"

## 🆘 Getting Help

If you encounter issues:
1. Check the build logs in Render dashboard
2. Visit Render documentation: [render.com/docs](https://render.com/docs)
3. Check Render status page for outages

## 🎉 Success Checklist

- [ ] Service deployed successfully
- [ ] Health check endpoint responds
- [ ] API documentation accessible
- [ ] MongoDB connection working
- [ ] Environment variables configured
- [ ] Frontend updated with new API URL
- [ ] All endpoints tested
- [ ] Monitoring set up

## 💰 Costs

- **Free Tier**: 
  - Sleeps after 15 minutes of inactivity
  - Good for development/testing
  
- **Starter ($7/month)**:
  - Always on
  - Better for production
  - 0.5GB RAM, 0.5 vCPU

- **Production**: Scales up based on needs

---

**Congratulations! Your SafarBot backend is now deployed on Render! 🎊**

