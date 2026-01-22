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
| `./scripts/seed-data.sh` | Seed all databases with test data |
| `./scripts/health-check.sh` | Check health status of all services |

### Seed Data Files

- `scripts/seed-data/users.sql` - PostgreSQL seed (users & addresses)
- `scripts/seed-data/products.js` - MongoDB seed (products)
- `scripts/seed-data/orders.sql` - MySQL seed (orders & items)

## Project Structure

```
ecommerce-platform/
├── services/
│   ├── api-gateway/        # Apollo Federation Gateway
│   ├── user-service/       # User authentication & management
│   ├── product-service/    # Product catalog
│   └── order-service/      # Order processing
├── frontend-web/           # React frontend (Vite)
├── scripts/
│   ├── seed-data.sh        # Main seed runner
│   ├── health-check.sh     # Service health checker
│   └── seed-data/          # Database seed files
├── docker-compose.yml      # Production compose
├── docker-compose.dev.yml  # Development compose
└── README.md
```

## Federation Schema

The services use Apollo Federation v2.3 with the following entity relationships:

- **User** (owned by user-service, extended by order-service with `orders` field)
- **Product** (owned by product-service, referenced by order-service)
- **Order** (owned by order-service)

## License

ISC
