.PHONY: help build up down logs test clean

help:
	@echo "Available commands:"
	@echo "  make build      - Build all Docker images"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View logs"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Remove all containers and volumes"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	cd services/user-service && npm test
	cd services/product-service && npm test

clean:
	docker-compose down -v
	docker system prune -f

restart:
	docker-compose down
	docker-compose up -d

seed:
	docker-compose exec product-service npm run seed