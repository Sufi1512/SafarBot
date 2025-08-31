# 🚀 SafarBot Quick Start Guide

Get your AI-powered travel planning platform up and running in minutes!

## 📋 Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** installed
- **MongoDB Atlas** account (or local MongoDB)
- **Google Gemini API** key

## ⚡ Quick Setup

### 1. Backend Setup (5 minutes)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp env.template .env

# Edit .env with your credentials
# (See Environment Variables section below)
```

### 2. Frontend Setup (3 minutes)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Edit .env.local with your backend URL
# (See Environment Variables section below)
```

### 3. Start Both Services (2 minutes)

```bash
# Terminal 1 - Start Backend
cd server
python start.py

# Terminal 2 - Start Frontend
cd client
npm run dev
```

## 🔑 Environment Variables

### Backend (.env)

```bash
# Required - MongoDB Connection
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# Required - Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key_here

# Required - JWT Secret (change this!)
SECRET_KEY=your-super-secret-jwt-key-here

# Optional - Google SERP API
SERP_API_KEY=your_serp_api_key_here
```

### Frontend (.env.local)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Test the Integration

### 1. Health Check
```bash
curl http://localhost:8000/health
```

### 2. Test Flight Search
```bash
curl -X POST "http://localhost:8000/api/v1/flights/search" \
  -H "Content-Type: application/json" \
  -d '{
    "from_location": "NYC",
    "to_location": "LAX",
    "departure_date": "2025-01-15",
    "passengers": 1,
    "class_type": "economy"
  }'
```

### 3. Test AI Chat
```bash
curl -X POST "http://localhost:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Plan a 3-day trip to Paris"
  }'
```

## 🚨 Common Issues & Solutions

### Backend Won't Start
- **Port 8000 in use**: Change `API_PORT=8001` in `.env`
- **MongoDB connection failed**: Check your connection string and network access
- **Missing dependencies**: Run `pip install -r requirements.txt`

### Frontend Can't Connect to Backend
- **CORS error**: Check backend CORS configuration
- **API URL wrong**: Verify `VITE_API_BASE_URL` in `.env.local`
- **Backend not running**: Ensure backend is started on correct port

### AI Features Not Working
- **Google Gemini API error**: Check your API key and quota
- **Missing API key**: Ensure `GOOGLE_API_KEY` is set in `.env`

## 📱 What You Can Do Now

✅ **User Registration & Login**  
✅ **AI-Powered Travel Chat**  
✅ **Flight Search & Booking**  
✅ **Itinerary Generation**  
✅ **Price Alerts & Predictions**  
✅ **Hotel & Restaurant Search**  
✅ **Affiliate Tracking**  

## 🔧 Next Steps

1. **Customize the UI**: Modify components in `client/src/components/`
2. **Add New API Endpoints**: Create new routers in `server/routers/`
3. **Enhance AI Features**: Modify services in `server/services/`
4. **Deploy to Production**: Update environment variables for production

## 📚 Need Help?

- **Backend Documentation**: See `server/README.md`
- **API Reference**: Visit http://localhost:8000/docs
- **Frontend Code**: Explore `client/src/` directory
- **Backend Code**: Explore `server/` directory

## 🎯 Success Indicators

You'll know everything is working when:
- ✅ Backend shows "Database connection established"
- ✅ Frontend loads without console errors
- ✅ API docs are accessible at `/docs`
- ✅ Health check returns "healthy" status
- ✅ AI chat responds to travel questions
- ✅ Flight search returns results

---

**Happy Travel Planning! ✈️🌍**


