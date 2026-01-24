# E-Commerce Microservices Platform

Full-stack e-commerce platform built with microservices architecture using Apollo Federation.

## Tech Stack

- **API Gateway**: Apollo Gateway, Apollo Server 5, Express 5
- **Microservices**: Node.js, GraphQL (Apollo Subgraph)
- **Databases**: PostgreSQL (Users), MongoDB (Products), MySQL (Orders)
- **Authentication**: JWT

## Architecture

```
                    ┌─────────────────────┐
                    │    API Gateway      │
                    │   (Apollo Gateway)  │
                    │    localhost:4000   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ User Service  │    │Product Service│    │ Order Service │
│ localhost:4001│    │ localhost:4002│    │ localhost:4003│
│  (PostgreSQL) │    │   (MongoDB)   │    │    (MySQL)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| Frontend | 80 | - | React web application |
| API Gateway | 4000 | - | Apollo Federation Gateway |
| User Service | 4001 | PostgreSQL | Authentication & user management |
| Product Service | 4002 | MongoDB | Product catalog & inventory |
| Order Service | 4003 | MySQL | Order processing & management |

### Docker Containers

| Container | Port | Description |
|-----------|------|-------------|
| ecommerce-postgres | 5432 | PostgreSQL 15 (User data) |
| ecommerce-mongodb | 27017 | MongoDB 7 (Product data) |
| ecommerce-mysql | 3306 | MySQL 8.0 (Order data) |

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-platform
```

2. Start all services:
```bash
docker compose up -d
```

3. Seed the database with test data:
```bash
./scripts/seed-data.sh
```

4. Check service health:
```bash
./scripts/health-check.sh
```

5. Open GraphQL Playground: http://localhost:4000/graphql

### Manual Installation (Development)

1. Install dependencies for each service:
```bash
cd services/user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
cd ../api-gateway && npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env` in each service directory
   - Update database connection strings and other settings

3. Start databases:
```bash
docker compose up -d postgres mongodb mysql
```

4. Start all services:
```bash
# Terminal 1 - User Service
cd services/user-service && npm run dev

# Terminal 2 - Product Service
cd services/product-service && npm run dev

# Terminal 3 - Order Service
cd services/order-service && npm run dev

# Terminal 4 - API Gateway
cd services/api-gateway && npm run dev
```

## Test Data

After running the seed script, you can use these test accounts:

| Email | Password | Description |
|-------|----------|-------------|
| john.doe@example.com | Password123 | User with 2 addresses, 2 orders |
| jane.smith@example.com | Password123 | User with 1 address, 1 order |
| bob.wilson@example.com | Password123 | User with 1 address, 1 order |
| alice.johnson@example.com | Password123 | User with 2 addresses, 1 order |
| admin@example.com | Password123 | Admin user |

### Sample Products

The seed data includes 15 products across categories:
- **Electronics**: iPhone 15 Pro Max, Galaxy S24 Ultra, MacBook Pro, Sony WH-1000XM5, AirPods Pro 2
- **Fashion**: Classic Polo Shirt, Slim Fit Jeans, Floral Summer Dress
- **Home & Living**: Smart Air Purifier, Ergonomic Office Chair
- **Sports & Outdoors**: Running Shoes Pro, Yoga Mat Premium
- **Beauty**: Vitamin C Serum

### Sample Orders

5 orders with different statuses: Delivered, Shipped, Processing, Pending, Cancelled

### API Endpoints

- **GraphQL Playground**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health
- **Gateway Info**: http://localhost:4000/info

## GraphQL Examples

### Register User
```graphql
mutation {
  register(input: {
    email: "test@example.com"
    password: "password123"
    firstName: "Test"
    lastName: "User"
  }) {
    token
    user {
      id
      email
    }
  }
}
```

### Login
```graphql
mutation {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      email
    }
  }
}
```

### Get Current User with Orders
```graphql
query {
  me {
    id
    email
    firstName
    lastName
    orders {
      id
      orderNumber
      status
      totalAmount
      items {
        productName
        quantity
        unitPrice
        product {
          id
          name
          price
        }
      }
    }
  }
}
```

### Get Products
```graphql
query {
  products(limit: 10) {
    edges {
      node {
        id
        name
        price
        stock
        category
      }
    }
    totalCount
  }
}
```

### Create Order
```graphql
mutation {
  createOrder(input: {
    items: [
      { productId: "product-id", quantity: 2 }
    ]
    shippingAddress: {
      street: "123 Main St"
      city: "Bangkok"
      postalCode: "10110"
      country: "Thailand"
    }
    paymentMethod: CREDIT_CARD
  }) {
    id
    orderNumber
    status
    totalAmount
  }
}
```

