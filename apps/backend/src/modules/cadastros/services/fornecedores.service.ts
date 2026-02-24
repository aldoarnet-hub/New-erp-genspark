import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor, FornecedorAvaliacao, Transportadora, Vendedor, VendedorCarteira } from '../entities/fornecedor.entity';
import {
  CriarFornecedorDto, AtualizarFornecedorDto, FornecedorAvaliacaoDto,
  CriarTransportadoraDto, AtualizarTransportadoraDto,
  CriarVendedorDto, AtualizarVendedorDto, VendedorCarteiraDto,
  FiltroListagemDto,
} from '../dto/cadastros.dto';
import { validarCpfCnpj, limparDocumento } from '../dto/validadores';
import { AuditoriaService } from './auditoria.service';

@Injectable()
export class FornecedoresService {
  private readonly logger = new Logger(FornecedoresService.name);

  constructor(
    @InjectRepository(Fornecedor) private readonly fornecedorRepo: Repository<Fornecedor>,
    @InjectRepository(FornecedorAvaliacao) private readonly avaliacaoRepo: Repository<FornecedorAvaliacao>,
    @InjectRepository(Transportadora) private readonly transportadoraRepo: Repository<Transportadora>,
    @InjectRepository(Vendedor) private readonly vendedorRepo: Repository<Vendedor>,
    @InjectRepository(VendedorCarteira) private readonly carteiraRepo: Repository<VendedorCarteira>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ======================== Fornecedores ========================
  async listarFornecedores(tenantId: string, filtro: FiltroListagemDto) {
    const page = filtro.page || 1;
    const limit = filtro.limit || 20;
    const qb = this.fornecedorRepo.createQueryBuilder('f')
      .where('f.tenantId = :tenantId', { tenantId });

    if (filtro.status) qb.andWhere('f.status = :status', { status: filtro.status });
    if (filtro.uf) qb.andWhere('f.uf = :uf', { uf: filtro.uf });
    if (filtro.fornecedorAprovado !== undefined) {
      qb.andWhere('f.fornecedorAprovado = :aprovado', { aprovado: filtro.fornecedorAprovado === 'true' });
    }
    if (filtro.search) {
      qb.andWhere(
        '(f.razaoSocial ILIKE :s OR f.nomeFantasia ILIKE :s OR f.cpfCnpj ILIKE :s OR f.codigoInterno ILIKE :s)',
        { s: `%${filtro.search}%` },
      );
    }

    qb.orderBy('f.razaoSocial', 'ASC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarFornecedor(tenantId: string, id: string) {
    const f = await this.fornecedorRepo.findOne({ where: { id, tenantId } });
    if (!f) throw new NotFoundException('Fornecedor nao encontrado');
    return f;
  }

  async buscarFornecedorCompleto(tenantId: string, id: string) {
    const fornecedor = await this.buscarFornecedor(tenantId, id);
    const avaliacoes = await this.avaliacaoRepo.find({ where: { tenantId, fornecedorId: id }, order: { dataAvaliacao: 'DESC' }, take: 10 });
    return { ...fornecedor, avaliacoes };
  }

  async criarFornecedor(tenantId: string, dto: CriarFornecedorDto, userId?: string) {
    if (!validarCpfCnpj(dto.cpfCnpj)) throw new BadRequestException('CPF/CNPJ invalido');
    const cpfCnpjLimpo = limparDocumento(dto.cpfCnpj);

    const existe = await this.fornecedorRepo.findOne({ where: { tenantId, cpfCnpjLimpo } });
    if (existe) throw new BadRequestException('CPF/CNPJ ja cadastrado');

    const existeCodigo = await this.fornecedorRepo.findOne({ where: { tenantId, codigoInterno: dto.codigoInterno } });
    if (existeCodigo) throw new BadRequestException('Codigo interno ja existe');

    const f = this.fornecedorRepo.create({ ...dto, tenantId, cpfCnpjLimpo, criadoPor: userId });
    const saved = await this.fornecedorRepo.save(f);

    await this.auditoriaService.registrar(tenantId, 'fornecedores', saved.id, 'INSERT', null, saved, userId);
    this.logger.log(`Fornecedor criado: ${saved.codigoInterno} - ${saved.razaoSocial}`);
    return saved;
  }

  async atualizarFornecedor(tenantId: string, id: string, dto: AtualizarFornecedorDto, userId?: string) {
    const f = await this.buscarFornecedor(tenantId, id);
    const anterior = { ...f };
    Object.assign(f, dto, { atualizadoPor: userId });
    const saved = await this.fornecedorRepo.save(f);
    await this.auditoriaService.registrar(tenantId, 'fornecedores', id, 'UPDATE', anterior, saved, userId);
    return saved;
  }

  async inativarFornecedor(tenantId: string, id: string, userId?: string) {
    const f = await this.buscarFornecedor(tenantId, id);
    const anterior = { ...f };
    f.status = 'INATIVO';
    const saved = await this.fornecedorRepo.save(f);
    await this.auditoriaService.registrar(tenantId, 'fornecedores', id, 'UPDATE', anterior, saved, userId);
    return saved;
  }

  // Avaliacoes
  async criarAvaliacao(tenantId: string, fornecedorId: string, dto: FornecedorAvaliacaoDto, userId?: string) {
    const notaGeral = +((dto.qualidadeNota + dto.prazoNota + dto.precoNota + dto.atendimentoNota) / 4).toFixed(2);
    const av = this.avaliacaoRepo.create({ ...dto, tenantId, fornecedorId, notaGeral, avaliadoPor: userId });
    const saved = await this.avaliacaoRepo.save(av);

    // Atualizar rating do fornecedor
    await this.fornecedorRepo.update({ id: fornecedorId, tenantId }, {
      rating: notaGeral, qualidadeNota: dto.qualidadeNota, prazoNota: dto.prazoNota,
      precoNota: dto.precoNota, atendimentoNota: dto.atendimentoNota,
    });
    return saved;
  }

  async listarAvaliacoes(tenantId: string, fornecedorId: string) {
    return this.avaliacaoRepo.find({ where: { tenantId, fornecedorId }, order: { dataAvaliacao: 'DESC' } });
  }

  async getEstatisticasFornecedores(tenantId: string) {
    const total = await this.fornecedorRepo.count({ where: { tenantId } });
    const ativos = await this.fornecedorRepo.count({ where: { tenantId, status: 'ATIVO' } });
    const aprovados = await this.fornecedorRepo.count({ where: { tenantId, fornecedorAprovado: true } });
    const comIso = await this.fornecedorRepo.count({ where: { tenantId, certificadoIso: true } });
    return { total, ativos, aprovados, comCertificadoIso: comIso };
  }

  // ======================== Transportadoras ========================
  async listarTransportadoras(tenantId: string, filtro: FiltroListagemDto) {
    const page = filtro.page || 1;
    const limit = filtro.limit || 20;
    const where: any = { tenantId };
    if (filtro.status) where.status = filtro.status;
    if (filtro.search) {
      return this.transportadoraRepo.createQueryBuilder('t')
        .where('t.tenantId = :tenantId', { tenantId })
        .andWhere('(t.razaoSocial ILIKE :s OR t.nomeFantasia ILIKE :s OR t.cnpj ILIKE :s)', { s: `%${filtro.search}%` })
        .orderBy('t.razaoSocial', 'ASC')
        .skip((page - 1) * limit).take(limit)
        .getManyAndCount()
        .then(([data, total]) => ({ data, total, page, limit, pages: Math.ceil(total / limit) }));
    }
    const [data, total] = await this.transportadoraRepo.findAndCount({ where, order: { razaoSocial: 'ASC' }, skip: (page - 1) * limit, take: limit });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarTransportadora(tenantId: string, id: string) {
    const t = await this.transportadoraRepo.findOne({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Transportadora nao encontrada');
    return t;
  }

  async criarTransportadora(tenantId: string, dto: CriarTransportadoraDto) {
    const t = this.transportadoraRepo.create({ ...dto, tenantId });
    return this.transportadoraRepo.save(t);
  }

  async atualizarTransportadora(tenantId: string, id: string, dto: AtualizarTransportadoraDto) {
    const t = await this.buscarTransportadora(tenantId, id);
    Object.assign(t, dto);
    return this.transportadoraRepo.save(t);
  }

  async inativarTransportadora(tenantId: string, id: string) {
    const t = await this.buscarTransportadora(tenantId, id);
    t.status = 'INATIVO';
    return this.transportadoraRepo.save(t);
  }

  // ======================== Vendedores ========================
  async listarVendedores(tenantId: string, filtro: FiltroListagemDto) {
    const page = filtro.page || 1;
    const limit = filtro.limit || 20;
    const where: any = { tenantId };
    if (filtro.status) where.status = filtro.status;
    if (filtro.search) {
      return this.vendedorRepo.createQueryBuilder('v')
        .where('v.tenantId = :tenantId', { tenantId })
        .andWhere('(v.nomeCompleto ILIKE :s OR v.codigoInterno ILIKE :s OR v.email ILIKE :s)', { s: `%${filtro.search}%` })
        .orderBy('v.nomeCompleto', 'ASC')
        .skip((page - 1) * limit).take(limit)
        .getManyAndCount()
        .then(([data, total]) => ({ data, total, page, limit, pages: Math.ceil(total / limit) }));
    }
    const [data, total] = await this.vendedorRepo.findAndCount({ where, order: { nomeCompleto: 'ASC' }, skip: (page - 1) * limit, take: limit });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarVendedor(tenantId: string, id: string) {
    const v = await this.vendedorRepo.findOne({ where: { id, tenantId } });
    if (!v) throw new NotFoundException('Vendedor nao encontrado');
    return v;
  }

  async criarVendedor(tenantId: string, dto: CriarVendedorDto) {
    const v = this.vendedorRepo.create({ ...dto, tenantId });
    return this.vendedorRepo.save(v);
  }

  async atualizarVendedor(tenantId: string, id: string, dto: AtualizarVendedorDto) {
    const v = await this.buscarVendedor(tenantId, id);
    Object.assign(v, dto);
    return this.vendedorRepo.save(v);
  }

  async inativarVendedor(tenantId: string, id: string) {
    const v = await this.buscarVendedor(tenantId, id);
    v.status = 'INATIVO';
    return this.vendedorRepo.save(v);
  }

  // Carteira
  async listarCarteira(tenantId: string, vendedorId: string) {
    return this.carteiraRepo.find({ where: { tenantId, vendedorId, ativo: true } });
  }

  async adicionarClienteCarteira(tenantId: string, vendedorId: string, dto: VendedorCarteiraDto) {
    const existe = await this.carteiraRepo.findOne({ where: { tenantId, vendedorId, clienteId: dto.clienteId } });
    if (existe) {
      if (!existe.ativo) { existe.ativo = true; return this.carteiraRepo.save(existe); }
      throw new BadRequestException('Cliente ja vinculado ao vendedor');
    }
    const cart = this.carteiraRepo.create({ ...dto, tenantId, vendedorId });
    return this.carteiraRepo.save(cart);
  }

  async removerClienteCarteira(tenantId: string, vendedorId: string, clienteId: string) {
    const cart = await this.carteiraRepo.findOne({ where: { tenantId, vendedorId, clienteId } });
    if (!cart) throw new NotFoundException('Vinculo nao encontrado');
    cart.ativo = false;
    return this.carteiraRepo.save(cart);
  }
}
