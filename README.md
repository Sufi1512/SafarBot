# SafarBot.com - AI-Powered Travel Planner

SafarBot is a full-stack AI travel planning application that creates personalized itineraries using Google Gemini Pro API, LangChain, and LangGraph.

## 🚀 Features

- **AI-Powered Itinerary Generation**: Create personalized travel plans based on preferences, budget, and interests
- **Real-time Chat Assistant**: Interactive AI chatbot for travel advice and recommendations
- **Smart Hotel & Restaurant Recommendations**: Find the perfect accommodations and dining options
- **Responsive Web Interface**: Beautiful, modern UI built with React and Tailwind CSS
- **Vector Database Integration**: ChromaDB for enhanced AI responses with contextual information
- **Docker Deployment**: Containerized application ready for production deployment

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for REST API
- **Pydantic** for data validation
- **Uvicorn** for ASGI server

### AI & ML
- **Google Gemini Pro API** for AI capabilities
- **LangChain** for LLM orchestration
- **LangGraph** for complex AI workflows
- **ChromaDB** for vector storage

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for multi-service orchestration

## 📁 Project Structure

```
SafarBot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── ...
│   └── ...
├── server/                # FastAPI backend
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic
│   ├── models.py         # Pydantic models
│   └── main.py           # FastAPI app
├── langchain_core/       # AI/ML components
│   ├── itinerary_generator.py
│   ├── chat_bot.py
│   ├── vector_store.py
│   └── tools.py
├── data/                 # Mock data files
│   ├── hotels_paris.json
│   ├── restaurants_paris.json
│   └── ...
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose config
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### Environment Setup
1. Create a `.env` file in the root directory:
```bash
GOOGLE_API_KEY=your_google_gemini_api_key_here
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

### Using Docker (Recommended)
```bash
# Build and start the application
docker-compose up --build

# Access the application
open http://localhost:8000
```

### Development Setup
```bash
# Backend setup
cd server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend setup (in another terminal)
cd client
npm install
npm start
```

## 📋 API Endpoints

### Itinerary Generation
- `POST /api/v1/generate-itinerary` - Generate personalized travel itinerary
- `POST /api/v1/predict-prices` - Predict travel costs

### Chat
- `POST /api/v1/chat` - Send message to AI assistant
- `GET /api/v1/chat/history` - Get chat history

### Hotels
- `POST /api/v1/search-hotels` - Search for hotels
- `GET /api/v1/hotels/{location}/popular` - Get popular hotels

### Restaurants
- `POST /api/v1/recommend-restaurants` - Get restaurant recommendations
- `GET /api/v1/restaurants/{location}/popular` - Get popular restaurants

## 🎯 Usage

1. **Homepage**: Enter your destination, travel dates, budget, and interests
2. **Generate Itinerary**: Click "Generate My Itinerary" to create your personalized plan
3. **View Results**: Browse day-wise activities, hotels, and restaurant recommendations
4. **Chat Assistant**: Use the floating chat widget for additional travel advice

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Your Google Gemini Pro API key
- `CHROMA_PERSIST_DIRECTORY`: Directory for ChromaDB persistence
- `REACT_APP_API_URL`: Frontend API base URL (defaults to localhost:8000)

### Customization
- Modify mock data in `/data/` directory
- Update AI prompts in `langchain_core/`
- Customize UI components in `client/src/`

## 🐳 Docker Deployment

The application is containerized and ready for deployment:

```bash
# Production build
docker-compose -f docker-compose.yml up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Development

### Running Tests
```bash
# Frontend tests
cd client
npm test

# Backend tests (when implemented)
cd server
pytest
```

### Code Quality
```bash
# Frontend linting
cd client
npm run lint

# Backend formatting
cd server
black .
isort .
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs/`
- Review the API documentation at `/docs` when running the server

## 🔮 Future Enhancements

- [ ] Real-time collaboration for group trips
- [ ] Offline itinerary download (PDF)
- [ ] Visa and documentation assistant
- [ ] Weather-based itinerary adjustments
- [ ] Deal tracking and price alerts
- [ ] Integration with booking platforms
- [ ] Mobile app development
- [ ] Multi-language support

---

Built with ❤️ using modern AI and web technologies. 