import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatrizTributaria } from '../entities/matriz-tributaria.entity';
import { IcmsAliquotasUf } from '../entities/icms-tabelas.entity';

// ============================================================
// Interfaces para o Motor Tributário
// ============================================================

export interface ItemOperacao {
  produtoId: string;
  ncm: string;
  cest?: string;
  cfop: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  pesoBruto?: number;
  pesoLiquido?: number;
}

export interface ContextoTributario {
  tenantId: string;
  empresaId: string;
  filialId?: string;
  regimeEmpresa: string; // 1=Simples, 2=Simples Excesso, 3=Normal
  ufOrigem: string;
  ufDestino: string;
  tipoOperacao: string; // E=Entrada, S=Saída
  finalidadeEmissao: string; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
  indicadorPresenca: string;
  parceiroId?: string;
  regimeParceiro?: string;
  consumidorFinal: boolean;
  contribuinteIcms: boolean;
  pisCofinsCumulativo?: boolean;
}

export interface ResultadoTributario {
  // ICMS
  icmsBaseCalculo: number;
  icmsAliquota: number;
  icmsValor: number;
  icmsReducaoBc: number;
  icmsDiferido: number;
  icmsDesonerado: number;
  icmsMotivoDesoneracao?: string;
  icmsCst: string;

  // ICMS-ST
  icmsStBaseCalculo: number;
  icmsStAliquota: number;
  icmsStValor: number;
  icmsStMva: number;
  icmsStReducaoBc: number;

  // DIFAL
  difalAplica: boolean;
  difalBase: number;
  difalAliqInterna: number;
  difalAliqInter: number;
  difalValor: number;
  fcpBase: number;
  fcpAliq: number;
  fcpValor: number;

  // IPI
  ipiBaseCalculo: number;
  ipiAliquota: number;
  ipiValor: number;
  ipiCst: string;

  // PIS
  pisBaseCalculo: number;
  pisAliquota: number;
  pisValor: number;
  pisCst: string;

  // COFINS
  cofinsBaseCalculo: number;
  cofinsAliquota: number;
  cofinsValor: number;
  cofinsCst: string;

  // ISS
  issBaseCalculo: number;
  issAliquota: number;
  issValor: number;
  issRetido: boolean;

  // Simples Nacional
  snCsosn?: string;
  snAliquota?: number;
  snCredito?: number;

  // Totais
  valorTotalProdutos: number;
  valorTotalImpostos: number;
  valorTotalNota: number;

  // Regra
  regraId?: string;
  regraPrioridade: number;
  observacoes: string[];
}

/**
 * Motor Tributário Principal
 * Implementa todas as regras de ICMS, ICMS-ST, IPI, PIS/COFINS, ISS e Simples Nacional
 */
@Injectable()
export class MotorTributarioService {
  private readonly logger = new Logger(MotorTributarioService.name);

  // Alíquotas PIS/COFINS padrão
  private readonly PIS_ALIQ_CUMULATIVO = 0.65;
  private readonly PIS_ALIQ_NAO_CUMULATIVO = 1.65;
  private readonly COFINS_ALIQ_CUMULATIVO = 3.00;
  private readonly COFINS_ALIQ_NAO_CUMULATIVO = 7.60;

