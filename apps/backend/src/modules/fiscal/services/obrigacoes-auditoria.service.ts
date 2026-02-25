import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObrigacaoFiscal, CalendarioFiscal, AuditoriaFiscal } from '../entities/fiscal-complementar.entity';
import { NfE } from '../entities/nfe.entity';
import { MotorTributarioService, ItemOperacao, ContextoTributario, ResultadoTributario } from './motor-tributario.service';

// ============================================================
// Servico de Obrigacoes Fiscais e Calendario
// ============================================================

@Injectable()
export class ObrigacaoFiscalService {
  private readonly logger = new Logger(ObrigacaoFiscalService.name);

  constructor(
    @InjectRepository(ObrigacaoFiscal)
    private readonly obrigacaoRepo: Repository<ObrigacaoFiscal>,
    @InjectRepository(CalendarioFiscal)
    private readonly calendarioRepo: Repository<CalendarioFiscal>,
  ) {}

  /**
   * Gera obrigacoes do mes baseado no calendario fiscal
   */
  async gerarObrigacoesMes(
    tenantId: string, empresaId: string, ano: number, mes: number,
  ): Promise<ObrigacaoFiscal[]> {
    const calendarios = await this.calendarioRepo.find({ where: { tenantId, ativo: true } });
    const obrigacoes: ObrigacaoFiscal[] = [];

    for (const cal of calendarios) {
      if (cal.periodicidade === 'anual' && cal.mesVencimento !== mes) continue;

      const dataVencimento = this.calcularDataVencimento(ano, mes, cal.diaVencimento, cal.antecipaFds);

      const existe = await this.obrigacaoRepo.findOne({
        where: { tenantId, empresaId, codigo: cal.codigo, competenciaAno: ano, competenciaMes: mes },
      });

      if (!existe) {
        const obr = this.obrigacaoRepo.create({
          tenantId, empresaId,
          codigo: cal.codigo,
          descricao: cal.descricao,
          tipoObrigacao: cal.tipoObrigacao,
          periodicidade: cal.periodicidade,
          diaVencimento: cal.diaVencimento,
          imposto: cal.imposto,
          codigoReceita: cal.codigoReceita,
          competenciaAno: ano,
          competenciaMes: mes,
          dataVencimento,
          status: 'pendente',
        });
        obrigacoes.push(await this.obrigacaoRepo.save(obr));
      }
    }

    return obrigacoes;
  }

