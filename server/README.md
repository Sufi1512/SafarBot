# SafarBot Backend

AI-powered travel planning and booking platform backend built with FastAPI and MongoDB.

## 🚀 Features

- **AI-Powered Services**: Google Gemini integration for chat and itinerary generation
- **Flight Search & Booking**: Real-time flight search with booking options
- **Hotel & Restaurant Services**: Search and recommendations
- **User Authentication**: JWT-based authentication with refresh tokens
- **Price Alerts**: AI-powered price prediction and notifications
- **Affiliate Tracking**: Click and booking tracking system
- **MongoDB Integration**: Async database operations with Motor
- **RESTful API**: Comprehensive API endpoints with OpenAPI documentation

## 🛠️ Prerequisites

- Python 3.8+
- MongoDB (local or Atlas)
- Google Gemini API key
- (Optional) Google SERP API key for enhanced flight search

## 📦 Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Copy the template
   cp env.template .env
   
   # Edit .env with your actual values
   nano .env  # or use your preferred editor
   ```

## ⚙️ Environment Variables

### Required Variables

```bash
# MongoDB Connection
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database

# Google Gemini API (Required for AI features)
GOOGLE_API_KEY=your_gemini_api_key_here

# JWT Secret (Change in production!)
SECRET_KEY=your-super-secret-jwt-key-here
```

### Optional Variables

```bash
# Google SERP API (Enhanced flight search)
SERP_API_KEY=your_serp_api_key

# LangSmith (AI development monitoring)
LANGSMITH_API_KEY=your_langsmith_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Update `MONGODB_URL` in your `.env` file

### Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Set `MONGODB_URL=mongodb://localhost:27017/safarbot`

## 🚀 Running the Backend

### Development Mode

```bash
# Using the startup script (recommended)
python start.py

# Or directly with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
# Set environment to production
export ENVIRONMENT=production
export DEBUG=False

# Run with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📚 API Documentation

Once the server is running, visit:

- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔐 Authentication

The API uses JWT tokens for authentication:

1. **Register**: `POST /api/v1/auth/signup`
2. **Login**: `POST /api/v1/auth/login`
3. **Use Token**: Include `Authorization: Bearer <token>` in headers
4. **Refresh**: `POST /api/v1/auth/refresh`

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Test API Endpoints
```bash
# Test flight search
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

## 📁 Project Structure

```
server/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration settings
├── database.py          # Database connection and utilities
├── models.py            # Pydantic data models
├── routers/             # API route handlers
│   ├── auth.py         # Authentication endpoints
│   ├── flights.py      # Flight search and booking
│   ├── chat.py         # AI chat service
│   ├── itinerary.py    # Itinerary generation
│   ├── alerts.py       # Price alerts
│   └── affiliate.py    # Affiliate tracking
├── services/            # Business logic
│   ├── auth_service.py
│   ├── flight_service.py
│   ├── chat_service.py
│   └── itinerary_service.py
├── requirements.txt     # Python dependencies
├── start.py            # Startup script
└── README.md           # This file
```

## 🔧 Configuration Options

### CORS Settings
Update `CORS_ORIGINS` in `.env` to allow your frontend domains.

### Rate Limiting
Configure rate limiting in `.env`:
```bash
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900
```

### Logging
Set log level and file path:
```bash
LOG_LEVEL=INFO
LOG_FILE=./logs/safarbot.log
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your connection string
   - Verify network access (IP whitelist for Atlas)
   - Check MongoDB service status

2. **Google Gemini API Error**
   - Verify your API key
   - Check API quota and billing
   - Ensure the API is enabled

3. **Port Already in Use**
   - Change port in `.env`: `API_PORT=8001`
   - Kill existing process: `lsof -ti:8000 | xargs kill`

4. **Import Errors**
   - Activate virtual environment
   - Reinstall requirements: `pip install -r requirements.txt`

### Debug Mode

Enable debug mode for detailed error messages:
```bash
export DEBUG=True
```

## 📊 Monitoring

### Health Endpoint
Monitor application health:
```bash
curl http://localhost:8000/health
```

### Logs
Check application logs for errors and performance metrics.

## 🔒 Security Considerations

- **Change Default Secrets**: Update `SECRET_KEY` in production
- **Environment Variables**: Never commit `.env` files
- **CORS**: Restrict origins in production
- **Rate Limiting**: Enable rate limiting for production
- **HTTPS**: Use HTTPS in production

## 📈 Performance

- **Database Indexing**: Ensure proper MongoDB indexes
- **Connection Pooling**: MongoDB connection pooling is configured
- **Async Operations**: All database operations are async
- **Caching**: Consider Redis for caching in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check application logs
4. Create an issue in the repository


