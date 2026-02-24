import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente, ClienteEndereco, ClienteContato, ClienteLimite } from '../entities/cliente.entity';
import {
  CriarClienteDto, AtualizarClienteDto, ClienteEnderecoDto,
  ClienteContatoDto, ClienteLimiteDto, FiltroListagemDto,
} from '../dto/cadastros.dto';
import { validarCpfCnpj, limparDocumento, validarEmail, validarTelefone } from '../dto/validadores';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class ClientesService {
  private readonly logger = new Logger(ClientesService.name);

  constructor(
    @InjectRepository(Cliente) private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(ClienteEndereco) private readonly enderecoRepo: Repository<ClienteEndereco>,
    @InjectRepository(ClienteContato) private readonly contatoRepo: Repository<ClienteContato>,
    @InjectRepository(ClienteLimite) private readonly limiteRepo: Repository<ClienteLimite>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ======================== CRUD Cliente ========================
  async listar(tenantId: string, filtro: FiltroListagemDto) {
    const page = filtro.page || 1;
    const limit = filtro.limit || 20;
    const qb = this.clienteRepo.createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId });

    if (filtro.status) qb.andWhere('c.status = :status', { status: filtro.status });
    if (filtro.tipoPessoa) qb.andWhere('c.tipoPessoa = :tipoPessoa', { tipoPessoa: filtro.tipoPessoa });
    if (filtro.tipoCliente) qb.andWhere('c.tipoCliente = :tipoCliente', { tipoCliente: filtro.tipoCliente });
    if (filtro.uf) qb.andWhere('c.uf = :uf', { uf: filtro.uf });
    if (filtro.cidade) qb.andWhere('c.cidade ILIKE :cidade', { cidade: `%${filtro.cidade}%` });
    if (filtro.vendedorId) qb.andWhere('c.vendedorId = :vendedorId', { vendedorId: filtro.vendedorId });
    if (filtro.search) {
      qb.andWhere(
        '(c.nomeCompleto ILIKE :s OR c.razaoSocial ILIKE :s OR c.nomeFantasia ILIKE :s OR c.cpfCnpj ILIKE :s OR c.codigoInterno ILIKE :s OR c.email ILIKE :s)',
        { s: `%${filtro.search}%` },
      );
    }

    const orderBy = filtro.orderBy || 'dataCadastro';
    const orderDir = (filtro.orderDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';
    qb.orderBy(`c.${orderBy}`, orderDir);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarPorId(tenantId: string, id: string) {
    const cliente = await this.clienteRepo.findOne({ where: { id, tenantId } });
    if (!cliente) throw new NotFoundException('Cliente nao encontrado');
    return cliente;
  }

  async buscarCompleto(tenantId: string, id: string) {
    const cliente = await this.buscarPorId(tenantId, id);
    const [enderecos, contatos, limites] = await Promise.all([
      this.enderecoRepo.find({ where: { tenantId, clienteId: id } }),
      this.contatoRepo.find({ where: { tenantId, clienteId: id } }),
      this.limiteRepo.find({ where: { tenantId, clienteId: id }, order: { dataAnalise: 'DESC' } }),
    ]);
    return { ...cliente, enderecos, contatos, historicoLimites: limites };
  }

  async criar(tenantId: string, dto: CriarClienteDto, userId?: string) {
    // Validar CPF/CNPJ
    if (!validarCpfCnpj(dto.cpfCnpj)) {
      throw new BadRequestException('CPF/CNPJ invalido');
    }
    const cpfCnpjLimpo = limparDocumento(dto.cpfCnpj);

    // Validar email
    if (dto.email && !validarEmail(dto.email)) {
      throw new BadRequestException('Email invalido');
    }

    // Validar telefone
    if (dto.telefone && !validarTelefone(dto.telefone)) {
      throw new BadRequestException('Telefone invalido');
    }

    // Verificar duplicidade
    const existe = await this.clienteRepo.findOne({ where: { tenantId, cpfCnpjLimpo } });
    if (existe) throw new BadRequestException('CPF/CNPJ ja cadastrado');

    const existeCodigo = await this.clienteRepo.findOne({ where: { tenantId, codigoInterno: dto.codigoInterno } });
    if (existeCodigo) throw new BadRequestException('Codigo interno ja existe');

    const tipoPessoa = cpfCnpjLimpo.length <= 11 ? 'PF' : 'PJ';
    const limiteDisponivel = dto.limiteCredito || 0;

    const cliente = this.clienteRepo.create({
      ...dto,
      tenantId,
      cpfCnpjLimpo,
      tipoPessoa,
      limiteDisponivel,
      criadoPor: userId,
    });
    const saved = await this.clienteRepo.save(cliente);

    await this.auditoriaService.registrar(tenantId, 'clientes', saved.id, 'INSERT', null, saved, userId);
    this.logger.log(`Cliente criado: ${saved.codigoInterno} - ${saved.razaoSocial || saved.nomeCompleto}`);
    return saved;
  }

  async atualizar(tenantId: string, id: string, dto: AtualizarClienteDto, userId?: string) {
    const cliente = await this.buscarPorId(tenantId, id);
    const anterior = { ...cliente };

    if (dto.email && !validarEmail(dto.email)) {
      throw new BadRequestException('Email invalido');
    }

    Object.assign(cliente, dto, { atualizadoPor: userId });

    // Recalcular limite disponivel
    if (dto.limiteCredito !== undefined) {
      cliente.limiteDisponivel = dto.limiteCredito - cliente.limiteUtilizado;
    }

    const saved = await this.clienteRepo.save(cliente);
    await this.auditoriaService.registrar(tenantId, 'clientes', id, 'UPDATE', anterior, saved, userId);
    return saved;
  }

  async inativar(tenantId: string, id: string, userId?: string) {
    const cliente = await this.buscarPorId(tenantId, id);
    const anterior = { ...cliente };
    cliente.status = 'INATIVO';
    const saved = await this.clienteRepo.save(cliente);
    await this.auditoriaService.registrar(tenantId, 'clientes', id, 'UPDATE', anterior, saved, userId);
    return saved;
  }

  // ======================== Enderecos ========================
  async listarEnderecos(tenantId: string, clienteId: string) {
    return this.enderecoRepo.find({ where: { tenantId, clienteId } });
  }

  async adicionarEndereco(tenantId: string, clienteId: string, dto: ClienteEnderecoDto) {
    const end = this.enderecoRepo.create({ ...dto, tenantId, clienteId });
    return this.enderecoRepo.save(end);
  }

  async atualizarEndereco(tenantId: string, clienteId: string, enderecoId: string, dto: Partial<ClienteEnderecoDto>) {
    const end = await this.enderecoRepo.findOne({ where: { id: enderecoId, tenantId, clienteId } });
    if (!end) throw new NotFoundException('Endereco nao encontrado');
    Object.assign(end, dto);
    return this.enderecoRepo.save(end);
  }

  async removerEndereco(tenantId: string, clienteId: string, enderecoId: string) {
    const end = await this.enderecoRepo.findOne({ where: { id: enderecoId, tenantId, clienteId } });
    if (!end) throw new NotFoundException('Endereco nao encontrado');
    await this.enderecoRepo.remove(end);
    return { message: 'Endereco removido' };
  }

  // ======================== Contatos ========================
  async listarContatos(tenantId: string, clienteId: string) {
    return this.contatoRepo.find({ where: { tenantId, clienteId } });
  }

  async adicionarContato(tenantId: string, clienteId: string, dto: ClienteContatoDto) {
    if (dto.email && !validarEmail(dto.email)) {
      throw new BadRequestException('Email do contato invalido');
    }
    const cont = this.contatoRepo.create({ ...dto, tenantId, clienteId });
    return this.contatoRepo.save(cont);
  }

  async atualizarContato(tenantId: string, clienteId: string, contatoId: string, dto: Partial<ClienteContatoDto>) {
    const cont = await this.contatoRepo.findOne({ where: { id: contatoId, tenantId, clienteId } });
    if (!cont) throw new NotFoundException('Contato nao encontrado');
    Object.assign(cont, dto);
    return this.contatoRepo.save(cont);
  }

  async removerContato(tenantId: string, clienteId: string, contatoId: string) {
    const cont = await this.contatoRepo.findOne({ where: { id: contatoId, tenantId, clienteId } });
    if (!cont) throw new NotFoundException('Contato nao encontrado');
    await this.contatoRepo.remove(cont);
    return { message: 'Contato removido' };
  }

  // ======================== Analise de Credito ========================
  async listarHistoricoLimites(tenantId: string, clienteId: string) {
    return this.limiteRepo.find({ where: { tenantId, clienteId }, order: { dataAnalise: 'DESC' } });
  }

  async registrarAnaliseCredito(tenantId: string, clienteId: string, dto: ClienteLimiteDto, userId?: string) {
    const cliente = await this.buscarPorId(tenantId, clienteId);

    const analise = this.limiteRepo.create({
      ...dto, tenantId, clienteId, aprovadoPor: userId,
    });
    const saved = await this.limiteRepo.save(analise);

    // Atualizar limite do cliente
    cliente.limiteCredito = dto.limiteAprovado;
    cliente.limiteDisponivel = dto.limiteAprovado - cliente.limiteUtilizado;
    await this.clienteRepo.save(cliente);

    return saved;
  }

  // ======================== Estatisticas ========================
  async getEstatisticas(tenantId: string) {
    const total = await this.clienteRepo.count({ where: { tenantId } });
    const ativos = await this.clienteRepo.count({ where: { tenantId, status: 'ATIVO' } });
    const inativos = await this.clienteRepo.count({ where: { tenantId, status: 'INATIVO' } });
    const bloqueados = await this.clienteRepo.count({ where: { tenantId, bloqueado: true } });
    const pf = await this.clienteRepo.count({ where: { tenantId, tipoPessoa: 'PF' } });
    const pj = await this.clienteRepo.count({ where: { tenantId, tipoPessoa: 'PJ' } });

    const totalLimite = await this.clienteRepo.createQueryBuilder('c')
      .select('COALESCE(SUM(c.limiteCredito), 0)', 'totalLimite')
      .addSelect('COALESCE(SUM(c.limiteUtilizado), 0)', 'totalUtilizado')
      .where('c.tenantId = :tenantId', { tenantId })
      .getRawOne();

    return {
      total, ativos, inativos, bloqueados, pf, pj,
      totalLimiteCredito: parseFloat(totalLimite.totalLimite),
      totalLimiteUtilizado: parseFloat(totalLimite.totalUtilizado),
    };
  }
}
