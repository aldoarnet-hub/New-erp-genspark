#!/bin/bash
# ============================================================
# ERP SaaS - Script de Migrations
# ============================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

BACKEND_DIR="apps/backend"
ACTION="${1:-run}"

case "$ACTION" in
  run)
    log_info "Executando migrations..."
    cd "$BACKEND_DIR" && npm run migration:run
    log_info "Migrations executadas com sucesso"
    ;;
  revert)
    log_info "Revertendo ultima migration..."
    cd "$BACKEND_DIR" && npm run migration:revert
    log_info "Migration revertida com sucesso"
    ;;
  generate)
    NAME="${2:-AutoMigration}"
    log_info "Gerando migration: $NAME..."
    cd "$BACKEND_DIR" && npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d src/database/typeorm.config.ts "src/database/migrations/$NAME"
    log_info "Migration gerada com sucesso"
    ;;
  create)
    NAME="${2:-CustomMigration}"
    log_info "Criando migration vazia: $NAME..."
    cd "$BACKEND_DIR" && npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:create "src/database/migrations/$NAME"
    log_info "Migration criada com sucesso"
    ;;
  status)
    log_info "Status das migrations..."
    cd "$BACKEND_DIR" && npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:show -d src/database/typeorm.config.ts
    ;;
  drop)
    log_warn "ATENCAO: Isso ira dropar todo o schema do banco de dados!"
    read -p "Tem certeza? (y/N): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
      cd "$BACKEND_DIR" && npm run schema:drop
      log_info "Schema dropado com sucesso"
    else
      log_info "Operacao cancelada"
    fi
    ;;
  *)
    echo "Uso: $0 {run|revert|generate|create|status|drop} [nome]"
    echo ""
    echo "  run       - Executa todas as migrations pendentes"
    echo "  revert    - Reverte a ultima migration"
    echo "  generate  - Gera migration automatica a partir das entidades"
    echo "  create    - Cria uma migration vazia"
    echo "  status    - Mostra status das migrations"
    echo "  drop      - Dropa todo o schema (CUIDADO!)"
    exit 1
    ;;
esac
