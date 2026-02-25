import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObrigacaoFiscal } from '../entities/fiscal-complementar.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

/**
 * Servico de geracao de guias de pagamento:
 * - DAS (Simples Nacional)
 * - DARF (Tributos Federais)
 * - GNRE (ICMS Interestadual)
 * - GPS (Previdencia Social)
 *
 * Em producao: gerar PDFs reais com codigo de barras e linha digitavel.
 * Nesta implementacao: retorna dados estruturados para geracao de PDF no frontend.
 */
@Injectable()
export class GuiaPagamentoService {
  private readonly logger = new Logger(GuiaPagamentoService.name);

  constructor(
    @InjectRepository(ObrigacaoFiscal)
    private readonly obrigacaoRepo: Repository<ObrigacaoFiscal>,
    @InjectRepository(EmpresaFiscal)
    private readonly empresaRepo: Repository<EmpresaFiscal>,
  ) {}

  /**
   * Gera guia DAS (Documento de Arrecadacao do Simples Nacional)
   */
  async gerarDAS(params: {
    tenantId: string;
    empresaId: string;
    periodoApuracao: string; // MM/YYYY
    valorTotal: number;
    reparticao?: Record<string, number>; // IRPJ, CSLL, COFINS, PIS, CPP, ICMS, ISS
  }): Promise<{
    tipo: 'DAS';
    periodoApuracao: string;
    cnpj: string;
    razaoSocial: string;
    valorTotal: number;
    dataVencimento: string;
    codigoBarras: string;
    linhaDigitavel: string;
    reparticao: Record<string, number>;
    observacoes: string[];
  }> {
    const empresa = await this.empresaRepo.findOne({
      where: { tenantId: params.tenantId, empresaId: params.empresaId },
    });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const [mes, ano] = params.periodoApuracao.split('/').map(Number);
    const dataVencimento = this.calcularVencimentoDAS(ano, mes);
    const codigoBarras = this.gerarCodigoBarrasDAS(empresa.cnpj, params.periodoApuracao, params.valorTotal);
    const linhaDigitavel = this.codigoBarrasParaLinhaDigitavel(codigoBarras);

    const reparticao = params.reparticao || {
      IRPJ: this.round(params.valorTotal * 0.055),
      CSLL: this.round(params.valorTotal * 0.035),
      COFINS: this.round(params.valorTotal * 0.1282),
      PIS: this.round(params.valorTotal * 0.0278),
      CPP: this.round(params.valorTotal * 0.4340),
      ICMS: this.round(params.valorTotal * 0.3400),
      ISS: 0,
    };

    return {
      tipo: 'DAS',
      periodoApuracao: params.periodoApuracao,
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      valorTotal: params.valorTotal,
      dataVencimento: this.formatDate(dataVencimento),
      codigoBarras,
      linhaDigitavel,
      reparticao,
      observacoes: [
        `Vencimento: dia 20 do mes seguinte ao de apuracao`,
        `Regime: Simples Nacional`,
      ],
    };
  }

  /**
   * Gera guia DARF (Documento de Arrecadacao de Receitas Federais)
   */
  async gerarDARF(params: {
    tenantId: string;
    empresaId: string;
    codigoReceita: string;
    periodoApuracao: string; // MM/YYYY
    valorPrincipal: number;
    valorMulta?: number;
    valorJuros?: number;
    numeroDocumento?: string;
  }): Promise<{
    tipo: 'DARF';
    cnpj: string;
    razaoSocial: string;
    codigoReceita: string;
    descricaoReceita: string;
    periodoApuracao: string;
    dataVencimento: string;
    valorPrincipal: number;
    valorMulta: number;
    valorJuros: number;
    valorTotal: number;
    codigoBarras: string;
    linhaDigitavel: string;
    observacoes: string[];
  }> {
    const empresa = await this.empresaRepo.findOne({
      where: { tenantId: params.tenantId, empresaId: params.empresaId },
    });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const [mes, ano] = params.periodoApuracao.split('/').map(Number);
    const dataVencimento = this.calcularVencimentoDARF(ano, mes, params.codigoReceita);
    const valorMulta = params.valorMulta || 0;
    const valorJuros = params.valorJuros || 0;
    const valorTotal = this.round(params.valorPrincipal + valorMulta + valorJuros);

    const codigoBarras = this.gerarCodigoBarrasDARF(empresa.cnpj, params.codigoReceita, valorTotal);
    const linhaDigitavel = this.codigoBarrasParaLinhaDigitavel(codigoBarras);

    const descricoes: Record<string, string> = {
      '2172': 'IRPJ - Lucro Presumido',
      '2089': 'IRPJ - Lucro Real',
      '2372': 'CSLL - Lucro Presumido',
      '2484': 'CSLL - Lucro Real',
      '6912': 'PIS - Nao Cumulativo',
      '8109': 'PIS - Faturamento',
      '5856': 'COFINS - Nao Cumulativo',
      '2991': 'COFINS - Faturamento',
      '1097': 'IPI - Produtos em Geral',
      '5123': 'IPI - Bebidas',
    };

    return {
      tipo: 'DARF',
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      codigoReceita: params.codigoReceita,
      descricaoReceita: descricoes[params.codigoReceita] || 'Tributo Federal',
      periodoApuracao: params.periodoApuracao,
      dataVencimento: this.formatDate(dataVencimento),
      valorPrincipal: params.valorPrincipal,
      valorMulta,
      valorJuros,
      valorTotal,
      codigoBarras,
      linhaDigitavel,
      observacoes: [
        `Codigo de receita: ${params.codigoReceita}`,
        `Vencimento calculado conforme calendario fiscal`,
      ],
    };
  }

