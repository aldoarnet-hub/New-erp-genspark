import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadeMedida } from '../entities/unidade-medida.entity';
import {
  Categoria, Marca, Fabricante, TabelaPreco, FormaPagamento,
  CondicaoPagamento, CondicaoPagamentoParcela, Banco, ContaBancaria,
  CentroCusto, PlanoConta,
} from '../entities/auxiliares.entity';
import {
  CriarCategoriaDto, CriarMarcaDto, CriarFabricanteDto, CriarUnidadeDto,
  CriarTabelaPrecoDto, CriarFormaPagamentoDto, CriarCondicaoPagamentoDto,
  CriarBancoDto, CriarContaBancariaDto, CriarCentroCustoDto, CriarPlanoContaDto,
} from '../dto/cadastros.dto';

@Injectable()
export class AuxiliaresService {
  constructor(
    @InjectRepository(UnidadeMedida) private readonly unidadeRepo: Repository<UnidadeMedida>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Marca) private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(Fabricante) private readonly fabricanteRepo: Repository<Fabricante>,
    @InjectRepository(TabelaPreco) private readonly tabelaPrecoRepo: Repository<TabelaPreco>,
    @InjectRepository(FormaPagamento) private readonly formaPgtoRepo: Repository<FormaPagamento>,
    @InjectRepository(CondicaoPagamento) private readonly condPgtoRepo: Repository<CondicaoPagamento>,
    @InjectRepository(CondicaoPagamentoParcela) private readonly parcelaRepo: Repository<CondicaoPagamentoParcela>,
    @InjectRepository(Banco) private readonly bancoRepo: Repository<Banco>,
    @InjectRepository(ContaBancaria) private readonly contaRepo: Repository<ContaBancaria>,
    @InjectRepository(CentroCusto) private readonly ccRepo: Repository<CentroCusto>,
    @InjectRepository(PlanoConta) private readonly planoRepo: Repository<PlanoConta>,
  ) {}

  // ======================== Unidades ========================
  async listarUnidades(tenantId: string) { return this.unidadeRepo.find({ where: { tenantId }, order: { codigo: 'ASC' } }); }
  async criarUnidade(tenantId: string, dto: CriarUnidadeDto) {
    return this.unidadeRepo.save(this.unidadeRepo.create({ ...dto, tenantId }));
  }
  async atualizarUnidade(tenantId: string, id: string, dto: Partial<CriarUnidadeDto>) {
    const u = await this.unidadeRepo.findOne({ where: { id, tenantId } });
    if (!u) throw new NotFoundException('Unidade nao encontrada');
    Object.assign(u, dto);
    return this.unidadeRepo.save(u);
  }

  // ======================== Categorias ========================
  async listarCategorias(tenantId: string) { return this.categoriaRepo.find({ where: { tenantId }, order: { descricao: 'ASC' } }); }
  async criarCategoria(tenantId: string, dto: CriarCategoriaDto) {
    return this.categoriaRepo.save(this.categoriaRepo.create({ ...dto, tenantId }));
  }
  async atualizarCategoria(tenantId: string, id: string, dto: Partial<CriarCategoriaDto>) {
    const c = await this.categoriaRepo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Categoria nao encontrada');
    Object.assign(c, dto);
    return this.categoriaRepo.save(c);
  }

  // ======================== Marcas ========================
  async listarMarcas(tenantId: string) { return this.marcaRepo.find({ where: { tenantId }, order: { nome: 'ASC' } }); }
  async criarMarca(tenantId: string, dto: CriarMarcaDto) {
    return this.marcaRepo.save(this.marcaRepo.create({ ...dto, tenantId }));
  }
  async atualizarMarca(tenantId: string, id: string, dto: Partial<CriarMarcaDto>) {
    const m = await this.marcaRepo.findOne({ where: { id, tenantId } });
    if (!m) throw new NotFoundException('Marca nao encontrada');
    Object.assign(m, dto);
    return this.marcaRepo.save(m);
  }

  // ======================== Fabricantes ========================
  async listarFabricantes(tenantId: string) { return this.fabricanteRepo.find({ where: { tenantId }, order: { nome: 'ASC' } }); }
  async criarFabricante(tenantId: string, dto: CriarFabricanteDto) {
    return this.fabricanteRepo.save(this.fabricanteRepo.create({ ...dto, tenantId }));
  }

  // ======================== Tabelas de Preco ========================
  async listarTabelasPreco(tenantId: string) { return this.tabelaPrecoRepo.find({ where: { tenantId }, order: { descricao: 'ASC' } }); }
  async criarTabelaPreco(tenantId: string, dto: CriarTabelaPrecoDto) {
    return this.tabelaPrecoRepo.save(this.tabelaPrecoRepo.create({ ...dto, tenantId }));
  }
  async atualizarTabelaPreco(tenantId: string, id: string, dto: Partial<CriarTabelaPrecoDto>) {
    const t = await this.tabelaPrecoRepo.findOne({ where: { id, tenantId } });
    if (!t) throw new NotFoundException('Tabela de preco nao encontrada');
    Object.assign(t, dto);
    return this.tabelaPrecoRepo.save(t);
  }

  // ======================== Formas de Pagamento ========================
  async listarFormasPagamento(tenantId: string) { return this.formaPgtoRepo.find({ where: { tenantId }, order: { descricao: 'ASC' } }); }
  async criarFormaPagamento(tenantId: string, dto: CriarFormaPagamentoDto) {
    return this.formaPgtoRepo.save(this.formaPgtoRepo.create({ ...dto, tenantId }));
  }

  // ======================== Condicoes de Pagamento ========================
  async listarCondicoesPagamento(tenantId: string) { return this.condPgtoRepo.find({ where: { tenantId }, order: { descricao: 'ASC' } }); }
  async criarCondicaoPagamento(tenantId: string, dto: CriarCondicaoPagamentoDto) {
    return this.condPgtoRepo.save(this.condPgtoRepo.create({ ...dto, tenantId }));
  }

  // ======================== Bancos ========================
  async listarBancos(tenantId: string) { return this.bancoRepo.find({ where: { tenantId }, order: { nome: 'ASC' } }); }
  async criarBanco(tenantId: string, dto: CriarBancoDto) {
    return this.bancoRepo.save(this.bancoRepo.create({ ...dto, tenantId }));
  }

  // ======================== Contas Bancarias ========================
  async listarContasBancarias(tenantId: string) { return this.contaRepo.find({ where: { tenantId }, order: { descricao: 'ASC' } }); }
  async criarContaBancaria(tenantId: string, dto: CriarContaBancariaDto) {
    return this.contaRepo.save(this.contaRepo.create({ ...dto, tenantId }));
  }
  async atualizarContaBancaria(tenantId: string, id: string, dto: Partial<CriarContaBancariaDto>) {
    const c = await this.contaRepo.findOne({ where: { id, tenantId } });
    if (!c) throw new NotFoundException('Conta bancaria nao encontrada');
    Object.assign(c, dto);
    return this.contaRepo.save(c);
  }

  // ======================== Centros de Custo ========================
  async listarCentrosCusto(tenantId: string) { return this.ccRepo.find({ where: { tenantId }, order: { codigo: 'ASC' } }); }
  async criarCentroCusto(tenantId: string, dto: CriarCentroCustoDto) {
    return this.ccRepo.save(this.ccRepo.create({ ...dto, tenantId }));
  }

  // ======================== Plano de Contas ========================
  async listarPlanoContas(tenantId: string) { return this.planoRepo.find({ where: { tenantId }, order: { codigo: 'ASC' } }); }
  async criarPlanoConta(tenantId: string, dto: CriarPlanoContaDto) {
    return this.planoRepo.save(this.planoRepo.create({ ...dto, tenantId }));
  }

  // ======================== Estatisticas Gerais ========================
  async getEstatisticasGerais(tenantId: string) {
    const [unidades, categorias, marcas, fabricantes, tabelasPreco, formasPgto, condicoesPgto, bancos, contas, cc, pc] = await Promise.all([
      this.unidadeRepo.count({ where: { tenantId } }),
      this.categoriaRepo.count({ where: { tenantId } }),
      this.marcaRepo.count({ where: { tenantId } }),
      this.fabricanteRepo.count({ where: { tenantId } }),
      this.tabelaPrecoRepo.count({ where: { tenantId } }),
      this.formaPgtoRepo.count({ where: { tenantId } }),
      this.condPgtoRepo.count({ where: { tenantId } }),
      this.bancoRepo.count({ where: { tenantId } }),
      this.contaRepo.count({ where: { tenantId } }),
      this.ccRepo.count({ where: { tenantId } }),
      this.planoRepo.count({ where: { tenantId } }),
    ]);
    return { unidades, categorias, marcas, fabricantes, tabelasPreco, formasPagamento: formasPgto, condicoesPagamento: condicoesPgto, bancos, contasBancarias: contas, centrosCusto: cc, planoContas: pc };
  }

  // ======================== Consulta CEP ========================
  async consultarCEP(cep: string) {
    const { consultarCEP } = await import('../dto/validadores');
    const endereco = await consultarCEP(cep);
    if (!endereco) throw new NotFoundException('CEP nao encontrado');
    return {
      cep: endereco.cep,
      endereco: endereco.logradouro,
      complemento: endereco.complemento,
      bairro: endereco.bairro,
      cidade: endereco.localidade,
      uf: endereco.uf,
      codigoIbge: endereco.ibge,
    };
  }
}
