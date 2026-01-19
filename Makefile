# Front-end - Makefile Commands
# ============================

.PHONY: help docker-up docker-up-build docker-down docker-restart docker-logs docker-ps docker-fresh

help:
	@echo "Front-end - Available Commands:"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up        - Start frontend with Docker"
	@echo "  make docker-up-build  - Rebuild and start frontend"
	@echo "  make docker-down      - Stop and remove frontend container"
	@echo "  make docker-restart   - Restart frontend with rebuild"
	@echo "  make docker-logs      - View container logs"
	@echo "  make docker-ps        - List running containers"
	@echo "  make docker-fresh     - Fresh rebuild (no cache) and start"

docker-up-build:
	docker compose up -d --build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-restart: docker-down docker-up-build

docker-logs:
	docker compose logs -f

docker-ps:
	docker compose ps

docker-fresh:
	@make docker-down
	@make docker-up-build
	@make docker-ps
