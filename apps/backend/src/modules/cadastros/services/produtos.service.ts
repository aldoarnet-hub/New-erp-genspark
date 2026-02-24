import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Produto, ProdutoPreco, ProdutoFilial, ProdutoComposicao,
  ProdutoSimilar, ProdutoAplicacao, ProdutoMidia,
} from '../entities/produto.entity';
import {
  CriarProdutoDto, AtualizarProdutoDto, ProdutoPrecoDto,
  ProdutoComposicaoDto, ProdutoSimilarDto, ProdutoAplicacaoDto,
  ProdutoMidiaDto, FiltroListagemDto,
} from '../dto/cadastros.dto';
import { AuditoriaService } from './auditoria.service';
import { calcularCubagem } from '../dto/validadores';

@Injectable()
export class ProdutosService {
  private readonly logger = new Logger(ProdutosService.name);

  constructor(
    @InjectRepository(Produto) private readonly produtoRepo: Repository<Produto>,
    @InjectRepository(ProdutoPreco) private readonly precoRepo: Repository<ProdutoPreco>,
    @InjectRepository(ProdutoFilial) private readonly filialRepo: Repository<ProdutoFilial>,
    @InjectRepository(ProdutoComposicao) private readonly composicaoRepo: Repository<ProdutoComposicao>,
    @InjectRepository(ProdutoSimilar) private readonly similarRepo: Repository<ProdutoSimilar>,
    @InjectRepository(ProdutoAplicacao) private readonly aplicacaoRepo: Repository<ProdutoAplicacao>,
    @InjectRepository(ProdutoMidia) private readonly midiaRepo: Repository<ProdutoMidia>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // ======================== CRUD Produto ========================
  async listar(tenantId: string, filtro: FiltroListagemDto) {
    const page = filtro.page || 1;
    const limit = filtro.limit || 20;
    const qb = this.produtoRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId });

    if (filtro.status) qb.andWhere('p.status = :status', { status: filtro.status });
    if (filtro.categoriaId) qb.andWhere('p.categoriaId = :catId', { catId: filtro.categoriaId });
    if (filtro.marcaId) qb.andWhere('p.marcaId = :marcaId', { marcaId: filtro.marcaId });
    if (filtro.tipoProduto) qb.andWhere('p.tipoProduto = :tipo', { tipo: filtro.tipoProduto });
    if (filtro.search) {
      qb.andWhere(
        '(p.descricao ILIKE :s OR p.codigoInterno ILIKE :s OR p.codigoBarras ILIKE :s OR p.ncm ILIKE :s)',
        { s: `%${filtro.search}%` },
      );
    }

