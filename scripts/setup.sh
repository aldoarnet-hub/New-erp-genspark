#!/bin/bash
# ============================================================
# ERP SaaS - Script de Setup do Ambiente de Desenvolvimento
# ============================================================
set -e

echo "============================================"
echo "  ERP SaaS - Setup do Ambiente"
echo "============================================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Verifica pre-requisitos
check_prereqs() {
  log_info "Verificando pre-requisitos..."

  command -v node >/dev/null 2>&1 || { log_error "Node.js nao encontrado. Instale v20+"; exit 1; }
  command -v npm >/dev/null 2>&1 || { log_error "npm nao encontrado."; exit 1; }
  command -v docker >/dev/null 2>&1 || { log_warn "Docker nao encontrado. Containers nao serao iniciados."; }
  command -v git >/dev/null 2>&1 || { log_error "Git nao encontrado."; exit 1; }

  NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js v18+ necessario. Versao atual: $(node -v)"
    exit 1
  fi

  log_info "Pre-requisitos OK (Node $(node -v), npm $(npm -v))"
}

# Copia arquivos de ambiente
setup_env() {
  log_info "Configurando variaveis de ambiente..."

  if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || true
    log_info "Arquivo .env criado a partir do .env.example"
  else
    log_warn "Arquivo .env ja existe. Pulando."
  fi

  if [ ! -f apps/backend/.env ]; then
    cp apps/backend/.env.example apps/backend/.env 2>/dev/null || true
    log_info "Arquivo apps/backend/.env criado"
  else
    log_warn "Arquivo apps/backend/.env ja existe. Pulando."
  fi
}

# Instala dependencias
install_deps() {
  log_info "Instalando dependencias do backend..."
  cd apps/backend && npm ci
  cd ../..

  log_info "Instalando dependencias do frontend..."
  cd apps/frontend && npm ci
  cd ../..

  log_info "Dependencias instaladas com sucesso"
}

# Inicia containers Docker
start_docker() {
  if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    log_info "Iniciando containers Docker (PostgreSQL, Redis, RabbitMQ)..."
    docker-compose -f infra/docker/docker-compose.yml up -d postgres redis rabbitmq
    log_info "Aguardando containers ficarem prontos..."
    sleep 5
  else
    log_warn "Docker/docker-compose nao disponivel. Inicie manualmente PostgreSQL, Redis e RabbitMQ."
  fi
}

# Roda migrations
run_migrations() {
  log_info "Rodando migrations do banco de dados..."
  cd apps/backend
  npm run migration:run 2>/dev/null || log_warn "Nenhuma migration encontrada ou erro na execucao."
  cd ../..
}

# Roda seeds
run_seeds() {
  log_info "Populando dados iniciais (seeds)..."
  cd apps/backend
  npm run seed 2>/dev/null || log_warn "Erro ao rodar seeds."
  cd ../..
}

# Build
run_build() {
  log_info "Compilando backend..."
  cd apps/backend && npm run build
  cd ../..

  log_info "Compilando frontend..."
  cd apps/frontend && npm run build
  cd ../..
}

# Main
main() {
  check_prereqs
  setup_env
  install_deps

  if [ "${1}" = "--with-docker" ]; then
    start_docker
    run_migrations
    run_seeds
  fi

  if [ "${1}" = "--build" ] || [ "${2}" = "--build" ]; then
    run_build
  fi

  echo ""
  log_info "============================================"
  log_info "  Setup concluido com sucesso!"
  log_info "============================================"
  echo ""
  echo "  Comandos disponiveis:"
  echo "    make dev           - Rodar em modo desenvolvimento"
  echo "    make backend       - Rodar apenas o backend"
  echo "    make frontend      - Rodar apenas o frontend"
  echo "    make docker-up     - Subir containers Docker"
  echo "    make test          - Rodar testes"
  echo "    make db-migrate    - Rodar migrations"
  echo "    make db-seed       - Rodar seeds"
  echo ""
}

main "$@"
