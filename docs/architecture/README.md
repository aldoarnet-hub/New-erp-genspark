# Arquitetura do Sistema - ERP SaaS Multi-Tenant

## Visao Geral

O ERP SaaS para Varejo/Atacado de Materiais de Construcao segue uma arquitetura de **monolito modular** com separacao clara de responsabilidades.

## Stack Tecnologica

| Camada | Tecnologia | Versao |
|--------|-----------|--------|
| Backend | NestJS + TypeScript | 10.x / 5.x |
| Frontend | React + Vite + Tailwind | 18.x |
| Banco de Dados | PostgreSQL | 16.x |
| Cache | Redis | 7.x |
| Fila de Mensagens | RabbitMQ | 3.12.x |
| ORM | TypeORM | 0.3.x |
| Autenticacao | Passport + JWT | - |
| Documentacao API | Swagger/OpenAPI | 7.x |
| Containerizacao | Docker + Docker Compose | - |
| Orquestracao | Kubernetes | - |
| CI/CD | GitHub Actions | - |

## Diagrama de Modulos

```
apps/backend/src/
  modules/
    auth/         - Autenticacao JWT, Passport, Guards
    core/         - Tenant, Empresa, Filial, Usuario
    cadastros/    - Produtos, Clientes, Fornecedores, Auxiliares
    fiscal/       - Motor tributario, NCM, CFOP, CEST, ICMS
    health/       - Health check endpoint
```

## Multi-Tenancy

- **Estrategia**: Column-based (tenantId em cada tabela)
- **Isolamento**: TenantGuard + JWT payload + filtro automatico por tenantId
- **Futuro**: Migracao para schema-based por tenant (Fase futura)

## Seguranca

- **Autenticacao**: JWT com access token (1h) + refresh token (7d)
- **Autorizacao**: RBAC com perfis (SUPER_ADMIN, ADMIN, GERENTE, VENDEDOR, etc.)
- **Criptografia**: AES-256-GCM para dados sensiveis
- **Senha**: bcrypt com salt
- **CORS**: Configuravel por ambiente
- **SSL/TLS**: Nginx com certificado Let's Encrypt (producao)

## Fluxo de Dados

```
Cliente HTTP -> Nginx (SSL) -> NestJS API -> PostgreSQL
                                  |
                                  +-> Redis (Cache)
                                  +-> RabbitMQ (Eventos)
```

## Ambientes

| Ambiente | Branch | Trigger |
|----------|--------|---------|
| Development | feature/* | Local |
| Staging | develop | Push to develop |
| Production | main | Push to main |
