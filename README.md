# SafarBot - AI-Powered Travel Planning API

A modern FastAPI-based travel planning application with AI-powered chat functionality, deployed on **Render (Backend)** and **Vercel (Frontend)**.

## 🚀 Features

- **FastAPI Backend**: Modern, fast web framework for building APIs
- **AI Chat Integration**: Intelligent travel planning assistance
- **Flight Search**: Real-time flight search and booking options
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Render Deployment**: Reliable backend hosting with automatic scaling
- **Vercel Deployment**: Fast frontend hosting with global CDN
- **Health Monitoring**: Built-in health check endpoints

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
- Render account (for backend)
- Vercel account (for frontend)

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
- Check the health endpoint at `/health` 