  /**
   * Lista obrigacoes fiscais com filtros
   */
  async listar(tenantId: string, filtros: {
    empresaId?: string; status?: string; imposto?: string;
    competenciaAno?: number; competenciaMes?: number;
    page?: number; limit?: number;
  }): Promise<{ data: ObrigacaoFiscal[]; total: number }> {
    const qb = this.obrigacaoRepo.createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId });

    if (filtros.empresaId) qb.andWhere('o.empresaId = :empresaId', { empresaId: filtros.empresaId });
    if (filtros.status) qb.andWhere('o.status = :status', { status: filtros.status });
    if (filtros.imposto) qb.andWhere('o.imposto = :imposto', { imposto: filtros.imposto });
    if (filtros.competenciaAno) qb.andWhere('o.competenciaAno = :ano', { ano: filtros.competenciaAno });
    if (filtros.competenciaMes) qb.andWhere('o.competenciaMes = :mes', { mes: filtros.competenciaMes });

    qb.orderBy('o.dataVencimento', 'ASC')
      .skip(((filtros.page || 1) - 1) * (filtros.limit || 20))
      .take(Math.min(filtros.limit || 20, 100));

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Atualiza status de uma obrigacao
   */
  async atualizarStatus(
    id: string, tenantId: string, status: string,
    dadosPagamento?: { valorPago?: number; dataPagamento?: Date },
  ): Promise<ObrigacaoFiscal> {
    const obr = await this.obrigacaoRepo.findOne({ where: { id, tenantId } });
    if (!obr) throw new NotFoundException('Obrigacao fiscal nao encontrada');

    obr.status = status;
    if (dadosPagamento?.valorPago) obr.valorPago = dadosPagamento.valorPago;
    if (dadosPagamento?.dataPagamento) obr.dataPagamento = dadosPagamento.dataPagamento;

    return this.obrigacaoRepo.save(obr);
  }

  /**
   * Busca obrigacoes vencidas
   */
  async buscarVencidas(tenantId: string): Promise<ObrigacaoFiscal[]> {
    return this.obrigacaoRepo.createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId })
      .andWhere('o.status IN (:...status)', { status: ['pendente', 'atrasado'] })
      .andWhere('o.dataVencimento < :hoje', { hoje: new Date() })
      .orderBy('o.dataVencimento', 'ASC')
      .getMany();
  }

  /**
   * Busca proximas obrigacoes a vencer (dashboard)
   */
  async buscarProximasVencer(tenantId: string, dias: number = 30): Promise<ObrigacaoFiscal[]> {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    return this.obrigacaoRepo.createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId })
      .andWhere('o.status = :status', { status: 'pendente' })
      .andWhere('o.dataVencimento BETWEEN :hoje AND :limite', { hoje, limite })
      .orderBy('o.dataVencimento', 'ASC')
      .getMany();
  }

  private calcularDataVencimento(ano: number, mes: number, dia: number, antecipaFds: boolean): Date {
    // Mes seguinte ao da competencia
    let mesPgto = mes + 1;
    let anoPgto = ano;
    if (mesPgto > 12) { mesPgto = 1; anoPgto++; }

    const ultimoDia = new Date(anoPgto, mesPgto, 0).getDate();
    const diaFinal = Math.min(dia, ultimoDia);
    let data = new Date(anoPgto, mesPgto - 1, diaFinal);

    // Ajustar fim de semana
    if (antecipaFds) {
      while (data.getDay() === 0 || data.getDay() === 6) {
        data.setDate(data.getDate() - 1);
      }
    }

    return data;
  }
}

// ============================================================
// Servico de Auditoria Fiscal
// ============================================================

@Injectable()
export class AuditoriaFiscalService {
  private readonly logger = new Logger(AuditoriaFiscalService.name);

  constructor(
    @InjectRepository(AuditoriaFiscal)
    private readonly auditoriaRepo: Repository<AuditoriaFiscal>,
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
  ) {}

  /**
   * Audita uma NF-e completa
   */
  async auditarNfe(tenantId: string, nfeId: string): Promise<{
    nfeId: string; totalAlertas: number; alertasCriticos: number;
    alertas: Array<{ tipo: string; severidade: string; mensagem: string }>;
    status: string;
  }> {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e nao encontrada');

    const alertas: Array<{ tipo: string; severidade: string; mensagem: string }> = [];

    // 1. Validar chave de acesso
    if (!nfe.chaveAcesso || nfe.chaveAcesso.length !== 44) {
      alertas.push({ tipo: 'CHAVE_INVALIDA', severidade: 'CRITICA', mensagem: 'Chave de acesso deve ter 44 digitos' });
    }

    // 2. Validar valores totais
    if (nfe.valorTotal <= 0) {
      alertas.push({ tipo: 'VALOR_TOTAL_ZERO', severidade: 'ALTA', mensagem: 'Valor total da NF-e esta zerado' });
    }

    // 3. Validar consistencia de valores
    const valorCalculado = Number(nfe.valorProdutos) + Number(nfe.valorFrete) + Number(nfe.valorSeguro)
      + Number(nfe.valorOutrasDespesas) - Number(nfe.valorDesconto)
      + Number(nfe.valorIcmsSt) + Number(nfe.valorIpi);

    if (Math.abs(valorCalculado - Number(nfe.valorTotal)) > 0.01) {
      alertas.push({
        tipo: 'VALOR_TOTAL_DIVERGENTE', severidade: 'CRITICA',
        mensagem: `Valor total calculado (${valorCalculado.toFixed(2)}) diverge do informado (${Number(nfe.valorTotal).toFixed(2)})`,
      });
    }

    // 4. Verificar duplicidade de chave
    const duplicada = await this.nfeRepo.createQueryBuilder('n')
      .where('n.chaveAcesso = :chave', { chave: nfe.chaveAcesso })
      .andWhere('n.id != :nfeId', { nfeId: nfe.id })
      .andWhere('n.status NOT IN (:...excluir)', { excluir: ['cancelada', 'denegada'] })
      .getOne();

    if (duplicada) {
      alertas.push({ tipo: 'NOTA_DUPLICADA', severidade: 'CRITICA', mensagem: `Chave duplicada com NF-e ${duplicada.id}` });
    }

    // 5. Verificar carga tributaria
    if (nfe.valorProdutos > 0) {
      const totalImpostos = Number(nfe.valorIcms) + Number(nfe.valorIcmsSt) + Number(nfe.valorIpi) + Number(nfe.valorPis) + Number(nfe.valorCofins);
      const carga = (totalImpostos / Number(nfe.valorProdutos)) * 100;
      if (carga > 50) {
        alertas.push({ tipo: 'CARGA_TRIBUTARIA_ALTA', severidade: 'MEDIA', mensagem: `Carga tributaria ${carga.toFixed(2)}% esta acima de 50%` });
      }
    }

    // Salvar alertas
    for (const alerta of alertas) {
      const aud = this.auditoriaRepo.create({
        tenantId,
        tipoDocumento: 'NF-e',
        documentoId: nfeId,
        tipoAlerta: alerta.tipo,
        severidade: alerta.severidade,
        mensagem: alerta.mensagem,
        status: 'aberto',
      });
      await this.auditoriaRepo.save(aud);
    }

    const alertasCriticos = alertas.filter(a => a.severidade === 'CRITICA').length;
    return {
      nfeId,
      totalAlertas: alertas.length,
      alertasCriticos,
      alertas,
      status: alertasCriticos > 0 ? 'REPROVADA' : 'APROVADA',
    };
  }

