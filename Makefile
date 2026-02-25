.DEFAULT_GOAL := help

# ========================================
# ERP SaaS Construcao - Makefile
# ========================================

## Setup
setup: ## Setup completo do ambiente de desenvolvimento
	@./scripts/setup.sh

setup-docker: ## Setup com containers Docker
	@./scripts/setup.sh --with-docker

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
build: ## Build completo (backend + frontend)
	@cd apps/backend && npm run build
	@cd apps/frontend && npm run build

build-backend: ## Build apenas do backend
	@cd apps/backend && npm run build

build-frontend: ## Build apenas do frontend
	@cd apps/frontend && npm run build

## Banco de Dados
db-migrate: ## Rodar migrations
	@./scripts/migrate.sh run

db-migrate-revert: ## Reverter ultima migration
	@./scripts/migrate.sh revert

db-migrate-generate: ## Gerar migration automatica a partir das entidades
	@./scripts/migrate.sh generate $(name)

db-migrate-status: ## Mostrar status das migrations
	@./scripts/migrate.sh status

db-seed: ## Rodar seeds (dados iniciais)
	@./scripts/seed.sh

db-reset: ## Reset do banco (drop + migrate + seed)
	@cd apps/backend && npm run schema:drop && npm run migration:run && npm run seed

## Docker
docker-up: ## Subir todos os containers (dev)
	@docker-compose -f infra/docker/docker-compose.yml up -d

docker-down: ## Parar todos os containers
	@docker-compose -f infra/docker/docker-compose.yml down

docker-build: ## Build dos containers
	@docker-compose -f infra/docker/docker-compose.yml build

docker-logs: ## Ver logs dos containers
	@docker-compose -f infra/docker/docker-compose.yml logs -f

docker-infra: ## Subir apenas infra (PostgreSQL, Redis, RabbitMQ)
	@docker-compose -f infra/docker/docker-compose.yml up -d postgres redis rabbitmq

docker-prod: ## Subir containers em modo producao
	@docker-compose -f infra/docker/docker-compose.prod.yml up -d

## Testes
test: ## Rodar todos os testes
	@cd apps/backend && npm run test -- --passWithNoTests

test-watch: ## Testes em modo watch
	@cd apps/backend && npm run test:watch

test-cov: ## Testes com cobertura
	@cd apps/backend && npm run test:cov

test-e2e: ## Testes E2E
	@cd apps/backend && npm run test:e2e -- --passWithNoTests

test-all: test test-e2e ## Rodar testes unitarios e E2E

## Lint e Formatacao
lint: ## Lint de todo o projeto
	@cd apps/backend && npm run lint

format: ## Formatar codigo com Prettier
	@cd apps/backend && npm run format

typecheck: ## Verificar tipos TypeScript
	@cd apps/backend && npx tsc --noEmit

## Ajuda
help: ## Mostrar esta ajuda
	@echo ""
	@echo "ERP SaaS Construcao - Comandos disponiveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""
