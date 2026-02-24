import { Injectable, Logger } from '@nestjs/common';

/**
 * Cálculo completo do Simples Nacional conforme LC 123/2006
 * Anexos I a V com todas as faixas, desconto e repartição
 */

interface FaixaSN {
  receitaBrutaMax: number;
  aliquota: number;
  desconto: number;
}

export interface ResultadoDAS {
  receitaBruta12Meses: number;
  receitaMes: number;
  anexo: string;
  faixa: number;
  aliquotaTabela: number;
  desconto: number;
  aliquotaEfetiva: number;
  valorDas: number;
  reparticao: Record<string, number>;
}

@Injectable()
export class CalculoSimplesNacionalService {
  private readonly logger = new Logger(CalculoSimplesNacionalService.name);

  // Tabelas de alíquotas por anexo e faixa
  private readonly TABELAS: Record<string, Record<number, FaixaSN>> = {
    I: { // Comércio
      1: { receitaBrutaMax: 180000, aliquota: 4.00, desconto: 0 },
      2: { receitaBrutaMax: 360000, aliquota: 7.30, desconto: 5940 },
      3: { receitaBrutaMax: 720000, aliquota: 9.50, desconto: 13860 },
      4: { receitaBrutaMax: 1800000, aliquota: 10.70, desconto: 22500 },
      5: { receitaBrutaMax: 3600000, aliquota: 14.30, desconto: 87300 },
      6: { receitaBrutaMax: 4800000, aliquota: 19.00, desconto: 378000 },
    },
    II: { // Indústria
      1: { receitaBrutaMax: 180000, aliquota: 4.50, desconto: 0 },
      2: { receitaBrutaMax: 360000, aliquota: 7.80, desconto: 5940 },
      3: { receitaBrutaMax: 720000, aliquota: 10.00, desconto: 13860 },
      4: { receitaBrutaMax: 1800000, aliquota: 11.20, desconto: 22500 },
      5: { receitaBrutaMax: 3600000, aliquota: 14.70, desconto: 85500 },
      6: { receitaBrutaMax: 4800000, aliquota: 30.00, desconto: 720000 },
    },
    III: { // Serviços
      1: { receitaBrutaMax: 180000, aliquota: 6.00, desconto: 0 },
      2: { receitaBrutaMax: 360000, aliquota: 11.20, desconto: 9360 },
      3: { receitaBrutaMax: 720000, aliquota: 13.50, desconto: 17640 },
      4: { receitaBrutaMax: 1800000, aliquota: 16.00, desconto: 35640 },
      5: { receitaBrutaMax: 3600000, aliquota: 21.00, desconto: 125640 },
      6: { receitaBrutaMax: 4800000, aliquota: 33.00, desconto: 648000 },
    },
    IV: { // Serviços (ISS próprio)
      1: { receitaBrutaMax: 180000, aliquota: 4.50, desconto: 0 },
      2: { receitaBrutaMax: 360000, aliquota: 9.00, desconto: 8100 },
      3: { receitaBrutaMax: 720000, aliquota: 10.60, desconto: 12420 },
      4: { receitaBrutaMax: 1800000, aliquota: 14.00, desconto: 39780 },
      5: { receitaBrutaMax: 3600000, aliquota: 22.00, desconto: 183780 },
      6: { receitaBrutaMax: 4800000, aliquota: 33.00, desconto: 828000 },
    },
    V: { // Serviços
      1: { receitaBrutaMax: 180000, aliquota: 15.50, desconto: 0 },
      2: { receitaBrutaMax: 360000, aliquota: 18.00, desconto: 4500 },
      3: { receitaBrutaMax: 720000, aliquota: 19.50, desconto: 9900 },
      4: { receitaBrutaMax: 1800000, aliquota: 20.50, desconto: 17100 },
      5: { receitaBrutaMax: 3600000, aliquota: 23.00, desconto: 62100 },
      6: { receitaBrutaMax: 4800000, aliquota: 30.50, desconto: 540000 },
    },
  };

  // Repartição do DAS entre tributos por Anexo (Faixa 1)
  private readonly REPARTICAO: Record<string, Record<string, number>> = {
    I: { irpj: 0.0556, csll: 0.0556, cofins: 0.2034, pis: 0.0444, cpp: 0.4180, icms: 0.2230 },
    II: { irpj: 0.0474, csll: 0.0474, cofins: 0.1736, pis: 0.0379, cpp: 0.4211, icms: 0.1974, ipi: 0.0752 },
    III: { irpj: 0.0350, csll: 0.0350, cofins: 0.1282, pis: 0.0278, cpp: 0.4167, icms: 0.1613, iss: 0.1960 },
    IV: { irpj: 0.1944, csll: 0.1944, cofins: 0.1410, pis: 0.0306, cpp: 0.4396 },
    V: { irpj: 0.2581, csll: 0.2258, cofins: 0.1613, pis: 0.0323, cpp: 0.3225 },
  };

