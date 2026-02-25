# ERP SaaS - Materiais de Construcao

Sistema ERP Multi-Tenant para Varejo e Atacado de Materiais de Construcao.

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | NestJS 10 + TypeScript 5 |
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Banco** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Fila** | RabbitMQ 3.12 |
| **ORM** | TypeORM 0.3 |
| **Auth** | Passport + JWT |
| **Docs API** | Swagger/OpenAPI |
| **Infra** | Docker + Kubernetes |
| **CI/CD** | GitHub Actions |

## Inicio Rapido

```bash
# 1. Clonar e entrar no projeto
git clone <repo-url>
cd erp-saas-construcao

# 2. Setup automatico
./scripts/setup.sh --with-docker

# 3. Iniciar em modo dev
make dev
```

### Comandos Principais

```bash
make dev              # Backend + Frontend em modo dev
make backend          # Somente backend
make frontend         # Somente frontend
make docker-infra     # Subir PostgreSQL, Redis, RabbitMQ
make db-migrate       # Rodar migrations
make db-seed          # Popular dados iniciais
make test             # Rodar testes unitarios
make test-e2e         # Rodar testes E2E
make test-cov         # Testes com cobertura
make lint             # Lint do codigo
make typecheck        # Verificacao de tipos
make build            # Build completo
make help             # Ver todos os comandos
```

## Estrutura do Projeto

```
erp-saas-construcao/
  apps/
    backend/                   # API NestJS
      src/
        config/                # Configuracoes (app, db, redis, rabbitmq, swagger)
        database/
          migrations/          # Migrations TypeORM
          seeds/               # Seeds de dados iniciais
        modules/
          auth/                # Autenticacao JWT + Passport
          core/                # Tenant, Empresa, Filial, Usuario
          cadastros/           # Produtos, Clientes, Fornecedores, Auxiliares
          fiscal/              # Motor tributario, NCM, CFOP, CEST, ICMS
          health/              # Health check
        shared/
          decorators/          # @CurrentUser, @TenantId, @Roles
          enums/               # Permissao, Perfis
          events/              # Eventos do sistema
          factories/           # Factories para testes
          filters/             # HttpExceptionFilter
          guards/              # RolesGuard, TenantGuard
          interceptors/        # Logging, Transform
          jobs/                # Jobs assincronos
          pipes/               # ParseUuidPipe, ParseDocumentPipe
          types/               # Interfaces e tipos compartilhados
          utils/               # Crypto, Validadores brasileiros
    frontend/                  # SPA React + Vite
      src/
        components/            # Componentes React
        pages/                 # Paginas (Dashboard, Cadastros, Fiscal)
        services/              # Camada de servicos (API)
        store/                 # Estado global (Zustand)
  infra/
    docker/                    # Docker Compose (dev + prod)
    k8s/                       # Kubernetes manifests
    nginx/                     # Configuracao Nginx (HTTP + SSL)
  docs/
    api/                       # Referencia da API
    architecture/              # Arquitetura do sistema
    database/                  # Modelo de dados
    guides/                    # Guias de desenvolvimento
  scripts/                     # setup.sh, migrate.sh, seed.sh
```

## Portas dos Servicos

| Servico | Porta | URL |
|---------|-------|-----|
| Backend API | 3001 | http://localhost:3001/api/v1 |
| Swagger | 3001 | http://localhost:3001/api/docs |
| Frontend | 5175 | http://localhost:5175 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| RabbitMQ | 5672 | localhost:5672 |
| RabbitMQ UI | 15672 | http://localhost:15672 |

## Fases do Projeto

| Fase | Descricao | Status |
|------|----------|--------|
| 1 | Setup e Arquitetura | Concluido |
| 2 | Autenticacao (JWT, RBAC) | Concluido |
| 3 | Core (Tenant, Empresa, Filial) + Cadastros | Concluido |
| 4 | Vendas e PDV | Planejado |
| 5 | Estoque e Compras | Planejado |
| 6 | Financeiro | Planejado |
| 7 | Fiscal (NF-e, NFC-e) | Planejado |
| 8 | Relatorios e BI | Planejado |

## Testes

```bash
# Unitarios (45 testes)
make test

# E2E (1 teste)
make test-e2e

# Com cobertura
make test-cov
```

## Documentacao

- [Arquitetura](docs/architecture/README.md)
- [Modelo de Dados](docs/database/README.md)
- [API Reference](docs/api/README.md)
- [Guia de Desenvolvimento](docs/guides/README.md)

## Licenca

Privado - Todos os direitos reservados.
