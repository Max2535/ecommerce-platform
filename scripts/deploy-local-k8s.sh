#!/bin/bash

set -e

# Get the directory where the script is located and navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

NAMESPACE="local"
K8S_DIR="infrastructure/kubernetes"

echo "🚀 Deploying to Local Kubernetes (Docker Desktop / Minikube)"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check kubernetes connection
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster."
    echo "   Make sure Docker Desktop Kubernetes or Minikube is running."
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"
kubectl cluster-info | head -1
echo ""

# Build Docker images locally
echo "🐳 Building Docker images locally..."

docker build -t user-service:local ./services/user-service --target production
docker build -t product-service:local ./services/product-service --target production
docker build -t order-service:local ./services/order-service --target production
docker build -t api-gateway:local ./services/api-gateway --target production
docker build -t frontend:local ./frontend-web --target production

echo "✅ All images built successfully"
echo ""

# Create namespace
echo "📦 Creating namespace '$NAMESPACE'..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets
echo "🔐 Applying secrets..."
kubectl apply -f $K8S_DIR/local/secrets.yaml

# Function to apply manifest with namespace override
apply_manifest() {
    local file=$1
    echo "  Applying: $file"
    sed "s/namespace: production/namespace: $NAMESPACE/g" "$file" | kubectl apply -f -
}

# Deploy databases
echo "📦 Deploying databases..."
apply_manifest "$K8S_DIR/databases/postgres.yaml"
apply_manifest "$K8S_DIR/databases/mongodb.yaml"
apply_manifest "$K8S_DIR/databases/mysql.yaml"

echo ""
echo "⏳ Waiting for databases to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=120s || true

# Function to apply deployment with local image
apply_deployment() {
    local file=$1
    local service=$2
    echo "  Applying: $file (image: $service:local)"
    sed -e "s/namespace: production/namespace: $NAMESPACE/g" \
        -e "s|image: ghcr.io/ecommerce-platform/$service:latest|image: $service:local|g" \
        -e "s/imagePullPolicy: Always/imagePullPolicy: Never/g" \
        -e "s/replicas: 3/replicas: 1/g" \
        "$file" | kubectl apply -f -
}

# Deploy services
echo ""
echo "🔧 Deploying services..."

# User Service
apply_manifest "$K8S_DIR/user-service/service.yaml"
apply_deployment "$K8S_DIR/user-service/deployment.yaml" "user-service"

# Product Service
apply_manifest "$K8S_DIR/product-service/service.yaml"
apply_deployment "$K8S_DIR/product-service/deployment.yaml" "product-service"

# Order Service
apply_manifest "$K8S_DIR/order-service/service.yaml"
apply_deployment "$K8S_DIR/order-service/deployment.yaml" "order-service"

# API Gateway
apply_manifest "$K8S_DIR/api-gateway/service.yaml"
apply_deployment "$K8S_DIR/api-gateway/deployment.yaml" "api-gateway"

# Frontend
apply_manifest "$K8S_DIR/frontend/service.yaml"
apply_deployment "$K8S_DIR/frontend/deployment.yaml" "frontend"

echo ""
echo "⏳ Waiting for services to be ready..."
kubectl wait --for=condition=available deployment/user-service -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=available deployment/product-service -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=available deployment/order-service -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=available deployment/api-gateway -n $NAMESPACE --timeout=120s || true
kubectl wait --for=condition=available deployment/frontend -n $NAMESPACE --timeout=120s || true

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Pod Status:"
kubectl get pods -n $NAMESPACE
echo ""
echo "🌐 Services:"
kubectl get services -n $NAMESPACE
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "To access services, run port-forward:"
echo ""
echo "  # API Gateway (GraphQL Playground)"
echo "  kubectl port-forward svc/api-gateway 4000:80 -n $NAMESPACE"
echo ""
echo "  # Frontend"
echo "  kubectl port-forward svc/frontend 8080:80 -n $NAMESPACE"
echo ""
echo "Then open:"
echo "  Frontend:    http://localhost:8080"
echo "  GraphQL:     http://localhost:4000/graphql"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