  /**
   * Gera guia GNRE (Guia Nacional de Recolhimento de Tributos Estaduais)
   * Para recolhimento de ICMS-ST e DIFAL interestadual
   */
  async gerarGNRE(params: {
    tenantId: string;
    empresaId: string;
    cnpjDestinatario?: string;
    ufFavorecida: string;
    chaveNfe?: string;
    valorIcms: number;
    valorFcp?: number;
    dataVencimento?: Date;
    codigoReceita?: string;
  }): Promise<{
    tipo: 'GNRE';
    cnpjEmitente: string;
    razaoSocial: string;
    ufFavorecida: string;
    codigoReceita: string;
    valorIcms: number;
    valorFcp: number;
    valorTotal: number;
    dataVencimento: string;
    chaveNfe?: string;
    codigoBarras: string;
    linhaDigitavel: string;
    observacoes: string[];
  }> {
    const empresa = await this.empresaRepo.findOne({
      where: { tenantId: params.tenantId, empresaId: params.empresaId },
    });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const valorFcp = params.valorFcp || 0;
    const valorTotal = this.round(params.valorIcms + valorFcp);
    const dataVenc = params.dataVencimento || this.adicionarDiasUteis(new Date(), 3);

    const codigoBarras = this.gerarCodigoBarrasGNRE(empresa.cnpj, params.ufFavorecida, valorTotal);
    const linhaDigitavel = this.codigoBarrasParaLinhaDigitavel(codigoBarras);

    const codigosReceita: Record<string, string> = {
      '10001-3': 'ICMS Comunicacao',
      '10002-1': 'ICMS Energia Eletrica',
      '10003-0': 'ICMS Transporte',
      '10004-8': 'ICMS Substituicao Tributaria',
      '10009-9': 'ICMS Importacao',
      '10010-2': 'ICMS Consumidor Final Nao Contribuinte',
      '10011-0': 'ICMS FCP por Operacao',
    };

    return {
      tipo: 'GNRE',
      cnpjEmitente: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      ufFavorecida: params.ufFavorecida,
      codigoReceita: params.codigoReceita || '10004-8',
      valorIcms: params.valorIcms,
      valorFcp,
      valorTotal,
      dataVencimento: this.formatDate(dataVenc),
      chaveNfe: params.chaveNfe,
      codigoBarras,
      linhaDigitavel,
      observacoes: [
        `Recolhimento ICMS em favor de ${params.ufFavorecida}`,
        valorFcp > 0 ? `Inclui FCP: R$ ${valorFcp.toFixed(2)}` : 'Sem FCP',
      ],
    };
  }

  /**
   * Busca guias pendentes de pagamento para uma empresa
   */
  async listarGuiasPendentes(tenantId: string, empresaId: string): Promise<ObrigacaoFiscal[]> {
    return this.obrigacaoRepo.createQueryBuilder('o')
      .where('o.tenantId = :tenantId', { tenantId })
      .andWhere('o.empresaId = :empresaId', { empresaId })
      .andWhere('o.tipoObrigacao = :tipo', { tipo: 'pagamento' })
      .andWhere('o.status IN (:...status)', { status: ['pendente', 'atrasado'] })
      .orderBy('o.dataVencimento', 'ASC')
      .getMany();
  }

