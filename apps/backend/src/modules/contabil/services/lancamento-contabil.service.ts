import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LancamentoContabil,
  PlanoContas,
  MapeamentoOperacaoContabil,
  SaldoContabil,
  ContaBancaria,
} from '../entities/contabil.entities';
import { StatusLancamento, OrigemLancamento } from '../enums/contabil.enums';
import {
  CreateLancamentoDto,
  LancamentoAutomaticoDto,
  EstornarLancamentoDto,
  FiltroLancamentoDto,
  FiltroBalanceteDto,
  FiltroDreDto,
} from '../dto/contabil.dto';

@Injectable()
export class LancamentoContabilService {
  private readonly logger = new Logger(LancamentoContabilService.name);

  constructor(
    @InjectRepository(LancamentoContabil)
    private readonly lancamentoRepo: Repository<LancamentoContabil>,
    @InjectRepository(PlanoContas)
    private readonly planoContasRepo: Repository<PlanoContas>,
    @InjectRepository(MapeamentoOperacaoContabil)
    private readonly mapeamentoRepo: Repository<MapeamentoOperacaoContabil>,
    @InjectRepository(SaldoContabil)
    private readonly saldoRepo: Repository<SaldoContabil>,
    @InjectRepository(ContaBancaria)
    private readonly contaBancariaRepo: Repository<ContaBancaria>,
  ) {}

  // ============================================================
  // LANCAMENTO AUTOMATICO (via mapeamento operacao → contas)
  // ============================================================
  async lancarAutomatico(tenantId: string, dto: LancamentoAutomaticoDto): Promise<LancamentoContabil> {
    this.logger.log(`Lancamento automatico: ${dto.tipoOperacao} - R$ ${dto.valor}`);

    // 1. Buscar mapeamento
    const mapeamento = await this.mapeamentoRepo.findOne({
      where: { tenantId, tipoOperacao: dto.tipoOperacao, ativo: true },
    });
    if (!mapeamento) {
      throw new NotFoundException(`Mapeamento para operacao ${dto.tipoOperacao} nao encontrado. Inicialize os mapeamentos primeiro.`);
    }

    // 2. Resolver conta bancaria se necessario (1.1.02.XXX)
    let contaDebito = mapeamento.contaDebitoCodigo;
    let contaDebitoDesc = mapeamento.contaDebitoDescricao;
    let contaCredito = mapeamento.contaCreditoCodigo;
    let contaCreditoDesc = mapeamento.contaCreditoDescricao;

    if (dto.contaBancariaId) {
      const contaBancaria = await this.contaBancariaRepo.findOne({
        where: { id: dto.contaBancariaId, tenantId },
      });
      if (contaBancaria) {
        // Substituir a conta bancaria genérica pela especifica
        if (contaDebito.startsWith('1.1.02.')) {
          contaDebito = contaBancaria.contaContabilCodigo;
          contaDebitoDesc = contaBancaria.nome;
        }
        if (contaCredito.startsWith('1.1.02.')) {
          contaCredito = contaBancaria.contaContabilCodigo;
          contaCreditoDesc = contaBancaria.nome;
        }
      }
    }

    // 3. Montar historico
    const historico = this.montarHistorico(mapeamento.historicoTemplate, {
      valor: this.formatarValor(dto.valor),
      documento: dto.numeroDocumentoExterno || dto.documentoOrigemId || '-',
      data: new Date().toLocaleDateString('pt-BR'),
      ...dto.dadosHistorico,
    });

    // 4. Gerar numero sequencial
    const numero = await this.proximoNumero(tenantId);

    // 5. Criar lancamento
    const agora = new Date();
    const lancamento = this.lancamentoRepo.create({
      tenantId,
      numero,
      dataLancamento: agora,
      tipoOperacao: dto.tipoOperacao,
      contaDebitoCodigo: contaDebito,
      contaDebitoDescricao: contaDebitoDesc,
      contaCreditoCodigo: contaCredito,
      contaCreditoDescricao: contaCreditoDesc,
      valor: dto.valor,
      historico,
      documentoOrigem: dto.documentoOrigem || null,
      documentoOrigemId: dto.documentoOrigemId || null,
      numeroDocumentoExterno: dto.numeroDocumentoExterno || null,
      status: StatusLancamento.CONFIRMADO,
      origem: OrigemLancamento.AUTOMATICO,
      competenciaAno: agora.getFullYear(),
      competenciaMes: agora.getMonth() + 1,
    });

    const salvo = await this.lancamentoRepo.save(lancamento);

    // 6. Atualizar saldos
    await this.atualizarSaldo(tenantId, contaDebito, contaDebitoDesc, agora, dto.valor, 'debito');
    await this.atualizarSaldo(tenantId, contaCredito, contaCreditoDesc, agora, dto.valor, 'credito');

    this.logger.log(`Lancamento #${numero} criado: D ${contaDebito} / C ${contaCredito} = R$ ${dto.valor}`);
    return salvo;
  }