  // Estados Sul e Sudeste (exceto ES) para Convenção 115/2003
  private readonly SUL_SUDESTE = ['RS', 'SC', 'PR', 'SP', 'RJ', 'MG'];
  private readonly OUTROS_UFS = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO',
    'RR', 'SE', 'TO',
  ];

  // FCP por UF (percentuais vigentes conforme legislação estadual)
  private readonly FCP_UFS: Record<string, number> = {
    AC: 2.0, AL: 2.0, AM: 2.0, AP: 2.0, BA: 2.0, CE: 2.0,
    DF: 2.0, ES: 2.0, GO: 2.0, MA: 2.0, MG: 2.0, MS: 2.0,
    MT: 2.0, PA: 2.0, PB: 2.0, PE: 2.0, PI: 2.0, PR: 2.0,
    RJ: 2.0, RN: 2.0, RO: 2.0, RR: 2.0, RS: 2.0, SC: 0.0,
    SE: 2.0, SP: 2.0, TO: 2.0,
  };

  constructor(
    @InjectRepository(MatrizTributaria)
    private readonly matrizRepo: Repository<MatrizTributaria>,
    @InjectRepository(IcmsAliquotasUf)
    private readonly icmsUfRepo: Repository<IcmsAliquotasUf>,
  ) {}

  /**
   * Calcula a tributação completa para um item de operação
   */
  async calcularTributacao(
    item: ItemOperacao,
    contexto: ContextoTributario,
  ): Promise<ResultadoTributario> {
    this.logger.log(`Calculando tributação para item ${item.produtoId}`);

    // 1. Buscar regra da matriz tributária
    const regra = await this.buscarRegraTributaria(item, contexto);

    // 2. Calcular ICMS
    const icmsResult = this.calcularICMS(item, contexto, regra);

    // 3. Calcular ICMS-ST
    const icmsStResult = this.calcularICMSST(item, contexto, regra, icmsResult);

    // 4. Calcular DIFAL
    const difalResult = this.calcularDIFAL(item, contexto);

    // 5. Calcular IPI
    const ipiResult = this.calcularIPI(item, contexto, regra);

    // 6. Calcular PIS/COFINS
    const pisCofinsResult = this.calcularPISCOFINS(item, contexto, regra);

    // 7. Calcular ISS
    const issResult = this.calcularISS(item, contexto, regra);

    // 8. Calcular Simples Nacional
    const snResult = this.calcularSimplesNacional(item, contexto, regra);

    // 9. Consolidar resultado
    const resultado = this.consolidarResultado(
      item, contexto, regra,
      icmsResult, icmsStResult, difalResult,
      ipiResult, pisCofinsResult, issResult, snResult,
    );

    this.logger.log(`Cálculo concluído. Total impostos: ${resultado.valorTotalImpostos}`);
    return resultado;
  }

  /**
   * Busca a regra tributária mais específica (prioridade)
   */
  async buscarRegraTributaria(
    item: ItemOperacao,
    contexto: ContextoTributario,
  ): Promise<MatrizTributaria | null> {
    const qb = this.matrizRepo.createQueryBuilder('m')
      .where('m.tenantId = :tenantId', { tenantId: contexto.tenantId })
      .andWhere('m.ativo = true')
      .andWhere('(m.dataInicio IS NULL OR m.dataInicio <= CURRENT_DATE)')
      .andWhere('(m.dataFim IS NULL OR m.dataFim >= CURRENT_DATE)')
      // Filtros opcionais
      .andWhere('(m.empresaId IS NULL OR m.empresaId = :empresaId)', { empresaId: contexto.empresaId })
      .andWhere('(m.filialId IS NULL OR m.filialId = :filialId)', { filialId: contexto.filialId || null })
      .andWhere('(m.regimeTributarioEmp IS NULL OR m.regimeTributarioEmp = :regime)', { regime: contexto.regimeEmpresa })
      .andWhere(`(
        m.produtoId = :produtoId
        OR m.ncmCodigo = :ncm
        OR m.cestCodigo = :cest
        OR (m.produtoId IS NULL AND m.ncmCodigo IS NULL AND m.cestCodigo IS NULL)
      )`, { produtoId: item.produtoId, ncm: item.ncm, cest: item.cest || null })
      .andWhere('(m.cfopCodigo IS NULL OR m.cfopCodigo = :cfop)', { cfop: item.cfop })
      .andWhere('(m.tipoOperacao IS NULL OR m.tipoOperacao = :tipoOp)', { tipoOp: contexto.tipoOperacao })
      .andWhere('(m.ufOrigem IS NULL OR m.ufOrigem = :ufOrigem)', { ufOrigem: contexto.ufOrigem })
      .andWhere('(m.ufDestino IS NULL OR m.ufDestino = :ufDestino)', { ufDestino: contexto.ufDestino })
      .orderBy('m.prioridade', 'ASC')
      .addOrderBy(`CASE WHEN m.produtoId IS NOT NULL THEN 1 ELSE 2 END`, 'ASC')
      .addOrderBy(`CASE WHEN m.ncmCodigo IS NOT NULL THEN 1 ELSE 2 END`, 'ASC')
      .addOrderBy(`CASE WHEN m.cfopCodigo IS NOT NULL THEN 1 ELSE 2 END`, 'ASC')
      .limit(1);

    const regra = await qb.getOne();
    if (regra) {
      this.logger.log(`Regra encontrada: ${regra.codigo} (prioridade ${regra.prioridade})`);
    } else {
      this.logger.warn('Nenhuma regra específica encontrada, usando padrão do sistema');
    }
    return regra;
  }

  /**
   * Calcula ICMS conforme legislação brasileira
   */
  private calcularICMS(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
  ) {
    let baseCalculo = item.valorTotal;
    let aliquota = 18.0;
    let reducaoBc = 0;
    let diferimento = 0;
    let desonerado = 0;
    let motivoDesoneracao: string | null = null;
    let cst = '000';

    if (regra) {
      cst = regra.icmsCst || '000';
      aliquota = Number(regra.icmsAliq) || 18;
      reducaoBc = Number(regra.icmsReducaoBc) || 0;
      diferimento = Number(regra.icmsDiferimento) || 0;
      desonerado = regra.icmsDesonerado ? 1 : 0;
      motivoDesoneracao = regra.icmsMotivoDesoneracao;
    }

    // Ajustar alíquota para operações interestaduais
    if (contexto.ufOrigem !== contexto.ufDestino) {
      aliquota = this.getAliquotaInterestadual(
        contexto.ufOrigem, contexto.ufDestino, contexto.contribuinteIcms,
      );
    }

    // Aplicar redução de base de cálculo
    if (reducaoBc > 0) {
      baseCalculo = baseCalculo * (1 - reducaoBc / 100);
    }

    // Calcular valor do ICMS
    let valorIcms = this.round2(baseCalculo * aliquota / 100);

    // Aplicar diferimento
    if (diferimento > 0) {
      valorIcms = valorIcms * (1 - diferimento / 100);
    }

    return {
      baseCalculo: this.round2(baseCalculo),
      aliquota,
      valor: this.round2(valorIcms),
      reducaoBc,
      diferimento,
      desonerado,
      motivoDesoneracao,
      cst,
    };
  }

  /**
   * Calcula ICMS-ST (Substituição Tributária)
   */
  private calcularICMSST(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
    icmsResult: any,
  ) {
    if (!regra || !regra.icmsStMva) {
      return {
        aplica: false,
        baseCalculo: 0,
        aliquota: 0,
        valor: 0,
        mva: 0,
        reducaoBc: 0,
      };
    }

    const mva = Number(regra.icmsStMva);
    if (mva === 0) {
      return { aplica: false, baseCalculo: 0, aliquota: 0, valor: 0, mva: 0, reducaoBc: 0 };
    }

    // Base ST = Valor produto × (1 + MVA)
    let baseSt = item.valorTotal * (1 + mva / 100);

    // Redução BC ST
    const reducaoBcSt = Number(regra.icmsStReducaoBc) || 0;
    if (reducaoBcSt > 0) {
      baseSt = baseSt * (1 - reducaoBcSt / 100);
    }

    // Alíquota interna do destino
    const aliqDestino = this.getAliquotaInterna(contexto.ufDestino);

    // Valor ST = (Base ST × Alíq Destino) − ICMS Próprio
    let valorSt = (baseSt * aliqDestino / 100) - icmsResult.valor;
    if (valorSt < 0) valorSt = 0;

    return {
      aplica: true,
      baseCalculo: this.round2(baseSt),
      aliquota: aliqDestino,
      valor: this.round2(valorSt),
      mva,
      reducaoBc: reducaoBcSt,
    };
  }

  /**
   * Calcula DIFAL (EC 87/2015) para operações interestaduais com não contribuintes
   * Desde 2019: 100% para UF destino conforme Convênio ICMS 93/2015
   * Base legal: LC 190/2022
   */
  private calcularDIFAL(item: ItemOperacao, contexto: ContextoTributario) {
    if (contexto.contribuinteIcms || contexto.ufOrigem === contexto.ufDestino) {
      return { aplica: false, base: 0, aliqInterna: 0, aliqInter: 0, valor: 0, fcpBase: 0, fcpAliq: 0, fcpValor: 0 };
    }

    const aliqInterna = this.getAliquotaInterna(contexto.ufDestino);
    // Para DIFAL EC 87/2015 usar alíquota interestadual real (contribuinte=true)
    const aliqInter = this.getAliquotaInterestadual(contexto.ufOrigem, contexto.ufDestino, true);
    const difalAliq = Math.max(0, aliqInterna - aliqInter);
    const difalValor = this.round2(item.valorTotal * difalAliq / 100);

    const fcpAliq = this.FCP_UFS[contexto.ufDestino] || 0;
    const fcpValor = this.round2(item.valorTotal * fcpAliq / 100);

    return {
      aplica: true,
      base: item.valorTotal,
      aliqInterna,
      aliqInter,
      valor: difalValor,
      fcpBase: item.valorTotal,
      fcpAliq,
      fcpValor,
    };
  }

  /**
   * Calcula IPI conforme TIPI
   */
  private calcularIPI(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
  ) {
    if (!regra) {
      return {
        baseCalculo: 0, aliquota: 0, valor: 0,
        cst: contexto.tipoOperacao === 'S' ? '99' : '49',
      };
    }

    const cst = regra.ipiCst || '99';
    const aliquota = Number(regra.ipiAliq) || 0;

    // Só calcula se CST for tributado
    if (!['50', '00'].includes(cst)) {
      return { baseCalculo: 0, aliquota: 0, valor: 0, cst };
    }

    const baseCalculo = item.valorTotal;
    const valorIpi = this.round2(baseCalculo * aliquota / 100);

    return { baseCalculo, aliquota, valor: valorIpi, cst };
  }

  /**
   * Calcula PIS e COFINS
   */
  private calcularPISCOFINS(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
  ) {
    // Simples Nacional: PIS/COFINS já embutido no DAS
    if (contexto.regimeEmpresa === '1') {
      return {
        pisBase: 0, pisAliquota: 0, pisValor: 0, pisCst: '99',
        cofinsBase: 0, cofinsAliquota: 0, cofinsValor: 0, cofinsCst: '99',
      };
    }

    const pisCst = regra?.pisCst || '01';
    const cofinsCst = regra?.cofinsCst || '01';

    // Monofásico ou não tributado
    if (['04', '05', '06', '07', '08', '09'].includes(pisCst)) {
      return {
        pisBase: 0, pisAliquota: 0, pisValor: 0, pisCst,
        cofinsBase: 0, cofinsAliquota: 0, cofinsValor: 0, cofinsCst,
      };
    }

    const baseCalculo = item.valorTotal;

    // Determinar alíquotas
    let pisAliq = contexto.pisCofinsCumulativo ? this.PIS_ALIQ_CUMULATIVO : this.PIS_ALIQ_NAO_CUMULATIVO;
    let cofinsAliq = contexto.pisCofinsCumulativo ? this.COFINS_ALIQ_CUMULATIVO : this.COFINS_ALIQ_NAO_CUMULATIVO;

    // Lucro Presumido = cumulativo
    if (contexto.regimeEmpresa === '3' && contexto.pisCofinsCumulativo !== false) {
      pisAliq = this.PIS_ALIQ_CUMULATIVO;
      cofinsAliq = this.COFINS_ALIQ_CUMULATIVO;
    }

    // Usar alíquotas da regra se especificadas
    if (regra?.pisAliq) pisAliq = Number(regra.pisAliq);
    if (regra?.cofinsAliq) cofinsAliq = Number(regra.cofinsAliq);

    return {
      pisBase: baseCalculo,
      pisAliquota: pisAliq,
      pisValor: this.round2(baseCalculo * pisAliq / 100),
      pisCst,
      cofinsBase: baseCalculo,
      cofinsAliquota: cofinsAliq,
      cofinsValor: this.round2(baseCalculo * cofinsAliq / 100),
      cofinsCst,
    };
  }

  /**
   * Calcula ISS (Imposto Sobre Serviços)
   */
  private calcularISS(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
  ) {
    // Verificar se CFOP indica serviço
    const isServico = item.cfop.length >= 3 && ['3', '6'].includes(item.cfop[2]);
    if (!isServico) {
      return { baseCalculo: 0, aliquota: 0, valor: 0, retido: false };
    }

    const aliquota = Number(regra?.issAliq) || 5.0;
    const retido = regra?.issRetido || false;
    const valorIss = this.round2(item.valorTotal * aliquota / 100);

    return { baseCalculo: item.valorTotal, aliquota, valor: valorIss, retido };
  }

  /**
   * Calcula valores do Simples Nacional (CSOSN e crédito)
   */
  private calcularSimplesNacional(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
  ) {
    if (contexto.regimeEmpresa !== '1') {
      return { csosn: null, aliquota: null, credito: null };
    }

    const csosn = regra?.snCsosn || '102';
    const aliquota = Number(regra?.snAliquota) || 0;
    let credito = Number(regra?.snCreditoSn) || 0;

    // Calcular crédito se CSOSN permitir
    if (['101', '201'].includes(csosn) && aliquota > 0) {
      credito = this.round2(item.valorTotal * aliquota / 100);
    }

    return { csosn, aliquota, credito };
  }

  /**
   * Consolida todos os cálculos em um resultado único
   */
  private consolidarResultado(
    item: ItemOperacao,
    contexto: ContextoTributario,
    regra: MatrizTributaria | null,
    icms: any, icmsSt: any, difal: any,
    ipi: any, pisCofins: any, iss: any, sn: any,
  ): ResultadoTributario {
    const valorImpostos =
      icms.valor + icmsSt.valor + difal.valor + difal.fcpValor +
      ipi.valor + pisCofins.pisValor + pisCofins.cofinsValor + iss.valor;

    const observacoes: string[] = [];
    if (regra?.observacaoFiscal) observacoes.push(regra.observacaoFiscal);
    if (difal.aplica) observacoes.push(`DIFAL: R$ ${difal.valor.toFixed(2)} + FCP: R$ ${difal.fcpValor.toFixed(2)}`);

    return {
      icmsBaseCalculo: icms.baseCalculo,
      icmsAliquota: icms.aliquota,
      icmsValor: icms.valor,
      icmsReducaoBc: icms.reducaoBc,
      icmsDiferido: icms.diferimento,
      icmsDesonerado: icms.desonerado,
      icmsMotivoDesoneracao: icms.motivoDesoneracao,
      icmsCst: icms.cst,

      icmsStBaseCalculo: icmsSt.baseCalculo,
      icmsStAliquota: icmsSt.aliquota,
      icmsStValor: icmsSt.valor,
      icmsStMva: icmsSt.mva,
      icmsStReducaoBc: icmsSt.reducaoBc,

      difalAplica: difal.aplica,
      difalBase: difal.base,
      difalAliqInterna: difal.aliqInterna,
      difalAliqInter: difal.aliqInter,
      difalValor: difal.valor,
      fcpBase: difal.fcpBase,
      fcpAliq: difal.fcpAliq,
      fcpValor: difal.fcpValor,

      ipiBaseCalculo: ipi.baseCalculo,
      ipiAliquota: ipi.aliquota,
      ipiValor: ipi.valor,
      ipiCst: ipi.cst,

      pisBaseCalculo: pisCofins.pisBase,
      pisAliquota: pisCofins.pisAliquota,
      pisValor: pisCofins.pisValor,
      pisCst: pisCofins.pisCst,

      cofinsBaseCalculo: pisCofins.cofinsBase,
      cofinsAliquota: pisCofins.cofinsAliquota,
      cofinsValor: pisCofins.cofinsValor,
      cofinsCst: pisCofins.cofinsCst,

      issBaseCalculo: iss.baseCalculo,
      issAliquota: iss.aliquota,
      issValor: iss.valor,
      issRetido: iss.retido,

      snCsosn: sn.csosn,
      snAliquota: sn.aliquota,
      snCredito: sn.credito,

      valorTotalProdutos: item.valorTotal,
      valorTotalImpostos: this.round2(valorImpostos),
      valorTotalNota: this.round2(item.valorTotal + valorImpostos),

      regraId: regra?.id || undefined,
      regraPrioridade: regra?.prioridade || 999,
      observacoes,
    };
  }

  // ============================================================
  // Helpers de alíquotas
  // ============================================================

  private getAliquotaInterestadual(ufOrigem: string, ufDestino: string, contribuinte: boolean): number {
    if (!contribuinte) {
      return this.getAliquotaInterna(ufDestino);
    }
    if (this.SUL_SUDESTE.includes(ufOrigem) && this.OUTROS_UFS.includes(ufDestino)) {
      return 7.0;
    }
    return 12.0;
  }

  private getAliquotaInterna(uf: string): number {
    const aliquotas: Record<string, number> = {
      SP: 18, RJ: 20, MG: 18, RS: 18, PR: 18, SC: 17,
      BA: 18, CE: 18, PE: 18, GO: 17, DF: 18, ES: 17,
      MT: 17, MS: 17, PA: 17, MA: 18, PI: 18, RN: 18,
      PB: 18, AL: 18, SE: 18, TO: 18, AC: 19, AM: 18,
      AP: 18, RO: 17.5, RR: 17,
    };
    return aliquotas[uf] || 18;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
