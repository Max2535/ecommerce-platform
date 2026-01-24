#!/bin/bash

set -e

NAMESPACE=${1:-production}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying to Kubernetes (Namespace: $NAMESPACE, Environment: $ENVIRONMENT)"

# Create namespace if not exists
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Label namespace
kubectl label namespace $NAMESPACE environment=$ENVIRONMENT --overwrite

echo "📦 Deploying databases..."
kubectl apply -f infrastructure/kubernetes/databases/ -n $NAMESPACE

echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=300s

echo "🔧 Deploying services..."
kubectl apply -f infrastructure/kubernetes/user-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/product-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/order-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/api-gateway/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/frontend/ -n $NAMESPACE

echo "⏳ Waiting for deployments to be ready..."
kubectl rollout status deployment/user-service -n $NAMESPACE
kubectl rollout status deployment/product-service -n $NAMESPACE
kubectl rollout status deployment/order-service -n $NAMESPACE
kubectl rollout status deployment/api-gateway -n $NAMESPACE
kubectl rollout status deployment/frontend -n $NAMESPACE

echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
kubectl get pods -n $NAMESPACE
echo ""
kubectl get services -n $NAMESPACE