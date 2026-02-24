export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  empresaId: string;
  filialId: string;
  roles: string[];
  perfil: string;
  iat?: number;
  exp?: number;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
  tenantId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditFields {
  criadoPor: string;
  atualizadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
