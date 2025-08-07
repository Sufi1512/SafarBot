# SafarBot Deployment Guide

This guide explains how to deploy SafarBot using **Render for the backend** and **Vercel for the frontend**.

## 🎯 Deployment Architecture

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│   Vercel        │ ──────────────► │   Render        │
│   Frontend      │                 │   Backend       │
│   (React)       │                 │   (FastAPI)     │
└─────────────────┘                 └─────────────────┘
```

## 🚀 Backend Deployment (Render)

### 1. Prepare Backend for Render

The backend is already configured with:
- `render.yaml` - Render deployment configuration
- `server/requirements.txt` - Python dependencies
- `server/main.py` - FastAPI application

### 2. Deploy to Render

#### Option A: Using Render Dashboard
1. **Sign up/Login** to [Render.com](https://render.com)
2. **Connect your GitHub repository**
3. **Create a new Web Service**
4. **Configure the service:**
   - **Name**: `safarbot-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r server/requirements.txt`
   - **Start Command**: `cd server && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

#### Option B: Using render.yaml (Recommended)
1. **Push your code to GitHub**
2. **Connect repository to Render**
3. **Render will automatically detect `render.yaml`**
4. **Deploy automatically**

### 3. Set Environment Variables on Render

In your Render dashboard, add these environment variables:
```
GOOGLE_API_KEY=your_google_api_key_here
SERP_API_KEY=your_serp_api_key_here (optional)
LANGSMITH_API_KEY=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
MONGODB_URL=your_mongodb_atlas_connection_string
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Note**: 
- The LANGSMITH_API_KEY is already configured in `render.yaml` and will be automatically set.
- Make sure to add your MongoDB Atlas connection string and JWT secret key.
- The `email-validator` dependency has been added to fix deployment issues.

### 4. Get Your Backend URL

After deployment, your backend will be available at:
```
https://safarbot-backend.onrender.com
```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare Frontend for Vercel

The frontend is configured with:
- `vercel.json` - Vercel deployment configuration
- `client/package.json` - React dependencies
- Updated API service to use Render backend
- **New Features**: Custom logout confirmation modal, enhanced error handling, MongoDB integration

### 2. Latest Features Implemented

✅ **Authentication System**:
- User registration and login with MongoDB
- JWT token management (access & refresh tokens)
- Password hashing with bcrypt
- Email validation and error handling

✅ **User Dashboard**:
- Real user data display from MongoDB
- Editable profile fields
- Custom logout confirmation modal
- Price alerts and trip management

✅ **Enhanced UI/UX**:
- Consistent glass morphism design
- Improved error messages and success feedback
- Responsive design for all devices
- Custom confirmation dialogs

✅ **Backend Integration**:
- MongoDB Atlas connection
- Complete authentication API
- Price alerts and affiliate tracking
- Real-time data synchronization

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. **Sign up/Login** to [Vercel.com](https://vercel.com)
2. **Import your GitHub repository**
3. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Set Environment Variables on Vercel

In your Vercel dashboard, add:
```
REACT_APP_API_URL=https://safarbot-backend.onrender.com
```

### 4. Get Your Frontend URL

After deployment, your frontend will be available at:
```
https://your-app-name.vercel.app
```

## 🔧 Configuration Files

### render.yaml (Backend)
```yaml
services:
  - type: web
    name: safarbot-backend
    env: python
    plan: free
    buildCommand: pip install -r server/requirements.txt
    startCommand: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.16
      - key: GOOGLE_API_KEY
        sync: false
      - key: SERP_API_KEY
        sync: false
      - key: LANGSMITH_API_KEY
        value: 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
```

### vercel.json (Frontend)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "buildCommand": "npm run build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

## 🌐 API Communication

### Frontend API Configuration
The frontend automatically detects the environment and uses:
- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://safarbot-backend.onrender.com/api/v1`

### CORS Configuration
The backend is configured to accept requests from:
- Local development servers
- All Vercel domains
- Your specific Vercel deployment URLs

## 🧪 Testing Your Deployment

### 1. Test Backend (Render)
```bash
# Health check
curl https://safarbot-backend.onrender.com/health

# API root
curl https://safarbot-backend.onrender.com/

# Test chat endpoint
curl -X POST https://safarbot-backend.onrender.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### 2. Test Frontend (Vercel)
- Visit your Vercel URL
- Try the chat functionality
- Check browser console for API calls

### 3. Test API Communication
- Open browser developer tools
- Check Network tab for API calls to Render backend
- Verify CORS is working properly

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Frontend can't call backend API
**Solution**: 
- Check CORS origins in `server/main.py`
- Add your Vercel domain to allowed origins
- Verify backend URL in frontend API service

#### 2. Environment Variables
**Problem**: API keys not working
**Solution**:
- Check environment variables in Render dashboard
- Verify variable names match code expectations
- Restart Render service after adding variables

#### 3. Build Failures
**Problem**: Deployment fails
**Solution**:
- Check build logs in Render/Vercel dashboard
- Verify all dependencies are in requirements.txt
- Check for syntax errors in code

#### 4. API Timeouts
**Problem**: Long API calls fail
**Solution**:
- Render free tier has 30-second timeout
- Consider upgrading to paid plan for longer requests
- Optimize API response times

## 📊 Monitoring

### Render Backend
- **Logs**: Available in Render dashboard
- **Health**: Check `/health` endpoint
- **Performance**: Monitor response times

### Vercel Frontend
- **Analytics**: Available in Vercel dashboard
- **Performance**: Built-in performance monitoring
- **Deployments**: Automatic deployments on git push

## 🔄 Continuous Deployment

Both platforms support automatic deployments:
- **Render**: Deploys on git push to main branch
- **Vercel**: Deploys on git push to main branch

## 💰 Costs

### Free Tier Limits
- **Render**: 750 hours/month, 30-second timeout
- **Vercel**: 100GB bandwidth, 100 serverless function executions

### Upgrading
- **Render**: $7/month for unlimited hours
- **Vercel**: $20/month for Pro plan

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://safarbot-backend.onrender.com`
- **API Docs**: `https://safarbot-backend.onrender.com/docs` 