/**
 * Factories do sistema ERP SaaS
 * Utilitarios para criacao de objetos de teste e seed
 */
import { v4 as uuidv4 } from 'uuid';

export function createTenantId(): string {
  return uuidv4();
}

export function createTestTenant(overrides: Record<string, any> = {}) {
  return {
    id: uuidv4(),
    nome: 'Tenant Teste',
    slug: 'tenant-teste',
    cnpj: '11222333000181',
    plano: 'basico',
    status: 'ativo',
    limiteUsuarios: 5,
    limiteFiliais: 1,
    ...overrides,
  };
}

export function createTestUsuario(tenantId: string, overrides: Record<string, any> = {}) {
  return {
    id: uuidv4(),
    tenantId,
    nome: 'Usuario Teste',
    email: `teste-${Date.now()}@erp.com`,
    senha: '$2b$10$hashedpassword',
    perfil: 'ADMIN',
    roles: ['admin'],
    ativo: true,
    ...overrides,
  };
}

export function createTestEmpresa(tenantId: string, overrides: Record<string, any> = {}) {
  return {
    id: uuidv4(),
    tenantId,
    razaoSocial: 'Empresa Teste LTDA',
    nomeFantasia: 'Empresa Teste',
    cnpj: '11222333000181',
    ativo: true,
    ...overrides,
  };
}

export function createJwtPayload(overrides: Record<string, any> = {}) {
  const tenantId = uuidv4();
  return {
    sub: uuidv4(),
    email: 'admin@erp.com',
    tenantId,
    empresaId: uuidv4(),
    filialId: uuidv4(),
    roles: ['admin'],
    perfil: 'ADMIN',
    ...overrides,
  };
}
