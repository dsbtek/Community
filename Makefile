.PHONY: help build up down logs shell-backend shell-frontend shell-db migrate createsuperuser test clean

# Default target
help:
	@echo "Available commands:"
	@echo "  build          - Build all Docker images"
	@echo "  up             - Start all services"
	@echo "  down           - Stop all services"
	@echo "  logs           - View logs for all services"
	@echo "  shell-backend  - Open shell in backend container"
	@echo "  shell-frontend - Open shell in frontend container"
	@echo "  shell-db       - Open MySQL shell"
	@echo "  migrate        - Run Django migrations"
	@echo "  createsuperuser- Create Django superuser"
	@echo "  test           - Run tests"
	@echo "  clean          - Clean up containers and volumes"

# Build all images
build:
	docker-compose build

# Start all services
up:
	docker-compose up

# Start all services in detached mode
up-d:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Backend shell
shell-backend:
	docker-compose exec backend bash

# Frontend shell
shell-frontend:
	docker-compose exec frontend sh

# Database shell
shell-db:
	docker-compose exec db mysql -u community_user -p community_db

# Run Django migrations
migrate:
	docker-compose exec backend python manage.py migrate

# Create Django superuser
createsuperuser:
	docker-compose exec backend python manage.py createsuperuser

# Run backend tests
test-backend:
	docker-compose exec backend python manage.py test

# Run frontend tests
test-frontend:
	docker-compose exec frontend npm test

# Run all tests
test: test-backend test-frontend

# Clean up everything
clean:
	docker-compose down -v --rmi all --remove-orphans
	docker system prune -f

# Setup development environment
setup:
	cp backend/.env.example backend/.env
	docker-compose build
	docker-compose up -d
	sleep 10
	docker-compose exec backend python manage.py migrate
	@echo "Setup complete! Access the app at:"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8000"
