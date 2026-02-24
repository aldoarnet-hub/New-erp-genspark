import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.headers['x-tenant-id'] || user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant nao identificado. Envie o header X-Tenant-Id.');
    }

    // Injeta o tenantId no request para uso nos services
    request.tenantId = tenantId;
    return true;
  }
}
