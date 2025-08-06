# MongoDB Integration for SafarBot Portal

This document provides a comprehensive guide for setting up and using MongoDB with the SafarBot travel planning and booking platform.

## 🚀 Overview

SafarBot now uses MongoDB as its primary database, providing:
- **Scalable data storage** for flights, hotels, bookings, and user data
- **Real-time operations** with async/await support
- **Flexible schema** for travel-related data
- **Authentication system** with JWT tokens
- **Price alerts and notifications**
- **Affiliate tracking and analytics**

## 📋 Prerequisites

1. **Python 3.8+**
2. **MongoDB 4.4+** (local or cloud)
3. **pip** for package management

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# For Ubuntu/Debian:
sudo apt-get install mongodb

# For macOS (using Homebrew):
brew install mongodb-community

# Start MongoDB service
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URL` in your `.env` file

### 3. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp server/env.template server/.env
```

Edit `server/.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
# For Atlas: MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/safarbot

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Other API Keys
GOOGLE_API_KEY=your_google_api_key_here
SERP_API_KEY=your_serp_api_key_here
```

## 🗄️ Database Schema

### Collections

1. **users** - User accounts and authentication
2. **flights** - Flight information and availability
3. **hotels** - Hotel information and availability
4. **bookings** - User bookings and reservations
5. **itineraries** - AI-generated travel itineraries
6. **price_alerts** - User price alert settings
7. **affiliate_clicks** - Affiliate link tracking
8. **affiliate_bookings** - Affiliate booking conversions
9. **chat_sessions** - AI chat conversation history
10. **restaurants** - Restaurant information
11. **saved_trips** - User saved trip preferences
12. **notifications** - User notifications

### Key Models

#### User Model
```python
{
    "_id": ObjectId,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "hashed_password": "bcrypt_hash",
    "role": "user",
    "status": "active",
    "is_email_verified": true,
    "preferences": {},
    "created_at": datetime,
    "updated_at": datetime
}
```

#### Flight Model
```python
{
    "_id": ObjectId,
    "flight_id": "FL12345",
    "airline": "Emirates",
    "departure_city": "Dubai",
    "arrival_city": "London",
    "departure_time": datetime,
    "arrival_time": datetime,
    "price": 450.00,
    "available_seats": 150,
    "status": "available",
    "amenities": ["WiFi", "Entertainment"],
    "affiliate_links": [...]
}
```

## 🌱 Database Seeding

Populate your database with sample data:

```bash
cd server
python seed_data.py
```

This will create:
- 100+ sample flights across major routes
- 100+ hotels in popular destinations
- 150+ restaurants in various cities

## 🔐 Authentication System

### Registration
```bash
POST /api/v1/auth/register
{
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword123"
}
```

### Login
```bash
POST /api/v1/auth/login
{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

### Protected Routes
Use the `Authorization: Bearer <token>` header for protected endpoints.

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info
- `PUT /api/v1/auth/me` - Update user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/logout` - Logout

### Flights
- `GET /api/v1/flights/search` - Search flights
- `GET /api/v1/flights/{flight_id}` - Get flight details
- `POST /api/v1/flights/book` - Book a flight

### Hotels
- `GET /api/v1/hotels/search` - Search hotels
- `GET /api/v1/hotels/{hotel_id}` - Get hotel details
- `POST /api/v1/hotels/book` - Book a hotel

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/{booking_id}` - Get booking details
- `PUT /api/v1/bookings/{booking_id}/cancel` - Cancel booking

### Price Alerts
- `POST /api/v1/alerts` - Create price alert
- `GET /api/v1/alerts` - Get user alerts
- `PUT /api/v1/alerts/{alert_id}` - Update alert
- `DELETE /api/v1/alerts/{alert_id}` - Delete alert
- `POST /api/v1/alerts/{alert_id}/toggle` - Toggle alert status

## 🔧 Development

### Running the Server
```bash
cd server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Operations

#### Using MongoDB Compass
1. Install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your MongoDB instance
3. Browse and manage collections visually

#### Using Python Shell
```python
from database import Database, get_collection
import asyncio

async def example():
    await Database.connect_db()
    collection = get_collection("users")
    users = await collection.find().to_list(length=10)
    print(f"Found {len(users)} users")

asyncio.run(example())
```

## 📈 Production Deployment

### 1. MongoDB Atlas Setup
1. Create a production cluster
2. Configure network access (IP whitelist)
3. Create database user
4. Get connection string

### 2. Environment Variables
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/safarbot
SECRET_KEY=your-production-secret-key
ENVIRONMENT=production
DEBUG=False
```

### 3. Security Considerations
- Use strong JWT secret keys
- Enable MongoDB authentication
- Configure firewall rules
- Use SSL/TLS connections
- Regular database backups

## 🧪 Testing

### Unit Tests
```bash
cd server
python -m pytest tests/
```

### API Testing
Use the interactive API docs at `http://localhost:8000/docs`

### Database Testing
```bash
# Test connection
python -c "
import asyncio
from database import Database
async def test():
    await Database.connect_db()
    print('✅ Connected successfully')
    await Database.close_db()
asyncio.run(test())
"
```

## 📊 Monitoring

### Database Metrics
- Connection pool status
- Query performance
- Index usage
- Storage usage

### Application Metrics
- API response times
- Error rates
- User activity
- Booking conversions

## 🔄 Data Migration

### From Mock Data
The existing mock data endpoints will continue to work while you migrate to MongoDB.

### Backup and Restore
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/safarbot" --out=backup/

# Restore
mongorestore --uri="mongodb://localhost:27017/safarbot" backup/safarbot/
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

2. **Authentication Errors**
   - Verify JWT secret key
   - Check token expiration
   - Validate user credentials

3. **Performance Issues**
   - Add database indexes
   - Optimize queries
   - Monitor connection pool

### Logs
Check application logs for detailed error information:
```bash
tail -f logs/app.log
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Motor (Async MongoDB Driver)](https://motor.readthedocs.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [JWT Authentication](https://jwt.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Travel Planning! ✈️🏨🌍** 