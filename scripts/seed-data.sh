#!/bin/bash

echo "🌱 Seeding Database..."
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if containers are running
check_container() {
  if ! docker ps --format '{{.Names}}' | grep -q "$1"; then
    echo -e "${RED}Error: Container $1 is not running${NC}"
    echo "Please run: docker compose up -d"
    exit 1
  fi
}

echo "Checking containers..."
check_container "ecommerce-postgres"
check_container "ecommerce-mongodb"
check_container "ecommerce-mysql"
echo -e "${GREEN}All containers are running${NC}"
echo ""

# Wait for databases to be ready
echo "Waiting for databases to be ready..."
sleep 2

# Seed PostgreSQL (User Service)
echo ""
echo -e "${YELLOW}📦 Seeding User Service (PostgreSQL)...${NC}"
if docker exec -i ecommerce-postgres psql -U postgres -d userdb < "$SCRIPT_DIR/seed-data/users.sql" 2>/dev/null; then
  echo -e "${GREEN}✅ User Service seeded successfully${NC}"
else
  echo -e "${RED}❌ Failed to seed User Service${NC}"
fi

# Seed MongoDB (Product Service)
echo ""
echo -e "${YELLOW}📦 Seeding Product Service (MongoDB)...${NC}"
if docker exec -i ecommerce-mongodb mongosh --quiet productdb < "$SCRIPT_DIR/seed-data/products.js" 2>/dev/null; then
  echo -e "${GREEN}✅ Product Service seeded successfully${NC}"
else
  echo -e "${RED}❌ Failed to seed Product Service${NC}"
fi

# Seed MySQL (Order Service)
echo ""
echo -e "${YELLOW}📦 Seeding Order Service (MySQL)...${NC}"
if docker exec -i ecommerce-mysql mysql -u root -pmysql_password orderdb < "$SCRIPT_DIR/seed-data/orders.sql" 2>/dev/null; then
  echo -e "${GREEN}✅ Order Service seeded successfully${NC}"
else
  echo -e "${RED}❌ Failed to seed Order Service${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Database seeding complete!${NC}"
echo ""
echo "Test credentials:"
echo "  Email: john.doe@example.com"
echo "  Password: Password123"
echo ""
echo "Other test users:"
echo "  - jane.smith@example.com"
echo "  - bob.wilson@example.com"
echo "  - alice.johnson@example.com"
echo "  - admin@example.com"
echo "  (All passwords: Password123)"