  /**
   * Lista auditorias
   */
  async listarAuditorias(tenantId: string, filtros: {
    tipoDocumento?: string; severidade?: string; status?: string;
    page?: number; limit?: number;
  }): Promise<{ data: AuditoriaFiscal[]; total: number }> {
    const qb = this.auditoriaRepo.createQueryBuilder('a')
      .where('a.tenantId = :tenantId', { tenantId });

    if (filtros.tipoDocumento) qb.andWhere('a.tipoDocumento = :tipo', { tipo: filtros.tipoDocumento });
    if (filtros.severidade) qb.andWhere('a.severidade = :sev', { sev: filtros.severidade });
    if (filtros.status) qb.andWhere('a.status = :st', { st: filtros.status });

    qb.orderBy('a.criadoEm', 'DESC')
      .skip(((filtros.page || 1) - 1) * (filtros.limit || 20))
      .take(Math.min(filtros.limit || 20, 100));

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}

// ============================================================
// Simulador Tributario
// ============================================================

@Injectable()
export class SimuladorTributarioService {
  private readonly logger = new Logger(SimuladorTributarioService.name);

  constructor(private readonly motor: MotorTributarioService) {}

  /**
   * Simula tributacao para multiplos cenarios
   */
  async simularOperacao(
    itens: ItemOperacao[],
    contextoBase: ContextoTributario,
    variacoes: Array<Partial<ContextoTributario>>,
  ): Promise<Array<{ variacao: Partial<ContextoTributario>; totalImpostos: number; cargaTributaria: number; resultados: ResultadoTributario[] }>> {
    const resultados: Array<any> = [];

    for (const variacao of variacoes) {
      const contexto: ContextoTributario = { ...contextoBase, ...variacao };
      const resultadosItens: ResultadoTributario[] = [];
      let totalImpostos = 0;
      let totalProdutos = 0;

      for (const item of itens) {
        const resultado = await this.motor.calcularTributacao(item, contexto);
        resultadosItens.push(resultado);
        totalImpostos += resultado.valorTotalImpostos;
        totalProdutos += resultado.valorTotalProdutos;
      }

      resultados.push({
        variacao,
        totalImpostos: Math.round(totalImpostos * 100) / 100,
        cargaTributaria: totalProdutos > 0 ? Math.round((totalImpostos / totalProdutos) * 10000) / 100 : 0,
        resultados: resultadosItens,
      });
    }

    return resultados;
  }
}
