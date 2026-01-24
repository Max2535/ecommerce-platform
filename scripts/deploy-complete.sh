#!/bin/bash

set -e

NAMESPACE=${1:-production}

echo "🚀 Deploying Complete E-Commerce Platform to $NAMESPACE"

# Create namespaces
echo "📦 Creating namespaces..."
kubectl apply -f infrastructure/kubernetes/namespaces/

# Create RBAC
echo "🔐 Setting up RBAC..."
kubectl apply -f infrastructure/kubernetes/rbac/

# Deploy databases
echo "💾 Deploying databases..."
kubectl apply -f infrastructure/kubernetes/databases/ -n $NAMESPACE

# Wait for databases
echo "⏳ Waiting for databases..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s || true
kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=300s || true

# Deploy services
echo "🔧 Deploying microservices..."
kubectl apply -f infrastructure/kubernetes/user-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/product-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/order-service/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/api-gateway/ -n $NAMESPACE
kubectl apply -f infrastructure/kubernetes/frontend/ -n $NAMESPACE

# Apply network policies
echo "🔒 Applying network policies..."
kubectl apply -f infrastructure/kubernetes/network-policies/ -n $NAMESPACE

# Deploy monitoring
echo "📊 Deploying monitoring stack..."
kubectl apply -f infrastructure/kubernetes/monitoring/

echo "✅ Deployment complete!"
echo ""
echo "📋 Check status:"
echo "  kubectl get pods -n $NAMESPACE"
echo ""
echo "🌐 Services:"
kubectl get services -n $NAMESPACE