  /**
   * Gera guia GPS (Guia da Previdencia Social)
   * Recolhimento de INSS sobre folha de pagamento
   */
  async gerarGPS(params: {
    tenantId: string;
    empresaId: string;
    codigoPagamento: string; // 2100=Empresa, 1007=CEI, 2003=Simples Nacional
    competencia: string; // MM/YYYY
    valorInss: number;
    valorOutrasEntidades?: number;
    valorAtualizacao?: number;
  }): Promise<{
    tipo: 'GPS';
    cnpj: string;
    razaoSocial: string;
    codigoPagamento: string;
    descricaoPagamento: string;
    competencia: string;
    dataVencimento: string;
    valorInss: number;
    valorOutrasEntidades: number;
    valorAtualizacao: number;
    valorTotal: number;
    codigoBarras: string;
    linhaDigitavel: string;
    observacoes: string[];
  }> {
    const empresa = await this.empresaRepo.findOne({
      where: { tenantId: params.tenantId, empresaId: params.empresaId },
    });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const [mes, ano] = params.competencia.split('/').map(Number);
    const dataVencimento = this.calcularVencimentoGPS(ano, mes);
    const valorOutras = params.valorOutrasEntidades || 0;
    const valorAtual = params.valorAtualizacao || 0;
    const valorTotal = this.round(params.valorInss + valorOutras + valorAtual);

    const descricoes: Record<string, string> = {
      '2100': 'Empresa - CNPJ',
      '2003': 'Simples Nacional - CNPJ',
      '1007': 'Contribuinte Individual - CEI',
      '2208': 'Empresa - CNPJ (acima de 20 empregados)',
      '2607': 'Empresa - CNPJ Recolhimento complementar',
    };

    const codigoBarras = this.gerarCodigoBarrasGPS(empresa.cnpj, params.competencia, valorTotal);
    const linhaDigitavel = this.codigoBarrasParaLinhaDigitavel(codigoBarras);

    return {
      tipo: 'GPS',
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      codigoPagamento: params.codigoPagamento,
      descricaoPagamento: descricoes[params.codigoPagamento] || 'Previdencia Social',
      competencia: params.competencia,
      dataVencimento: this.formatDate(dataVencimento),
      valorInss: params.valorInss,
      valorOutrasEntidades: valorOutras,
      valorAtualizacao: valorAtual,
      valorTotal,
      codigoBarras,
      linhaDigitavel,
      observacoes: [
        `GPS - Codigo ${params.codigoPagamento}`,
        `Competencia: ${params.competencia}`,
        `Vencimento: dia 20 do mes seguinte ao de competencia`,
      ],
    };
  }

  /**
   * Gera guia GRU (Guia de Recolhimento da Uniao)
   * Para taxas e contribuicoes federais diversas
   */
  async gerarGRU(params: {
    tenantId: string;
    empresaId: string;
    codigoReceita: string;
    numeroReferencia?: string;
    competencia: string; // MM/YYYY
    valorPrincipal: number;
    valorDescontos?: number;
    valorOutrasDeducoes?: number;
    valorMulta?: number;
    valorJuros?: number;
    valorAcrescimos?: number;
  }): Promise<{
    tipo: 'GRU';
    cnpj: string;
    razaoSocial: string;
    codigoReceita: string;
    competencia: string;
    dataVencimento: string;
    valorPrincipal: number;
    valorDescontos: number;
    valorMulta: number;
    valorJuros: number;
    valorTotal: number;
    codigoBarras: string;
    linhaDigitavel: string;
    observacoes: string[];
  }> {
    const empresa = await this.empresaRepo.findOne({
      where: { tenantId: params.tenantId, empresaId: params.empresaId },
    });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const [mes, ano] = params.competencia.split('/').map(Number);
    const dataVencimento = this.calcularVencimentoDARF(ano, mes, params.codigoReceita);

    const descontos = params.valorDescontos || 0;
    const multa = params.valorMulta || 0;
    const juros = params.valorJuros || 0;
    const acrescimos = params.valorAcrescimos || 0;
    const valorTotal = this.round(params.valorPrincipal - descontos + multa + juros + acrescimos);

    const codigoBarras = this.gerarCodigoBarrasDARF(empresa.cnpj, params.codigoReceita, valorTotal);
    const linhaDigitavel = this.codigoBarrasParaLinhaDigitavel(codigoBarras);

    return {
      tipo: 'GRU',
      cnpj: empresa.cnpj,
      razaoSocial: empresa.razaoSocial,
      codigoReceita: params.codigoReceita,
      competencia: params.competencia,
      dataVencimento: this.formatDate(dataVencimento),
      valorPrincipal: params.valorPrincipal,
      valorDescontos: descontos,
      valorMulta: multa,
      valorJuros: juros,
      valorTotal,
      codigoBarras,
      linhaDigitavel,
      observacoes: [
        `GRU - Guia de Recolhimento da Uniao`,
        `Codigo de receita: ${params.codigoReceita}`,
        params.numeroReferencia ? `Referencia: ${params.numeroReferencia}` : '',
      ].filter(Boolean),
    };
  }