  /**
   * Calcula o valor do DAS (Documento de Arrecadação do Simples)
   */
  calcularDAS(
    receitaBruta12Meses: number,
    receitaMes: number,
    anexo: string,
    fatorR?: number,
  ): ResultadoDAS {
    // Determinar anexo baseado no fator R (se serviço)
    if (fatorR !== undefined && ['III', 'V'].includes(anexo)) {
      anexo = fatorR >= 0.28 ? 'III' : 'V';
    }

    // Determinar faixa
    const faixa = this.determinarFaixa(receitaBruta12Meses, anexo);
    const tabelaFaixa = this.TABELAS[anexo][faixa];

    // Calcular alíquota efetiva: [(RBT12 × Alíquota) – PD] / RBT12
    let aliquotaEfetiva: number;
    if (receitaBruta12Meses > 0) {
      aliquotaEfetiva = ((receitaBruta12Meses * tabelaFaixa.aliquota / 100) - tabelaFaixa.desconto) / receitaBruta12Meses * 100;
    } else {
      aliquotaEfetiva = tabelaFaixa.aliquota;
    }
    aliquotaEfetiva = Math.max(0, aliquotaEfetiva);

    // Calcular DAS
    const valorDas = this.round2(receitaMes * aliquotaEfetiva / 100);

    // Repartição
    const reparticao = this.calcularReparticao(valorDas, anexo);

    return {
      receitaBruta12Meses,
      receitaMes,
      anexo,
      faixa,
      aliquotaTabela: tabelaFaixa.aliquota,
      desconto: tabelaFaixa.desconto,
      aliquotaEfetiva: this.round2(aliquotaEfetiva),
      valorDas,
      reparticao,
    };
  }

  /**
   * Calcula o Fator R para Anexo III/V
   * Fator R >= 0.28 → Anexo III (menor carga)
   * Fator R < 0.28  → Anexo V (maior carga)
   */
  calcularFatorR(folhaSalarial12Meses: number, receitaBruta12Meses: number): number {
    if (receitaBruta12Meses === 0) return 0;
    return this.round4(folhaSalarial12Meses / receitaBruta12Meses);
  }

  /**
   * Compara regimes tributários para um cenário
   */
  compararRegimes(faturamentoAnual: number, uf: string): Record<string, any> {
    const simples = this.calcularDAS(faturamentoAnual, faturamentoAnual / 12, 'I');
    const presumido = this.estimarLucroPresumido(faturamentoAnual);
    const real = this.estimarLucroReal(faturamentoAnual);

    const resultados: Record<string, any> = {
      simples: { regime: 'Simples Nacional', ...simples, totalAnual: simples.valorDas * 12 },
      presumido: { regime: 'Lucro Presumido', ...presumido },
      real: { regime: 'Lucro Real', ...real },
    };

    // Determinar melhor regime
    const totais = {
      simples: simples.valorDas * 12,
      presumido: presumido.totalAnual,
      real: real.totalAnual,
    };

    const melhor = Object.entries(totais).sort((a, b) => a[1] - b[1])[0];

    return {
      comparacao: resultados,
      recomendacao: melhor[0],
      economiaPotencial: this.round2(Math.max(...Object.values(totais)) - melhor[1]),
    };
  }

  private determinarFaixa(receita: number, anexo: string): number {
    const tabela = this.TABELAS[anexo];
    for (let f = 1; f <= 6; f++) {
      if (receita <= tabela[f].receitaBrutaMax) return f;
    }
    return 6;
  }

  private calcularReparticao(valorDas: number, anexo: string): Record<string, number> {
    const percentuais = this.REPARTICAO[anexo] || this.REPARTICAO.I;
    const resultado: Record<string, number> = {};
    for (const [imposto, perc] of Object.entries(percentuais)) {
      resultado[imposto] = this.round2(valorDas * perc);
    }
    return resultado;
  }

  private estimarLucroPresumido(faturamento: number) {
    const baseIRPJ = faturamento * 0.08; // 8% comércio
    const irpj = baseIRPJ * 0.15;
    const adicional = Math.max(0, baseIRPJ - 60000) * 0.10;
    const csll = faturamento * 0.12 * 0.09;
    const pis = faturamento * 0.0065;
    const cofins = faturamento * 0.03;
    const totalAnual = this.round2(irpj + adicional + csll + pis + cofins);

    return {
      irpj: this.round2(irpj), adicional: this.round2(adicional),
      csll: this.round2(csll), pis: this.round2(pis), cofins: this.round2(cofins),
      totalAnual,
    };
  }

  private estimarLucroReal(faturamento: number) {
    // Estimativa simplificada (margem líquida ~10%)
    const lucroEstimado = faturamento * 0.10;
    const irpj = lucroEstimado * 0.15;
    const adicional = Math.max(0, lucroEstimado - 60000) * 0.10;
    const csll = lucroEstimado * 0.09;
    const pis = faturamento * 0.0165;
    const cofins = faturamento * 0.076;
    const totalAnual = this.round2(irpj + adicional + csll + pis + cofins);

    return {
      irpj: this.round2(irpj), adicional: this.round2(adicional),
      csll: this.round2(csll), pis: this.round2(pis), cofins: this.round2(cofins),
      totalAnual,
    };
  }

  private round2(v: number): number { return Math.round(v * 100) / 100; }
  private round4(v: number): number { return Math.round(v * 10000) / 10000; }
}
