import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@/shared/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('app.jwtSecret', 'erp-saas-default-secret-change-me'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token invalido');
    }

    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      empresaId: payload.empresaId,
      filialId: payload.filialId,
      roles: payload.roles,
      perfil: payload.perfil,
    };
  }
}