  // ============================================================
  // Helpers de calculo de datas
  // ============================================================

  private calcularVencimentoGPS(ano: number, mes: number): Date {
    // GPS vence dia 20 do mes seguinte ao da competencia
    let mesPgto = mes + 1;
    let anoPgto = ano;
    if (mesPgto > 12) { mesPgto = 1; anoPgto++; }
    return this.ajustarDiaUtil(new Date(anoPgto, mesPgto - 1, 20));
  }

  private calcularVencimentoDAS(ano: number, mes: number): Date {
    // DAS vence dia 20 do mes seguinte
    let mesPgto = mes + 1;
    let anoPgto = ano;
    if (mesPgto > 12) { mesPgto = 1; anoPgto++; }
    return this.ajustarDiaUtil(new Date(anoPgto, mesPgto - 1, 20));
  }

  private calcularVencimentoDARF(ano: number, mes: number, _codigoReceita: string): Date {
    // Padrao: dia 20 ou 25 do mes seguinte, conforme tributo
    let mesPgto = mes + 1;
    let anoPgto = ano;
    if (mesPgto > 12) { mesPgto = 1; anoPgto++; }
    return this.ajustarDiaUtil(new Date(anoPgto, mesPgto - 1, 20));
  }

  private adicionarDiasUteis(data: Date, dias: number): Date {
    const result = new Date(data);
    let adicionados = 0;
    while (adicionados < dias) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        adicionados++;
      }
    }
    return result;
  }

  private ajustarDiaUtil(data: Date): Date {
    // Antecipa para dia util anterior se cair em fds
    while (data.getDay() === 0 || data.getDay() === 6) {
      data.setDate(data.getDate() - 1);
    }
    return data;
  }

  // ============================================================
  // Helpers de codigo de barras (stubs - producao usa Febraban)
  // ============================================================

  private gerarCodigoBarrasGPS(cnpj: string, competencia: string, valor: number): string {
    const valorStr = Math.round(valor * 100).toString().padStart(11, '0');
    return `858${valorStr}0${cnpj}${competencia.replace('/', '')}GPS00`;
  }

  private gerarCodigoBarrasDAS(cnpj: string, periodo: string, valor: number): string {
    // Stub: codigo de barras DAS segue layout proprio do Simples Nacional
    const valorStr = Math.round(valor * 100).toString().padStart(11, '0');
    return `858${valorStr}0${cnpj}${periodo.replace('/', '')}0000`;
  }

  private gerarCodigoBarrasDARF(cnpj: string, codigoReceita: string, valor: number): string {
    const valorStr = Math.round(valor * 100).toString().padStart(11, '0');
    return `858${valorStr}0${cnpj}${codigoReceita.padStart(4, '0')}00000`;
  }

  private gerarCodigoBarrasGNRE(cnpj: string, uf: string, valor: number): string {
    const valorStr = Math.round(valor * 100).toString().padStart(11, '0');
    return `858${valorStr}0${cnpj}${uf}00000000`;
  }

  private codigoBarrasParaLinhaDigitavel(codigoBarras: string): string {
    // Stub: formatar em blocos separados por espacos
    const str = codigoBarras.padEnd(48, '0');
    return `${str.slice(0, 12)} ${str.slice(12, 24)} ${str.slice(24, 36)} ${str.slice(36, 48)}`;
  }

  private formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
