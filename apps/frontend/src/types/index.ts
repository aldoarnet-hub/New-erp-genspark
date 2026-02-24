// ===== Auth Types =====
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  roles: string[];
  tenantId: string;
  empresaId: string;
  filialId: string;
  telefone?: string;
  avatar?: string;
  ativo: boolean;
}

// ===== Tenant Types =====
export interface Tenant {
  id: string;
  nome: string;
  slug: string;
  cnpj: string;
  email: string;
  plano: 'trial' | 'basico' | 'profissional' | 'enterprise';
  status: 'ativo' | 'inativo' | 'suspenso' | 'trial';
  maxUsuarios: number;
  maxEmpresas: number;
  maxFiliais: number;
}

// ===== Empresa Types =====
export interface Empresa {
  id: string;
  tenantId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  tipo: 'matriz' | 'filial';
  regimeTributario: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei';
  cidade?: string;
  uf?: string;
  ativo: boolean;
  filiais?: Filial[];
}

// ===== Filial Types =====
export interface Filial {
  id: string;
  empresaId: string;
  tenantId: string;
  nome: string;
  cnpj?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
}

// ===== API Response =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
