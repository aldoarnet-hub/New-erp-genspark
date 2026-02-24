import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/shared/types';
import { ClientesService } from '../services/clientes.service';
import {
  CriarClienteDto, AtualizarClienteDto, ClienteEnderecoDto,
  ClienteContatoDto, ClienteLimiteDto, FiltroListagemDto,
} from '../dto/cadastros.dto';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes com filtros e paginacao' })
  async listar(@Req() req: RequestWithUser, @Query() filtro: FiltroListagemDto) {
    return this.service.listar(req.user.tenantId, filtro);
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Estatisticas de clientes' })
  async estatisticas(@Req() req: RequestWithUser) {
    return this.service.getEstatisticas(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  async buscar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarPorId(req.user.tenantId, id);
  }

  @Get(':id/completo')
  @ApiOperation({ summary: 'Buscar cliente com enderecos, contatos e historico de limites' })
  async buscarCompleto(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.buscarCompleto(req.user.tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar cliente' })
  async criar(@Req() req: RequestWithUser, @Body() dto: CriarClienteDto) {
    return this.service.criar(req.user.tenantId, dto, req.user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  async atualizar(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: AtualizarClienteDto) {
    return this.service.atualizar(req.user.tenantId, id, dto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativar cliente' })
  async inativar(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.inativar(req.user.tenantId, id, req.user.sub);
  }

  // ======================== Enderecos ========================
  @Get(':id/enderecos')
  @ApiOperation({ summary: 'Listar enderecos do cliente' })
  async enderecos(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarEnderecos(req.user.tenantId, id);
  }

  @Post(':id/enderecos')
  @ApiOperation({ summary: 'Adicionar endereco' })
  async addEndereco(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ClienteEnderecoDto) {
    return this.service.adicionarEndereco(req.user.tenantId, id, dto);
  }

  @Put(':id/enderecos/:enderecoId')
  @ApiOperation({ summary: 'Atualizar endereco' })
  async atualizarEndereco(@Req() req: RequestWithUser, @Param('id') id: string, @Param('enderecoId') eId: string, @Body() dto: ClienteEnderecoDto) {
    return this.service.atualizarEndereco(req.user.tenantId, id, eId, dto);
  }

  @Delete(':id/enderecos/:enderecoId')
  @ApiOperation({ summary: 'Remover endereco' })
  async removerEndereco(@Req() req: RequestWithUser, @Param('id') id: string, @Param('enderecoId') eId: string) {
    return this.service.removerEndereco(req.user.tenantId, id, eId);
  }

  // ======================== Contatos ========================
  @Get(':id/contatos')
  @ApiOperation({ summary: 'Listar contatos do cliente' })
  async contatos(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarContatos(req.user.tenantId, id);
  }

  @Post(':id/contatos')
  @ApiOperation({ summary: 'Adicionar contato' })
  async addContato(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ClienteContatoDto) {
    return this.service.adicionarContato(req.user.tenantId, id, dto);
  }

  @Put(':id/contatos/:contatoId')
  @ApiOperation({ summary: 'Atualizar contato' })
  async atualizarContato(@Req() req: RequestWithUser, @Param('id') id: string, @Param('contatoId') cId: string, @Body() dto: ClienteContatoDto) {
    return this.service.atualizarContato(req.user.tenantId, id, cId, dto);
  }

  @Delete(':id/contatos/:contatoId')
  @ApiOperation({ summary: 'Remover contato' })
  async removerContato(@Req() req: RequestWithUser, @Param('id') id: string, @Param('contatoId') cId: string) {
    return this.service.removerContato(req.user.tenantId, id, cId);
  }

  // ======================== Analise de Credito ========================
  @Get(':id/limites')
  @ApiOperation({ summary: 'Historico de analises de credito' })
  async limites(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.listarHistoricoLimites(req.user.tenantId, id);
  }

  @Post(':id/limites')
  @ApiOperation({ summary: 'Registrar analise de credito' })
  async addLimite(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: ClienteLimiteDto) {
    return this.service.registrarAnaliseCredito(req.user.tenantId, id, dto, req.user.sub);
  }
}
