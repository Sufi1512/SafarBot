# SafarBot - AI-Powered Travel Planning API

A modern FastAPI-based travel planning application with AI-powered chat functionality, deployed on **Render (Backend)** and **Vercel (Frontend)**.

## 🚀 Features

### Phase 1 - MVP Features (Complete ✅)

#### 1. **AI-based Trip Planner**
- ✅ Personalized itinerary generation based on budget, destination, travel dates, and interests
- ✅ AI-generated day-wise plans with recommended activities
- ✅ Real-time trip updates and adjustments
- ✅ Integration with Google Gemini 2.5 Flash for intelligent responses

#### 2. **Flight & Hotel Search and Booking**
- ✅ Real-time flight search with multiple airlines
- ✅ Hotel search with detailed filtering options
- ✅ Booking options and confirmation system
- ✅ Airport suggestions and route optimization

#### 3. **Price Comparison Tool**
- ✅ Multi-platform price comparison (Booking.com, Expedia, Agoda, Hotels.com, Trip.com)
- ✅ Real-time price tracking and alerts
- ✅ Best deal recommendations
- ✅ Price history and trend analysis

#### 4. **Affiliate Integration**
- ✅ Commission tracking system (6.8% - 9.1% rates)
- ✅ Affiliate link generation and click tracking
- ✅ Booking conversion monitoring
- ✅ Revenue and performance analytics

#### 5. **User Dashboard & Trip Management**
- ✅ Comprehensive user dashboard with trip overview
- ✅ Saved trips management (planned, booked, completed, cancelled)
- ✅ Price alerts and notifications
- ✅ User profile and preferences management
- ✅ Travel statistics and analytics

#### 6. **AI Travel Chatbot**
- ✅ Intelligent chat interface with conversation history
- ✅ WhatsApp-style chat widget
- ✅ Context-aware responses
- ✅ Emergency assistance and rebooking support

#### 7. **Price Alerts & Predictive Booking**
- ✅ Custom price alerts for flights and hotels
- ✅ Price drop notifications
- ✅ Predictive price trends using ML models
- ✅ Smart booking recommendations

#### 8. **Technical Infrastructure**
- ✅ FastAPI Backend with comprehensive API endpoints
- ✅ React Frontend with modern UI/UX
- ✅ CORS Support for cross-origin integration
- ✅ Render Deployment for backend hosting
- ✅ Vercel Deployment for frontend hosting
- ✅ Health monitoring and error handling

## 📁 Project Structure

```
SafarBot/
├── client/                   # React frontend (Vite) - Deployed on Vercel
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   ├── public/
│   └── package.json
├── server/                   # FastAPI backend - Deployed on Render
│   ├── main.py              # Main FastAPI application
│   ├── config.py            # Configuration settings
│   ├── models.py            # Pydantic models
│   ├── routers/             # API route handlers
│   │   ├── chat.py         # Chat functionality
│   │   ├── flights.py      # Flight search
│   │   └── ...
│   ├── services/            # Business logic services
│   └── requirements.txt     # Python dependencies
├── render.yaml              # Render deployment configuration
├── vercel.json              # Vercel deployment configuration
├── requirements.txt         # Root requirements for Render
├── DEPLOYMENT.md            # Detailed deployment guide
└── README.md               # This file
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account (for database)
- Render account (for backend)
- Vercel account (for frontend)

### MongoDB Setup

1. **Create MongoDB Atlas Cluster**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster (free tier available)
   - Set up database access with username and password
   - Configure network access (allow all IPs for development: 0.0.0.0/0)

2. **Get Connection String**
   - In your cluster, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

3. **Configure Environment Variables**
   ```bash
   # Copy the template file
   cp server/env.template server/.env
   
   # Edit the .env file with your MongoDB connection string
   MONGODB_URL=mongodb+srv://admin:<your_password>@cluster0.4b4rg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ```

4. **Test Database Connection**
   ```bash
   cd server
   python test_db.py
   ```

5. **Database Collections**
   - **Database**: `SafarBot`
   - **User Collection**: `user_fields`
   - **Other Collections**: `flights`, `hotels`, `bookings`, `itineraries`, `price_alerts`, etc.

### Authentication System

The application uses JWT (JSON Web Tokens) for authentication:

1. **User Registration** (`POST /api/v1/auth/signup`)
   - Creates new user account
   - Password is hashed using bcrypt
   - Email verification required (can be disabled for testing)

2. **User Login** (`POST /api/v1/auth/login`)
   - Authenticates user credentials
   - Returns access token and refresh token
   - Tracks login attempts for security

