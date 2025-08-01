# Multi-stage Dockerfile for SafarBot
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Ensure Tailwind CSS is properly built
RUN npm install -D tailwindcss@^3.4.17 postcss@^8.4.32 autoprefixer@^10.4.16
RUN npm run build

FROM python:3.11-slim AS backend-builder

WORKDIR /app
COPY server/requirements.txt ./
RUN pip install --no-cache-dir --timeout 300 -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy application code
COPY server/ ./server/
COPY langchain_core/ ./langchain_core/
COPY data/ ./data/

# Copy frontend build
COPY --from=frontend-builder /app/client/build ./client/build

# Create non-root user
RUN useradd -m -u 1000 safarbot && chown -R safarbot:safarbot /app
USER safarbot

EXPOSE 8000

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"] 