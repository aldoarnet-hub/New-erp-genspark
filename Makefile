.DEFAULT_GOAL := help

# ========================================
# ERP SaaS Construcao - Makefile
# ========================================

## Desenvolvimento
dev: ## Rodar backend + frontend em modo dev
	@echo "Iniciando ambiente de desenvolvimento..."
	@cd apps/backend && npm run start:dev &
	@cd apps/frontend && npm run dev

backend: ## Rodar apenas o backend
	@cd apps/backend && npm run start:dev

frontend: ## Rodar apenas o frontend
	@cd apps/frontend && npm run dev

## Build
build: ## Build completo
	@cd apps/backend && npm run build
	@cd apps/frontend && npm run build

## Banco de Dados
db-migrate: ## Rodar migrations
	@cd apps/backend && npm run migration:run

db-seed: ## Rodar seeds
	@cd apps/backend && npm run seed

db-reset: ## Reset do banco
	@cd apps/backend && npm run schema:drop && npm run migration:run && npm run seed

## Docker
docker-up: ## Subir containers
	@docker-compose -f infra/docker/docker-compose.yml up -d

docker-down: ## Parar containers
	@docker-compose -f infra/docker/docker-compose.yml down

docker-build: ## Build dos containers
	@docker-compose -f infra/docker/docker-compose.yml build

docker-logs: ## Ver logs
	@docker-compose -f infra/docker/docker-compose.yml logs -f

## Testes
test: ## Rodar todos os testes
	@cd apps/backend && npm run test
	@cd apps/frontend && npm run test

test-backend: ## Testes do backend
	@cd apps/backend && npm run test

test-frontend: ## Testes do frontend
	@cd apps/frontend && npm run test

test-e2e: ## Testes E2E
	@cd apps/backend && npm run test:e2e

## Lint
lint: ## Lint de todo o projeto
	@cd apps/backend && npm run lint
	@cd apps/frontend && npm run lint

## Ajuda
help: ## Mostrar esta ajuda
	@echo "ERP SaaS Construcao - Comandos disponiveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