## Authentication

Include the JWT token in the Authorization header for protected queries:

```
Authorization: Bearer <your-jwt-token>
```

## Scripts

| Script | Description |
|--------|-------------|
| `./scripts/start-all.sh` | Start all Docker services |
| `./scripts/stop-all.sh` | Stop all Docker services |
| `./scripts/seed-data.sh` | Seed all databases with test data |
| `./scripts/health-check.sh` | Check health status of all services |
| `./scripts/deploy-k8s.sh` | Deploy to Kubernetes cluster |
| `./scripts/deploy-complete.sh` | Full deployment with RBAC & monitoring |
| `./scripts/smoke-tests.sh` | Run smoke tests on deployed services |

### Seed Data Files

- `scripts/seed-data/users.sql` - PostgreSQL seed (users & addresses)
- `scripts/seed-data/products.js` - MongoDB seed (products)
- `scripts/seed-data/orders.sql` - MySQL seed (orders & items)

## CI/CD Pipeline

This project includes a Jenkins pipeline for automated build and deployment.

### Jenkins Setup

1. Start Jenkins:
```bash
docker-compose -f infrastructure/jenkins/docker-compose.jenkins.yml up -d
```

2. Access Jenkins at `http://localhost:8080`

3. Configure required credentials:
   - `docker-registry-credentials` - Docker registry login
   - `kubeconfig-file` - Kubernetes config file

### Pipeline Features

- Automatic change detection (builds only affected services)
- Parallel test execution
- Docker image build and push
- Kubernetes deployment
- Smoke tests after deployment
- Slack notifications
- Production deployment approval

### Trigger Deployment

```bash
# Deploy to development
git push origin develop

# Deploy to staging
git push origin staging

# Deploy to production (requires manual approval)
git push origin main
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or Minikube)
- kubectl configured
- Container registry access

### Deploy to Kubernetes

```bash
# Quick deployment
./scripts/deploy-k8s.sh production

# Full deployment with monitoring
./scripts/deploy-complete.sh production

# Run smoke tests
./scripts/smoke-tests.sh production
```

### Check Deployment Status

```bash
# View pods
kubectl get pods -n production

# View services
kubectl get services -n production

# Check HPA status
kubectl get hpa -n production
```

### Infrastructure Components

| Component | Description |
|-----------|-------------|
| Namespaces | development, staging, production, monitoring |
| Databases | PostgreSQL, MongoDB, MySQL StatefulSets |
| Services | ClusterIP services for internal communication |
| Ingress | Frontend ingress with TLS |
| HPA | Auto-scaling for all services |
| Network Policies | Secure service-to-service communication |
| Monitoring | Prometheus & Grafana |

## Project Structure

```
ecommerce-platform/
├── services/
│   ├── api-gateway/          # Apollo Federation Gateway
│   ├── user-service/         # User authentication & management
│   ├── product-service/      # Product catalog
│   └── order-service/        # Order processing
├── frontend-web/             # React frontend (Vite)
├── infrastructure/
│   ├── jenkins/              # Jenkins Docker Compose
│   └── kubernetes/
│       ├── api-gateway/      # API Gateway K8s manifests
│       ├── user-service/     # User Service K8s manifests
│       ├── product-service/  # Product Service K8s manifests
│       ├── order-service/    # Order Service K8s manifests
│       ├── frontend/         # Frontend K8s manifests
│       ├── databases/        # Database StatefulSets
│       ├── monitoring/       # Prometheus & Grafana
│       ├── namespaces/       # Environment namespaces
│       ├── network-policies/ # Network security policies
│       └── rbac/             # Service accounts & roles
├── scripts/
│   ├── start-all.sh          # Start all services
│   ├── stop-all.sh           # Stop all services
│   ├── seed-data.sh          # Main seed runner
│   ├── health-check.sh       # Service health checker
│   ├── deploy-k8s.sh         # Kubernetes deployment
│   ├── deploy-complete.sh    # Full deployment script
│   ├── smoke-tests.sh        # Post-deployment tests
│   └── seed-data/            # Database seed files
├── docs/
│   └── DEPLOYMENT.md         # Deployment documentation
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── Jenkinsfile               # CI/CD pipeline definition
└── README.md
```

## Federation Schema

The services use Apollo Federation v2.3 with the following entity relationships:

- **User** (owned by user-service, extended by order-service with `orders` field)
- **Product** (owned by product-service, referenced by order-service)
- **Order** (owned by order-service)

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Detailed deployment instructions for local, Docker, and Kubernetes

## License

ISC
