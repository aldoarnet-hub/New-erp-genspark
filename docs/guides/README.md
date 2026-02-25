# Guia de Desenvolvimento - ERP SaaS

## Setup Rapido

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd erp-saas-construcao

# 2. Executar script de setup
./scripts/setup.sh --with-docker

# 3. Iniciar desenvolvimento
make dev
```

## Pre-Requisitos

- Node.js 20+ LTS
- Docker e Docker Compose
- Git
- PostgreSQL 16 (ou via Docker)
- Redis 7 (ou via Docker)

## Comandos Uteis

| Comando | Descricao |
|---------|----------|
| `make dev` | Iniciar backend + frontend |
| `make backend` | Somente backend |
| `make frontend` | Somente frontend |
| `make docker-up` | Subir containers |
| `make docker-down` | Parar containers |
| `make test` | Rodar todos os testes |
| `make test-backend` | Testes do backend |
| `make lint` | Lint de todo o projeto |
| `make db-migrate` | Rodar migrations |
| `make db-seed` | Popular dados iniciais |
| `make db-reset` | Reset completo do banco |

## Estrutura do Projeto

```
erp-saas-construcao/
  apps/
    backend/       - API NestJS
    frontend/      - SPA React + Vite
  infra/
    docker/        - Docker Compose (dev + prod)
    k8s/           - Kubernetes manifests
    nginx/         - Configuracao Nginx
  docs/            - Documentacao
  scripts/         - Scripts de automacao
```

## Fluxo de Trabalho Git

1. Crie uma branch a partir de `develop`: `git checkout -b feat/nova-feature develop`
2. Faca commits seguindo Conventional Commits: `feat(modulo): descricao`
3. Abra um PR para `develop`
4. Apos review e merge em develop, o CI/CD deploya para staging
5. Merge de develop para main deploya para producao

## Variaveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessario.

Variaveis criticas para producao:
- `JWT_SECRET` - Chave forte de no minimo 32 caracteres
- `JWT_REFRESH_SECRET` - Chave forte separada
- `ENCRYPTION_KEY` - Chave de 32 caracteres para AES-256
- `DATABASE_PASSWORD` - Senha forte do PostgreSQL
- `DATABASE_SYNCHRONIZE` - DEVE ser `false` em producao

## Criando um Novo Modulo

1. Crie a pasta em `apps/backend/src/modules/<nome>/`
2. Crie: `<nome>.module.ts`, `<nome>.controller.ts`, `<nome>.service.ts`
3. Crie entidades em `entities/` e DTOs em `dto/`
4. Registre o modulo em `app.module.ts`
5. Rode `npm run build` para verificar compilacao
6. Crie testes em `__tests__/` ou `test/`

## Testes

- **Unitarios**: `npm run test` (Jest, arquivos `.spec.ts`)
- **E2E**: `npm run test:e2e` (supertest, arquivos `.e2e-spec.ts`)
- **Coverage**: `npm run test:cov`

## Portas dos Servicos

| Servico | Porta |
|---------|-------|
| Backend API | 3001 |
| Frontend Dev | 5175 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ | 5672 |
| RabbitMQ UI | 15672 |
| Swagger | 3001/api/docs |