  // ============================================================
  // LANCAMENTO MANUAL
  // ============================================================
  async lancarManual(tenantId: string, dto: CreateLancamentoDto, usuarioId?: string): Promise<LancamentoContabil> {
    this.logger.log(`Lancamento manual: D ${dto.contaDebitoCodigo} / C ${dto.contaCreditoCodigo}`);

    // Validar contas
    const contaDebito = await this.validarContaAnalitica(tenantId, dto.contaDebitoCodigo);
    const contaCredito = await this.validarContaAnalitica(tenantId, dto.contaCreditoCodigo);

    if (dto.valor <= 0) {
      throw new BadRequestException('Valor deve ser maior que zero');
    }

    const numero = await this.proximoNumero(tenantId);
    const dataLanc = new Date(dto.dataLancamento);

    const lancamento = this.lancamentoRepo.create({
      tenantId,
      numero,
      dataLancamento: dataLanc,
      tipoOperacao: dto.tipoOperacao,
      contaDebitoCodigo: contaDebito.codigo,
      contaDebitoDescricao: contaDebito.descricao,
      contaCreditoCodigo: contaCredito.codigo,
      contaCreditoDescricao: contaCredito.descricao,
      valor: dto.valor,
      historico: dto.historico,
      documentoOrigem: dto.documentoOrigem || null,
      documentoOrigemId: dto.documentoOrigemId || null,
      numeroDocumentoExterno: dto.numeroDocumentoExterno || null,
      status: StatusLancamento.CONFIRMADO,
      origem: OrigemLancamento.MANUAL,
      centroCustoId: dto.centroCustoId || null,
      competenciaAno: dto.competenciaAno || dataLanc.getFullYear(),
      competenciaMes: dto.competenciaMes || dataLanc.getMonth() + 1,
      usuarioCriacao: usuarioId || null,
    });

    const salvo = await this.lancamentoRepo.save(lancamento);

    await this.atualizarSaldo(tenantId, contaDebito.codigo, contaDebito.descricao, dataLanc, dto.valor, 'debito');
    await this.atualizarSaldo(tenantId, contaCredito.codigo, contaCredito.descricao, dataLanc, dto.valor, 'credito');

    return salvo;
  }

