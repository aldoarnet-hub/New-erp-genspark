import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@erp.com' })
  @IsEmail({}, { message: 'Email invalido' })
  @IsNotEmpty({ message: 'Email e obrigatorio' })
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty({ message: 'Senha e obrigatoria' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres' })
  senha: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Refresh token e obrigatorio' })
  refreshToken: string;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  user: {
    id: string;
    nome: string;
    email: string;
    perfil: string;
    roles: string[];
    tenantId: string;
    empresaId: string;
    filialId: string;
  };
}
