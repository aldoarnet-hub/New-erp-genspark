import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../core/usuario/usuario.service';
import { LoginDto, LoginResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuarioService.findByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    // Verifica se esta bloqueado
    if (usuario.bloqueadoAte && new Date() < usuario.bloqueadoAte) {
      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoAte.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Conta bloqueada. Tente novamente em ${minutosRestantes} minutos.`,
      );
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);
    if (!senhaValida) {
      await this.usuarioService.incrementLoginAttempts(usuario.id);
      throw new UnauthorizedException('Credenciais invalidas');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuario inativo');
    }

    // Atualiza ultimo login
    await this.usuarioService.updateLastLogin(usuario.id);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      tenantId: usuario.tenantId,
      empresaId: usuario.empresaId,
      filialId: usuario.filialId,
      roles: usuario.roles,
      perfil: usuario.perfil,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwtRefreshSecret'),
      expiresIn: this.configService.get('app.jwtRefreshExpiresIn', '7d'),
    });

    this.logger.log(`Login realizado: ${usuario.email} (tenant: ${usuario.tenantId})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        roles: usuario.roles,
        tenantId: usuario.tenantId,
        empresaId: usuario.empresaId,
        filialId: usuario.filialId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwtRefreshSecret'),
      });

      const usuario = await this.usuarioService.findById(payload.sub);

      if (!usuario || !usuario.ativo) {
        throw new UnauthorizedException('Token invalido');
      }

      const newPayload = {
        sub: usuario.id,
        email: usuario.email,
        tenantId: usuario.tenantId,
        empresaId: usuario.empresaId,
        filialId: usuario.filialId,
        roles: usuario.roles,
        perfil: usuario.perfil,
      };

      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Refresh token invalido ou expirado');
    }
  }

  async getProfile(userId: string) {
    const usuario = await this.usuarioService.findById(userId);
    const { senha: _, ...result } = usuario;
    return result;
  }
}