  // ============================================================
  // ESTORNO
  // ============================================================
  async estornarLancamento(tenantId: string, lancamentoId: string, dto: EstornarLancamentoDto): Promise<LancamentoContabil> {
    const original = await this.lancamentoRepo.findOne({
      where: { id: lancamentoId, tenantId },
    });
    if (!original) throw new NotFoundException('Lancamento nao encontrado');
    if (original.status === StatusLancamento.ESTORNADO) {
      throw new BadRequestException('Lancamento ja foi estornado');
    }

    const numero = await this.proximoNumero(tenantId);
    const agora = new Date();

    // Lancamento reverso (debito vira credito e vice-versa)
    const estorno = this.lancamentoRepo.create({
      tenantId,
      numero,
      dataLancamento: agora,
      tipoOperacao: original.tipoOperacao,
      contaDebitoCodigo: original.contaCreditoCodigo,
      contaDebitoDescricao: original.contaCreditoDescricao,
      contaCreditoCodigo: original.contaDebitoCodigo,
      contaCreditoDescricao: original.contaDebitoDescricao,
      valor: original.valor,
      historico: `ESTORNO Lanc #${original.numero} - ${dto.motivo}`,
      documentoOrigem: original.documentoOrigem,
      documentoOrigemId: original.documentoOrigemId,
      status: StatusLancamento.CONFIRMADO,
      origem: OrigemLancamento.ESTORNO,
      estornoLancamentoId: original.id,
      competenciaAno: agora.getFullYear(),
      competenciaMes: agora.getMonth() + 1,
    });

    const estornoSalvo = await this.lancamentoRepo.save(estorno);

    // Marcar original como estornado
    original.status = StatusLancamento.ESTORNADO;
    original.estornoLancamentoId = estornoSalvo.id;
    await this.lancamentoRepo.save(original);

    // Atualizar saldos (reverso)
    await this.atualizarSaldo(tenantId, estorno.contaDebitoCodigo, estorno.contaDebitoDescricao, agora, original.valor, 'debito');
    await this.atualizarSaldo(tenantId, estorno.contaCreditoCodigo, estorno.contaCreditoDescricao, agora, original.valor, 'credito');

    return estornoSalvo;
  }