    const orderBy = filtro.orderBy || 'descricao';
    const orderDir = (filtro.orderDir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';
    qb.orderBy(`p.${orderBy}`, orderDir);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarPorId(tenantId: string, id: string) {
    const produto = await this.produtoRepo.findOne({ where: { id, tenantId } });
    if (!produto) throw new NotFoundException('Produto nao encontrado');
    return produto;
  }

  async buscarCompleto(tenantId: string, id: string) {
    const produto = await this.buscarPorId(tenantId, id);
    const [precos, estoque, composicao, similares, aplicacoes, midias] = await Promise.all([
      this.precoRepo.find({ where: { tenantId, produtoId: id } }),
      this.filialRepo.find({ where: { tenantId, produtoId: id } }),
      this.composicaoRepo.find({ where: { tenantId, produtoPaiId: id }, order: { ordem: 'ASC' } }),
      this.similarRepo.find({ where: { tenantId, produtoId: id } }),
      this.aplicacaoRepo.find({ where: { tenantId, produtoId: id }, order: { ordem: 'ASC' } }),
      this.midiaRepo.find({ where: { tenantId, produtoId: id }, order: { ordem: 'ASC' } }),
    ]);
    return { ...produto, precos, estoque, composicao, similares, aplicacoes, midias };
  }

  async criar(tenantId: string, dto: CriarProdutoDto, userId?: string) {
    const existe = await this.produtoRepo.findOne({ where: { tenantId, codigoInterno: dto.codigoInterno } });
    if (existe) throw new BadRequestException('Codigo interno ja existe para este tenant');

    if (dto.codigoBarras) {
      const existeEan = await this.produtoRepo.findOne({ where: { tenantId, codigoBarras: dto.codigoBarras } });
      if (existeEan) throw new BadRequestException('Codigo de barras ja cadastrado');
    }

    // Calcula cubagem automaticamente
    const cubagemM3 = (dto.alturaCm && dto.larguraCm && dto.profundidadeCm)
      ? calcularCubagem(dto.alturaCm, dto.larguraCm, dto.profundidadeCm)
      : undefined;

    const produto = this.produtoRepo.create({
      ...dto, tenantId, criadoPor: userId,
      ...(cubagemM3 !== undefined ? { cubagemM3 } : {}),
    });
    const saved = await this.produtoRepo.save(produto);

    await this.auditoriaService.registrar(tenantId, 'produtos', saved.id, 'INSERT', null, saved, userId);
    this.logger.log(`Produto criado: ${saved.codigoInterno} - ${saved.descricao}`);
    return saved;
  }

  async atualizar(tenantId: string, id: string, dto: AtualizarProdutoDto, userId?: string) {
    const anterior = await this.buscarPorId(tenantId, id);
    const dadosAnteriores = { ...anterior };
    Object.assign(anterior, dto, { atualizadoPor: userId });

    // Recalcula cubagem
    if (anterior.alturaCm && anterior.larguraCm && anterior.profundidadeCm) {
      anterior.cubagemM3 = calcularCubagem(anterior.alturaCm, anterior.larguraCm, anterior.profundidadeCm);
    }

    const saved = await this.produtoRepo.save(anterior);
    await this.auditoriaService.registrar(tenantId, 'produtos', id, 'UPDATE', dadosAnteriores, saved, userId);
    return saved;
  }

  async inativar(tenantId: string, id: string, userId?: string) {
    const produto = await this.buscarPorId(tenantId, id);
    const anterior = { ...produto };
    produto.status = 'INATIVO';
    const saved = await this.produtoRepo.save(produto);
    await this.auditoriaService.registrar(tenantId, 'produtos', id, 'UPDATE', anterior, saved, userId);
    return saved;
  }

  // ======================== Precos ========================
  async listarPrecos(tenantId: string, produtoId: string) {
    return this.precoRepo.find({ where: { tenantId, produtoId } });
  }

  async atualizarPreco(tenantId: string, produtoId: string, dto: ProdutoPrecoDto) {
    let preco = await this.precoRepo.findOne({
      where: { tenantId, produtoId, filialId: dto.filialId, tabelaPrecoId: dto.tabelaPrecoId },
    });
    if (preco) {
      Object.assign(preco, dto);
    } else {
      preco = this.precoRepo.create({ ...dto, tenantId, produtoId });
    }
    return this.precoRepo.save(preco);
  }

  async removerPreco(tenantId: string, produtoId: string, precoId: string) {
    const preco = await this.precoRepo.findOne({ where: { id: precoId, tenantId, produtoId } });
    if (!preco) throw new NotFoundException('Preco nao encontrado');
    await this.precoRepo.remove(preco);
    return { message: 'Preco removido' };
  }

  // ======================== Estoque ========================
  async buscarEstoque(tenantId: string, produtoId: string) {
    return this.filialRepo.find({ where: { tenantId, produtoId } });
  }

  // ======================== Composicao ========================
  async listarComposicao(tenantId: string, produtoPaiId: string) {
    return this.composicaoRepo.find({ where: { tenantId, produtoPaiId }, order: { ordem: 'ASC' } });
  }

  async adicionarComponente(tenantId: string, produtoPaiId: string, dto: ProdutoComposicaoDto) {
    if (produtoPaiId === dto.produtoFilhoId) throw new BadRequestException('Produto nao pode ser componente de si mesmo');
    const existe = await this.composicaoRepo.findOne({ where: { tenantId, produtoPaiId, produtoFilhoId: dto.produtoFilhoId } });
    if (existe) throw new BadRequestException('Componente ja existe na composicao');
    const comp = this.composicaoRepo.create({ ...dto, tenantId, produtoPaiId });
    return this.composicaoRepo.save(comp);
  }

  async removerComponente(tenantId: string, produtoPaiId: string, componenteId: string) {
    const comp = await this.composicaoRepo.findOne({ where: { id: componenteId, tenantId, produtoPaiId } });
    if (!comp) throw new NotFoundException('Componente nao encontrado');
    await this.composicaoRepo.remove(comp);
    return { message: 'Componente removido' };
  }

  // ======================== Similares ========================
  async listarSimilares(tenantId: string, produtoId: string) {
    return this.similarRepo.find({ where: { tenantId, produtoId } });
  }

  async adicionarSimilar(tenantId: string, produtoId: string, dto: ProdutoSimilarDto) {
    if (produtoId === dto.produtoSimilarId) throw new BadRequestException('Produto nao pode ser similar a si mesmo');
    const existe = await this.similarRepo.findOne({ where: { tenantId, produtoId, produtoSimilarId: dto.produtoSimilarId } });
    if (existe) throw new BadRequestException('Similar ja cadastrado');
    const sim = this.similarRepo.create({ ...dto, tenantId, produtoId });
    return this.similarRepo.save(sim);
  }

  async removerSimilar(tenantId: string, produtoId: string, similarId: string) {
    const sim = await this.similarRepo.findOne({ where: { id: similarId, tenantId, produtoId } });
    if (!sim) throw new NotFoundException('Similar nao encontrado');
    await this.similarRepo.remove(sim);
    return { message: 'Similar removido' };
  }

  // ======================== Aplicacoes ========================
  async listarAplicacoes(tenantId: string, produtoId: string) {
    return this.aplicacaoRepo.find({ where: { tenantId, produtoId }, order: { ordem: 'ASC' } });
  }

  async adicionarAplicacao(tenantId: string, produtoId: string, dto: ProdutoAplicacaoDto) {
    const app = this.aplicacaoRepo.create({ ...dto, tenantId, produtoId });
    return this.aplicacaoRepo.save(app);
  }

  async removerAplicacao(tenantId: string, produtoId: string, aplicacaoId: string) {
    const app = await this.aplicacaoRepo.findOne({ where: { id: aplicacaoId, tenantId, produtoId } });
    if (!app) throw new NotFoundException('Aplicacao nao encontrada');
    await this.aplicacaoRepo.remove(app);
    return { message: 'Aplicacao removida' };
  }

  // ======================== Midia ========================
  async listarMidias(tenantId: string, produtoId: string) {
    return this.midiaRepo.find({ where: { tenantId, produtoId }, order: { ordem: 'ASC' } });
  }

  async adicionarMidia(tenantId: string, produtoId: string, dto: ProdutoMidiaDto) {
    const midia = this.midiaRepo.create({ ...dto, tenantId, produtoId });
    return this.midiaRepo.save(midia);
  }

  async removerMidia(tenantId: string, produtoId: string, midiaId: string) {
    const m = await this.midiaRepo.findOne({ where: { id: midiaId, tenantId, produtoId } });
    if (!m) throw new NotFoundException('Midia nao encontrada');
    await this.midiaRepo.remove(m);
    return { message: 'Midia removida' };
  }

  // ======================== Estatisticas ========================
  async getEstatisticas(tenantId: string) {
    const total = await this.produtoRepo.count({ where: { tenantId } });
    const ativos = await this.produtoRepo.count({ where: { tenantId, status: 'ATIVO' } });
    const inativos = await this.produtoRepo.count({ where: { tenantId, status: 'INATIVO' } });
    const kits = await this.produtoRepo.count({ where: { tenantId, tipoProduto: 'KIT' } });
    const bloqueadosVenda = await this.produtoRepo.count({ where: { tenantId, bloqueadoVenda: true } });
    const semEstoqueMinimo = await this.produtoRepo.createQueryBuilder('p')
      .where('p.tenantId = :tenantId', { tenantId })
      .andWhere('p.estoqueMinimo > 0')
      .getCount();

    return { total, ativos, inativos, kits, bloqueadosVenda, comEstoqueMinimo: semEstoqueMinimo };
  }
}
