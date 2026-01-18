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
| API Gateway | 4000 | - | Apollo Federation Gateway |
| User Service | 4001 | PostgreSQL | Authentication & user management |
| Product Service | 4002 | MongoDB | Product catalog & inventory |
| Order Service | 4003 | MySQL | Order processing & management |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- MongoDB
- MySQL

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-platform
```

2. Install dependencies for each service:
```bash
cd services/user-service && npm install
cd ../product-service && npm install
cd ../order-service && npm install
cd ../api-gateway && npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in each service directory
   - Update database connection strings and other settings

4. Start databases (PostgreSQL, MongoDB, MySQL)

5. Start all services:
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

## Project Structure

```
ecommerce-platform/
├── services/
│   ├── api-gateway/        # Apollo Federation Gateway
│   ├── user-service/       # User authentication & management
│   ├── product-service/    # Product catalog
│   └── order-service/      # Order processing
├── docs/
│   ├── SETUP.md
│   └── ARCHITECTURE.md
└── README.md
```

## Federation Schema

The services use Apollo Federation v2.3 with the following entity relationships:

- **User** (owned by user-service, extended by order-service with `orders` field)
- **Product** (owned by product-service, referenced by order-service)
- **Order** (owned by order-service)

## License

ISC
