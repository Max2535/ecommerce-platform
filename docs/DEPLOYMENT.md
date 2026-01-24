# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (GKE, EKS, AKS, or Minikube)
- kubectl configured
- Jenkins (optional for CI/CD)
- Container registry (Docker Hub, ACR, ECR, GCR)

## Local Development

### Quick Start
```bash
# Start all services
./scripts/start-all.sh

# Check health
./scripts/health-check.sh

# Stop all services
./scripts/stop-all.sh
```

### Manual Setup
```bash
# Start databases
docker-compose up -d postgres mongodb mysql

# Start services
cd services/user-service && npm run dev
cd services/product-service && npm run dev
cd services/order-service && npm run dev
cd services/api-gateway && npm run dev

# Start frontend
cd frontend-web && npm run dev
```

## Production Deployment

### Build Docker Images
```bash
# Build all images
docker-compose build

# Or build individually
docker build -t user-service:latest services/user-service
docker build -t product-service:latest services/product-service
docker build -t order-service:latest services/order-service
docker build -t api-gateway:latest services/api-gateway
docker build -t frontend:latest frontend-web
```

### Deploy to Kubernetes
```bash
# Deploy all services
./scripts/deploy-k8s.sh production

# Deploy specific service
kubectl apply -f infrastructure/kubernetes/user-service/ -n production

# Check status
kubectl get pods -n production
kubectl get services -n production
```

### Update Deployment
```bash
# Update image
kubectl set image deployment/user-service \
  user-service=your-registry/user-service:v2.0 \
  -n production

# Check rollout status
kubectl rollout status deployment/user-service -n production

# Rollback if needed
kubectl rollout undo deployment/user-service -n production
```

## CI/CD Pipeline

### Setup Jenkins

1. Start Jenkins:
```bash
docker-compose -f infrastructure/jenkins/docker-compose.jenkins.yml up -d
```

2. Access Jenkins at `http://localhost:8080`

3. Install required plugins:
   - Docker Pipeline
   - Kubernetes
   - Git
   - Blue Ocean

4. Configure credentials:
   - Docker registry credentials
   - Kubernetes config
   - Git credentials

### Trigger Build
```bash
# Push to git triggers automatic build
git push origin develop  # Deploy to development
git push origin staging  # Deploy to staging
git push origin main     # Deploy to production (requires approval)
```

## Monitoring

### Access Prometheus
```bash
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Open http://localhost:9090
```

### View Logs
```bash
# All pods
kubectl logs -f deployment/user-service -n production

# Specific pod
kubectl logs -f user-service-xxx-yyy -n production

# Previous logs
kubectl logs --previous user-service-xxx-yyy -n production
```

## Scaling

### Manual Scaling
```bash
# Scale deployment
kubectl scale deployment/user-service --replicas=5 -n production
```

### Auto Scaling

HPA is already configured. Check status:
```bash
kubectl get hpa -n production
```

## Troubleshooting

### Check Service Health
```bash
kubectl get pods -n production
kubectl describe pod user-service-xxx -n production
kubectl logs user-service-xxx -n production
```

### Database Connection Issues
```bash
# Check database pods
kubectl get pods -l app=postgres -n production

# Test connection
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -- \
  psql -h postgres-service -U postgres -d userdb
```

### Network Issues
```bash
# Test service connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  curl http://user-service:4001/health
```

## Backup & Recovery

### Database Backup
```bash
# PostgreSQL
kubectl exec postgres-0 -n production -- \
  pg_dump -U postgres userdb > backup.sql

# MongoDB
kubectl exec mongodb-0 -n production -- \
  mongodump --archive > backup.archive

# MySQL
kubectl exec mysql-0 -n production -- \
  mysqldump -u root -p orderdb > backup.sql
```

### Restore
```bash
# PostgreSQL
cat backup.sql | kubectl exec -i postgres-0 -n production -- \
  psql -U postgres userdb

# MongoDB
cat backup.archive | kubectl exec -i mongodb-0 -n production -- \
  mongorestore --archive

# MySQL
cat backup.sql | kubectl exec -i mysql-0 -n production -- \
  mysql -u root -p orderdb
```
```

---

## ✅ Final Checkpoint - Project Complete! 🎉

สร้างสำเร็จแล้วทั้งหมด:

### ✅ Backend (Microservices)
- User Service (PostgreSQL)
- Product Service (MongoDB)
- Order Service (MySQL)
- API Gateway (GraphQL Federation)

### ✅ Frontend
- React Web Application
- Material-UI Design
- Apollo Client
- Shopping Cart & Checkout

### ✅ DevOps
- Docker & Docker Compose
- Kubernetes Deployments
- Jenkins CI/CD Pipeline
- Auto-scaling (HPA)
- Health checks & Monitoring

### ✅ Testing
- Unit Tests
- Integration Tests
- Smoke Tests

### ✅ Documentation
- Setup guides
- Deployment guides
- API documentation

---

## 🚀 Final Project Structure
```
ecommerce-platform/
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   └── api-gateway/
├── frontend-web/
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── jenkins/
├── scripts/
├── docs/
├── docker-compose.yml
├── Jenkinsfile
└── README.md