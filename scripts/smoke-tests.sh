#!/bin/bash

set -e

NAMESPACE=$1

echo "🧪 Running smoke tests for $NAMESPACE..."

# Test User Service
echo "Testing User Service..."
kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
    -n $NAMESPACE -- \
    curl -f http://user-service:4001/health || echo "❌ User Service health check failed"

# Test Product Service
echo "Testing Product Service..."
kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
    -n $NAMESPACE -- \
    curl -f http://product-service:4002/health || echo "❌ Product Service health check failed"

# Test Order Service
echo "Testing Order Service..."
kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
    -n $NAMESPACE -- \
    curl -f http://order-service:4003/health || echo "❌ Order Service health check failed"

# Test API Gateway
echo "Testing API Gateway..."
kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
    -n $NAMESPACE -- \
    curl -f http://api-gateway:4000/health || echo "❌ API Gateway health check failed"

echo "✅ Smoke tests completed!"