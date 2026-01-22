#!/bin/bash

echo "🚀 Starting E-Commerce Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build images
echo "📦 Building Docker images..."
docker-compose build

# Start services
echo "🔧 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 20

# Check service health
echo "🏥 Checking service health..."
docker-compose ps

# Seed database
echo "🌱 Seeding database..."
docker-compose exec -T product-service npm run seed

echo "✅ All services are up and running!"
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔌 API Gateway: http://localhost:4000/graphql"
echo "👤 User Service: http://localhost:4001/graphql"
echo "📦 Product Service: http://localhost:4002/graphql"
echo "🛒 Order Service: http://localhost:4003/graphql"