  // ============================================================
  // CONSULTAS
  // ============================================================
  async listarLancamentos(
    tenantId: string,
    filtros: FiltroLancamentoDto,
  ): Promise<{ data: LancamentoContabil[]; total: number }> {
    const page = filtros.page || 1;
    const limit = Math.min(filtros.limit || 50, 200);

    const qb = this.lancamentoRepo
      .createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId })
      .orderBy('l.dataLancamento', 'DESC')
      .addOrderBy('l.numero', 'DESC');

    if (filtros.dataInicio) qb.andWhere('l.dataLancamento >= :di', { di: filtros.dataInicio });
    if (filtros.dataFim) qb.andWhere('l.dataLancamento <= :df', { df: filtros.dataFim });
    if (filtros.contaCodigo) {
      qb.andWhere('(l.contaDebitoCodigo = :cc OR l.contaCreditoCodigo = :cc)', { cc: filtros.contaCodigo });
    }
    if (filtros.tipoOperacao) qb.andWhere('l.tipoOperacao = :to', { to: filtros.tipoOperacao });
    if (filtros.status) qb.andWhere('l.status = :st', { st: filtros.status });
    if (filtros.documentoOrigem) qb.andWhere('l.documentoOrigem = :do', { do: filtros.documentoOrigem });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async buscarLancamento(tenantId: string, id: string): Promise<LancamentoContabil> {
    const lanc = await this.lancamentoRepo.findOne({ where: { id, tenantId } });
    if (!lanc) throw new NotFoundException('Lancamento nao encontrado');
    return lanc;
  }

  async extratoConta(
    tenantId: string,
    contaCodigo: string,
    dataInicio: string,
    dataFim: string,
  ): Promise<{ conta: string; lancamentos: LancamentoContabil[]; saldoPeriodo: { debitos: number; creditos: number; saldo: number } }> {
    const lancamentos = await this.lancamentoRepo
      .createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId })
      .andWhere('(l.contaDebitoCodigo = :cc OR l.contaCreditoCodigo = :cc)', { cc: contaCodigo })
      .andWhere('l.dataLancamento >= :di', { di: dataInicio })
      .andWhere('l.dataLancamento <= :df', { df: dataFim })
      .andWhere('l.status = :st', { st: StatusLancamento.CONFIRMADO })
      .orderBy('l.dataLancamento', 'ASC')
      .addOrderBy('l.numero', 'ASC')
      .getMany();

    let debitos = 0;
    let creditos = 0;
    for (const l of lancamentos) {
      if (l.contaDebitoCodigo === contaCodigo) debitos += Number(l.valor);
      if (l.contaCreditoCodigo === contaCodigo) creditos += Number(l.valor);
    }

    return {
      conta: contaCodigo,
      lancamentos,
      saldoPeriodo: {
        debitos: this.round2(debitos),
        creditos: this.round2(creditos),
        saldo: this.round2(debitos - creditos),
      },
    };
  }

  // ============================================================
  // BALANCETE
  // ============================================================
  async gerarBalancete(tenantId: string, filtro: FiltroBalanceteDto): Promise<SaldoContabil[]> {
    const qb = this.saldoRepo
      .createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId })
      .andWhere('s.competenciaAno = :ano', { ano: filtro.ano })
      .andWhere('s.competenciaMes = :mes', { mes: filtro.mes })
      .orderBy('s.contaCodigo', 'ASC');

    if (filtro.tipoConta) qb.andWhere('s.tipoConta = :tc', { tc: filtro.tipoConta });

    return qb.getMany();
  }

  // ============================================================
  // DRE
  // ============================================================
  async gerarDre(tenantId: string, filtro: FiltroDreDto): Promise<any> {
    const lancamentos = await this.lancamentoRepo
      .createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId })
      .andWhere('l.competenciaAno = :ano', { ano: filtro.ano })
      .andWhere('l.competenciaMes >= :mi', { mi: filtro.mesInicio })
      .andWhere('l.competenciaMes <= :mf', { mf: filtro.mesFim })
      .andWhere('l.status = :st', { st: StatusLancamento.CONFIRMADO })
      .getMany();

    // Acumular por grupo de contas
    const acumulador: Record<string, number> = {};
    for (const l of lancamentos) {
      // Creditos em contas de receita = receita
      if (l.contaCreditoCodigo.startsWith('3.')) {
        const grupo = l.contaCreditoCodigo.substring(0, 6);
        acumulador[grupo] = (acumulador[grupo] || 0) + Number(l.valor);
      }
      // Debitos em contas de receita (deducoes) = deducao
      if (l.contaDebitoCodigo.startsWith('3.1.02') || l.contaDebitoCodigo.startsWith('3.2')) {
        const grupo = l.contaDebitoCodigo.substring(0, 6);
        acumulador[grupo] = (acumulador[grupo] || 0) - Number(l.valor);
      }
      // Debitos em contas de despesa = despesa
      if (l.contaDebitoCodigo.startsWith('4.') || l.contaDebitoCodigo.startsWith('5.')) {
        const grupo = l.contaDebitoCodigo.substring(0, 6);
        acumulador[grupo] = (acumulador[grupo] || 0) + Number(l.valor);
      }
    }

    const receitaBruta = this.somarGrupo(acumulador, '3.1.01');
    const deducoes = Math.abs(this.somarGrupo(acumulador, '3.1.02'));
    const receitaLiquida = receitaBruta - deducoes;
    const cmv = this.somarGrupo(acumulador, '3.2.01');
    const lucroBruto = receitaLiquida - cmv;
    const despesasPessoal = this.somarGrupo(acumulador, '5.1.01');
    const despesasOperacionais = this.somarGrupo(acumulador, '5.2.01') + this.somarGrupo(acumulador, '5.2.02') + this.somarGrupo(acumulador, '5.2.03');
    const despesasFinanceiras = this.somarGrupo(acumulador, '5.3.01') + this.somarGrupo(acumulador, '5.3.02') + this.somarGrupo(acumulador, '5.3.03') + this.somarGrupo(acumulador, '5.3.04');
    const receitasFinanceiras = this.somarGrupo(acumulador, '3.4.01') + this.somarGrupo(acumulador, '3.4.02');
    const despesasTributarias = this.somarGrupo(acumulador, '5.4.01');
    const totalDespesas = despesasPessoal + despesasOperacionais + despesasFinanceiras + despesasTributarias;
    const resultadoOperacional = lucroBruto - totalDespesas + receitasFinanceiras;

    return {
      periodo: { ano: filtro.ano, mesInicio: filtro.mesInicio, mesFim: filtro.mesFim },
      dre: {
        receitaBrutaVendas: this.round2(receitaBruta),
        deducoesVendas: this.round2(deducoes),
        receitaLiquida: this.round2(receitaLiquida),
        custoMercadoriasVendidas: this.round2(cmv),
        lucroBruto: this.round2(lucroBruto),
        despesasPessoal: this.round2(despesasPessoal),
        despesasOperacionais: this.round2(despesasOperacionais),
        despesasFinanceiras: this.round2(despesasFinanceiras),
        receitasFinanceiras: this.round2(receitasFinanceiras),
        despesasTributarias: this.round2(despesasTributarias),
        totalDespesas: this.round2(totalDespesas),
        resultadoOperacional: this.round2(resultadoOperacional),
      },
      detalhamento: acumulador,
    };
  }

  // ============================================================
  // ESTATISTICAS
  // ============================================================
  async obterEstatisticas(tenantId: string): Promise<any> {
    const total = await this.lancamentoRepo.count({ where: { tenantId } });
    const confirmados = await this.lancamentoRepo.count({
      where: { tenantId, status: StatusLancamento.CONFIRMADO },
    });
    const estornados = await this.lancamentoRepo.count({
      where: { tenantId, status: StatusLancamento.ESTORNADO },
    });

    const agora = new Date();
    const mesAtual = await this.lancamentoRepo.count({
      where: { tenantId, competenciaAno: agora.getFullYear(), competenciaMes: agora.getMonth() + 1 },
    });

    return {
      total,
      confirmados,
      estornados,
      mesAtual,
      ultimaAtualizacao: agora.toISOString(),
    };
  }

  // ============================================================
  // HELPERS PRIVADOS
  // ============================================================

  private async proximoNumero(tenantId: string): Promise<number> {
    const ultimo = await this.lancamentoRepo
      .createQueryBuilder('l')
      .where('l.tenantId = :tenantId', { tenantId })
      .orderBy('l.numero', 'DESC')
      .getOne();
    return (ultimo?.numero || 0) + 1;
  }

  private async validarContaAnalitica(tenantId: string, codigo: string): Promise<PlanoContas> {
    const conta = await this.planoContasRepo.findOne({
      where: { tenantId, codigo, ativo: true },
    });
    if (!conta) throw new NotFoundException(`Conta ${codigo} nao encontrada`);
    if (!conta.aceitaLancamento) {
      throw new BadRequestException(`Conta ${codigo} e sintetica, nao aceita lancamentos`);
    }
    return conta;
  }

  private async atualizarSaldo(
    tenantId: string,
    contaCodigo: string,
    contaDescricao: string,
    data: Date,
    valor: number,
    tipo: 'debito' | 'credito',
  ): Promise<void> {
    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;

    let saldo = await this.saldoRepo.findOne({
      where: { tenantId, contaCodigo, competenciaAno: ano, competenciaMes: mes },
    });

    if (!saldo) {
      // Buscar conta para determinar tipo e natureza
      const conta = await this.planoContasRepo.findOne({ where: { tenantId, codigo: contaCodigo } });

      saldo = this.saldoRepo.create({
        tenantId,
        contaCodigo,
        contaDescricao,
        tipoConta: conta?.tipoConta || 'ATIVO',
        natureza: conta?.natureza || 'DEVEDORA',
        competenciaAno: ano,
        competenciaMes: mes,
        saldoAnterior: 0,
        totalDebitos: 0,
        totalCreditos: 0,
        saldoAtual: 0,
      });
    }

    if (tipo === 'debito') {
      saldo.totalDebitos = this.round2(Number(saldo.totalDebitos) + valor);
    } else {
      saldo.totalCreditos = this.round2(Number(saldo.totalCreditos) + valor);
    }

    saldo.saldoAtual = this.round2(
      Number(saldo.saldoAnterior) + Number(saldo.totalDebitos) - Number(saldo.totalCreditos),
    );

    await this.saldoRepo.save(saldo);
  }

  private montarHistorico(template: string, variaveis: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variaveis)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  private formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private somarGrupo(acumulador: Record<string, number>, prefixo: string): number {
    let soma = 0;
    for (const [key, val] of Object.entries(acumulador)) {
      if (key.startsWith(prefixo)) soma += val;
    }
    return soma;
  }

  private round2(val: number): number {
    return Math.round(val * 100) / 100;
  }
}