3. **Token Management**
   - Access tokens expire in 30 minutes
   - Refresh tokens expire in 7 days
   - Automatic token refresh on frontend

4. **Sample User Credentials** (created by test script)
   - Email: `demo@example.com`
   - Password: `DemoPassword123!`

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sufi1512/SafarBot.git
   cd SafarBot
   ```

2. **Setup Backend**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Setup Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the server directory:
```env
GOOGLE_API_KEY=your_google_api_key_here
SERP_API_KEY=your_serp_api_key_here (optional)
```

## 🌐 API Endpoints

### Health & Status
- `GET /` - API root and status
- `GET /health` - Health check endpoint

### Chat Functionality
- `POST /api/v1/chat` - Chat with AI travel planner
- `GET /api/v1/chat/history` - Get chat history

### Flight Services
- `POST /api/v1/flights/search` - Search for flights
- `GET /api/v1/flights/popular` - Get popular flights
- `GET /api/v1/flights/airports` - Airport suggestions
- `GET /api/v1/flights/booking-options/{token}` - Get booking options

### Hotel Services
- `POST /api/v1/search-hotels` - Search for hotels
- `GET /api/v1/hotels/{location}/popular` - Get popular hotels

### Restaurant Services
- `POST /api/v1/recommend-restaurants` - Get restaurant recommendations
- `GET /api/v1/restaurants/{location}/popular` - Get popular restaurants

### Itinerary Services
- `POST /api/v1/generate-itinerary` - Generate AI-powered itineraries
- `POST /api/v1/predict-prices` - Predict travel costs

### Booking Services
- `POST /api/v1/bookings/create` - Create new bookings
- `GET /api/v1/bookings/{booking_id}` - Get booking status
- `PUT /api/v1/bookings/{booking_id}/cancel` - Cancel booking
- `GET /api/v1/bookings` - Get all bookings

### Price Alerts
- `POST /api/v1/alerts/create` - Create price alert
- `GET /api/v1/alerts` - Get user alerts
- `PUT /api/v1/alerts/{alert_id}` - Update alert
- `DELETE /api/v1/alerts/{alert_id}` - Delete alert
- `POST /api/v1/alerts/{alert_id}/toggle` - Toggle alert status
- `GET /api/v1/alerts/notifications` - Get price drop notifications
- `POST /api/v1/alerts/check-prices` - Background price checking
- `GET /api/v1/alerts/stats` - Get alert statistics
- `POST /api/v1/alerts/predict-prices` - Predict price trends

### Affiliate Tracking
- `POST /api/v1/affiliate/track-click` - Track affiliate click
- `POST /api/v1/affiliate/track-booking` - Track booking conversion
- `GET /api/v1/affiliate/clicks` - Get click analytics
- `GET /api/v1/affiliate/bookings` - Get booking analytics
- `GET /api/v1/affiliate/reports` - Get commission reports
- `GET /api/v1/affiliate/stats` - Get affiliate statistics
- `GET /api/v1/affiliate/links` - Get affiliate links
- `PUT /api/v1/affiliate/links/{affiliate_id}` - Update affiliate settings

## 🚀 Deployment

### Quick Deploy

1. **Backend (Render)**
   ```bash
   # Push to GitHub
   git push origin main
   
   # Connect to Render
   # Render will auto-deploy using render.yaml
   ```

2. **Frontend (Vercel)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

### Detailed Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

## 🔧 Configuration

### Render Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: safarbot-backend
    env: python
    plan: free
    buildCommand: pip install -r server/requirements.txt
    startCommand: cd server && uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Vercel Configuration (`vercel.json`)
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

## 📊 API Documentation

Once deployed:
- **Backend API Docs**: `https://safarbot-backend.onrender.com/docs`
- **Health Check**: `https://safarbot-backend.onrender.com/health`
- **Frontend**: `https://your-app.vercel.app`

## 🌐 Production URLs

After deployment:
- **Backend**: `https://safarbot-backend.onrender.com`
- **Frontend**: `https://your-app-name.vercel.app`
- **API Base**: `https://safarbot-backend.onrender.com/api/v1`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS origins in `server/main.py`
2. **API Timeouts**: Render free tier has 30-second limit
3. **Environment Variables**: Verify in Render dashboard
4. **Build Failures**: Check logs in deployment platforms

### Testing

```bash
# Test backend
curl https://safarbot-backend.onrender.com/health

# Test API
curl -X POST https://safarbot-backend.onrender.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the deployment guide in `DEPLOYMENT.md`
- Check the health endpoint at `/health` #   U p d a t e d   G i t   c o n f i g u r a t i o n 
 
 