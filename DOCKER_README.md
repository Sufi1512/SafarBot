# 🐳 SafarBot Docker Setup

This guide explains how to run SafarBot backend using Docker containers.

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose (included with Docker Desktop)
- Git (to clone the repository)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd SafarBot
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
# Copy the example and update with your values
cp server/.env.example .env
```

### 3. Start All Services
```bash
docker-compose up -d
```

This will start:
- ✅ SafarBot Backend API (port 8000)
- ✅ Redis Cache (port 6379)
- ✅ MongoDB Database (port 27017)
- ✅ Redis Commander GUI (port 8081)
- ✅ Mongo Express GUI (port 8082)

## 🔧 Individual Services

### Backend Only
```bash
# Build the backend image
docker build -t safarbot-backend ./server

# Run the backend
docker run -p 8000:8000 safarbot-backend
```

### With Environment Variables
```bash
docker run -p 8000:8000 \
  -e REDIS_URL=redis://localhost:6379 \
  -e MONGODB_URL=mongodb://localhost:27017/safarbot \
  -e OPENAI_API_KEY=your_key_here \
  safarbot-backend
```

## 📊 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Backend API** | http://localhost:8000 | Main API server |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Redis Commander** | http://localhost:8081 | Redis GUI |
| **Mongo Express** | http://localhost:8082 | MongoDB GUI |

## 🗄️ Database Management

### MongoDB
- **Host**: localhost:27017
- **Database**: safarbot
- **Username**: admin
- **Password**: password123

### Redis
- **Host**: localhost:6379
- **No authentication required**

## 🔄 Development Workflow

### Hot Reload (Development)
```bash
# Start with volume mounting for hot reload
docker-compose up safarbot-backend
```

### Production Build
```bash
# Build optimized production image
docker build -t safarbot-backend:prod ./server

# Run production container
docker run -d --name safarbot-prod -p 8000:8000 safarbot-backend:prod
```

## 🛠️ Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f safarbot-backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild and restart
docker-compose up --build

# Rebuild specific service
docker-compose up --build safarbot-backend
```

### Database Access
```bash
# MongoDB shell
docker exec -it safarbot-mongodb mongosh

# Redis CLI
docker exec -it safarbot-redis redis-cli
```

## 🔧 Configuration

### Environment Variables
Key environment variables for the backend:

```bash
# Database
MONGODB_URL=mongodb://admin:password123@mongodb:27017/safarbot
REDIS_URL=redis://redis:6379

# API Keys
OPENAI_API_KEY=your_openai_key
SERP_API_KEY=your_serp_key
OPEN_WEATHER_API_KEY=your_weather_key

# Email
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
```

### Port Configuration
Default ports (can be changed in docker-compose.yml):
- Backend: 8000
- MongoDB: 27017
- Redis: 6379
- Redis Commander: 8081
- Mongo Express: 8082

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8000
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Check if databases are running
   docker-compose ps
   
   # Restart databases
   docker-compose restart redis mongodb
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Build Failures**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

### Health Checks
```bash
# Check backend health
curl http://localhost:8000/health

# Check Redis
docker exec safarbot-redis redis-cli ping

# Check MongoDB
docker exec safarbot-mongodb mongosh --eval "db.runCommand('ping')"
```

## 📈 Production Deployment

### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml safarbot
```

### Kubernetes
```bash
# Convert to Kubernetes manifests
kompose convert

# Apply to cluster
kubectl apply -f .
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use secrets management** for API keys
3. **Enable SSL/TLS** for production
4. **Restrict network access** to databases
5. **Regular security updates** of base images

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
