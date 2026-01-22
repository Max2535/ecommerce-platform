#!/bin/bash

echo "🏥 Running Health Checks..."
echo ""

# Check User Service
echo "Checking User Service..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/health 2>/dev/null)
if [ "$response" = "200" ]; then
  echo "✅ User Service is healthy"
else
  echo "❌ User Service is down (HTTP: $response)"
fi
echo ""

# Check Product Service
echo "Checking Product Service..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4002/health 2>/dev/null)
if [ "$response" = "200" ]; then
  echo "✅ Product Service is healthy"
else
  echo "❌ Product Service is down (HTTP: $response)"
fi
echo ""

# Check Order Service
echo "Checking Order Service..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4003/health 2>/dev/null)
if [ "$response" = "200" ]; then
  echo "✅ Order Service is healthy"
else
  echo "❌ Order Service is down (HTTP: $response)"
fi
echo ""

# Check API Gateway
echo "Checking API Gateway..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null)
if [ "$response" = "200" ]; then
  echo "✅ API Gateway is healthy"
else
  echo "❌ API Gateway is down (HTTP: $response)"
fi
echo ""

# Check Frontend
echo "Checking Frontend..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null)
if [ "$response" = "200" ]; then
  echo "✅ Frontend is healthy"
else
  echo "❌ Frontend is down (HTTP: $response)"
fi
echo ""

echo "✅ Health check complete!"
