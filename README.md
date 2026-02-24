# ERP SaaS Multi-Tenant - Materiais de Construcao

> Sistema ERP completo para varejo e atacado de materiais de construcao.
> SaaS Multi-Tenant com foco em conformidade tributaria brasileira.

## Stack Tecnologico

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS 10 + TypeScript 5 + TypeORM |
| Frontend | React 18 + Vite + Tailwind + shadcn/ui |
| Banco | PostgreSQL 16 (multi-tenant por schema) |
| Cache | Redis 7 |
| Mensageria | RabbitMQ 3.12 |
| Infra | Docker + Kubernetes |
| CI/CD | GitHub Actions |

## Inicio Rapido

```bash
# 1. Clonar e instalar
git clone <repo-url>
cd erp-saas-construcao
cp .env.example .env

# 2. Instalar dependencias
cd apps/backend && npm install
cd ../frontend && npm install

# 3. Rodar em desenvolvimento
# Terminal 1 - Backend (porta 3001)
cd apps/backend && npm run start:dev

# Terminal 2 - Frontend (porta 5175)
cd apps/frontend && npm run dev
```

## Estrutura do Projeto

```
erp-saas-construcao/
├── apps/
│   ├── backend/          # API NestJS (porta 3001)
│   └── frontend/         # React + Vite (porta 5175)
├── infra/
│   ├── docker/           # Docker Compose
│   ├── nginx/            # Reverse proxy
│   └── k8s/              # Kubernetes manifests
├── docs/                 # Documentacao
├── scripts/              # Scripts utilitarios
└── .github/workflows/    # CI/CD
```

## Portas

| Servico | Porta |
|---------|-------|
| Frontend (Vite) | 5175 |
| Backend (NestJS) | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ | 5672 / 15672 |

## Documentacao da API

Swagger UI disponivel em: `http://localhost:3001/api/docs`

## Fases do Projeto

1. **Fase 1** - Setup e Fundacao (ATUAL)
2. **Fase 2** - Modulo Fiscal e Tributario
3. **Fase 3** - Cadastros Base
4. **Fase 4** - Estoque e Logistica
5. **Fase 5** - Vendas e Faturamento
6. **Fase 6** - Compras e Suprimentos
7. **Fase 7** - Financeiro
8. **Fase 8** - Integracoes e APIs
9. **Fase 9** - BI e Analytics
10. **Fase 10** - Migracao e Go-Live
