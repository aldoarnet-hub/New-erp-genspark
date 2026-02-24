import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { CurrentUser } from '@/shared/decorators';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios do tenant' })
  findAll(@CurrentUser('tenantId') tenantId: string): Promise<Usuario[]> {
    return this.usuarioService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuario por ID' })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<Usuario> {
    return this.usuarioService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar usuario' })
  create(
    @Body() data: any,
    @CurrentUser('tenantId') tenantId: string,
  ): Promise<Usuario> {
    return this.usuarioService.create({ ...data, tenantId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Partial<Usuario>,
  ): Promise<Usuario> {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover usuario' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usuarioService.remove(id);
  }
}
