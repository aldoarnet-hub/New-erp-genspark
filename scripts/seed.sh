#!/bin/bash
# ============================================================
# ERP SaaS - Script de Seed (dados iniciais)
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

log_info "Executando seeds do banco de dados..."
log_info "Isso ira popular dados iniciais (unidades, categorias, marcas, etc.)"

cd "$BACKEND_DIR"

# Verifica se o banco esta acessivel
log_info "Verificando conexao com o banco de dados..."
npx ts-node -r tsconfig-paths/register -e "
const { DataSource } = require('typeorm');
const ds = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'erp_dev',
});
ds.initialize()
  .then(() => { console.log('Banco de dados acessivel'); ds.destroy(); })
  .catch((err) => { console.error('Erro ao conectar:', err.message); process.exit(1); });
" 2>/dev/null || {
  log_error "Nao foi possivel conectar ao banco de dados."
  log_warn "Verifique se o PostgreSQL esta rodando e as variaveis de ambiente estao corretas."
  exit 1
}

log_info "Executando seed..."
npm run seed

log_info "Seeds executados com sucesso!"
log_info "Dados iniciais populados no banco de dados."
