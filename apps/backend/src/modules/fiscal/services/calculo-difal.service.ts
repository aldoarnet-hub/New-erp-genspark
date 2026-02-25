import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IcmsAliquotasUf } from '../entities/icms-tabelas.entity';

/**
 * Servico especializado no calculo do DIFAL (Diferencial de Aliquotas)
 * e FCP (Fundo de Combate a Pobreza).
 *
 * Fundamentacao legal:
 * - EC 87/2015: partilha interestadual para consumidor final nao contribuinte
 * - Convenio ICMS 93/2015: regulamentacao da partilha
 * - Desde 2019: 100% destino
 * - Lei Complementar 190/2022: base legal definitiva para DIFAL
 */
@Injectable()
export class CalculoDifalService {
  private readonly logger = new Logger(CalculoDifalService.name);

  // Aliquotas FCP por UF (percentuais vigentes)
  private readonly FCP_POR_UF: Record<string, number> = {
    AC: 2.00, AL: 2.00, AM: 2.00, AP: 2.00, BA: 2.00,
    CE: 2.00, DF: 2.00, ES: 2.00, GO: 2.00, MA: 2.00,
    MG: 2.00, MS: 2.00, MT: 2.00, PA: 2.00, PB: 2.00,
    PE: 2.00, PI: 2.00, PR: 2.00, RJ: 2.00, RN: 2.00,
    RO: 2.00, RR: 2.00, RS: 2.00, SC: 0.00, SE: 2.00,
    SP: 2.00, TO: 2.00,
  };

  // UFs Sul/Sudeste
  private readonly SUL_SUDESTE = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];

  constructor(
    @InjectRepository(IcmsAliquotasUf)
    private readonly aliquotasRepo: Repository<IcmsAliquotasUf>,
  ) {}

  /**
   * Calcula DIFAL completo para operacao interestadual
   * destinada a consumidor final nao-contribuinte.
   */
  async calcularDifal(params: {
    valorBase: number;
    ufOrigem: string;
    ufDestino: string;
    aliquotaInternaDestino?: number;
    aliquotaInterestadual?: number;
    consumidorFinal: boolean;
    contribuinteIcms: boolean;
  }): Promise<{
    aplicaDifal: boolean;
    baseCalculo: number;
    aliquotaInternaDestino: number;
    aliquotaInterestadual: number;
    aliquotaDifal: number;
    valorDifal: number;
    aliquotaFcp: number;
    valorFcp: number;
    valorDifalDestino: number;
    valorDifalOrigem: number;
    partilhaDestinoPercent: number;
    partilhaOrigemPercent: number;
    observacoes: string[];
  }> {
    const observacoes: string[] = [];

    // DIFAL so se aplica em operacao interestadual
    if (params.ufOrigem === params.ufDestino) {
      observacoes.push('Operacao interna - DIFAL nao se aplica');
      return this.resultadoZerado(params.valorBase, observacoes);
    }

    // DIFAL para nao-contribuinte: EC 87/2015
    if (!params.consumidorFinal) {
      observacoes.push('Destinatario nao e consumidor final - DIFAL nao se aplica nesta modalidade');
      return this.resultadoZerado(params.valorBase, observacoes);
    }

    // Buscar aliquotas
    let aliqInterna = params.aliquotaInternaDestino;
    let aliqInter = params.aliquotaInterestadual;

    if (!aliqInterna) {
      aliqInterna = await this.getAliquotaInterna(params.ufDestino);
    }
    if (!aliqInter) {
      aliqInter = this.getAliquotaInterestadual(params.ufOrigem, params.ufDestino);
    }

    // Calcular diferencial
    const aliqDifal = Math.max(0, aliqInterna - aliqInter);

    // FCP
    const aliqFcp = this.FCP_POR_UF[params.ufDestino] || 0;
    const valorFcp = this.round(params.valorBase * aliqFcp / 100);

    // DIFAL
    const valorDifal = this.round(params.valorBase * aliqDifal / 100);

    // Partilha: desde 2019, 100% para destino
    const partilhaDestinoPercent = 100;
    const partilhaOrigemPercent = 0;
    const valorDifalDestino = this.round(valorDifal * partilhaDestinoPercent / 100);
    const valorDifalOrigem = this.round(valorDifal * partilhaOrigemPercent / 100);

    observacoes.push(`DIFAL: Aliq. Interna ${aliqInterna}% - Aliq. Interestadual ${aliqInter}% = ${aliqDifal}%`);
    observacoes.push(`Partilha: 100% destino (${params.ufDestino}) conforme EC 87/2015`);
    if (aliqFcp > 0) {
      observacoes.push(`FCP ${params.ufDestino}: ${aliqFcp}%`);
    }

    // Contribuinte ICMS: DIFAL antecipacao (entrada)
    if (params.contribuinteIcms) {
      observacoes.push('Destinatario contribuinte: DIFAL por antecipacao (responsabilidade do destinatario)');
    } else {
      observacoes.push('Destinatario nao-contribuinte: DIFAL por responsabilidade do remetente');
    }

    return {
      aplicaDifal: true,
      baseCalculo: params.valorBase,
      aliquotaInternaDestino: aliqInterna,
      aliquotaInterestadual: aliqInter,
      aliquotaDifal: aliqDifal,
      valorDifal,
      aliquotaFcp: aliqFcp,
      valorFcp,
      valorDifalDestino,
      valorDifalOrigem,
      partilhaDestinoPercent,
      partilhaOrigemPercent,
      observacoes,
    };
  }

  /**
   * Calcula DIFAL para contribuinte (operacao ativa, antecipacao)
   * Art. 155 §2° VII CF - diferencial entre aliquota interna e interestadual
   */
  async calcularDifalContribuinte(params: {
    valorBase: number;
    ufOrigem: string;
    ufDestino: string;
  }): Promise<{
    valorDifal: number;
    aliquotaInterna: number;
    aliquotaInterestadual: number;
    diferencial: number;
    observacoes: string[];
  }> {
    const aliqInterna = await this.getAliquotaInterna(params.ufDestino);
    const aliqInter = this.getAliquotaInterestadual(params.ufOrigem, params.ufDestino);
    const diferencial = Math.max(0, aliqInterna - aliqInter);
    const valorDifal = this.round(params.valorBase * diferencial / 100);

    return {
      valorDifal,
      aliquotaInterna: aliqInterna,
      aliquotaInterestadual: aliqInter,
      diferencial,
      observacoes: [
        `DIFAL contribuinte: ${aliqInterna}% - ${aliqInter}% = ${diferencial}%`,
        'Recolhimento por antecipacao na entrada',
      ],
    };
  }

  /**
   * Retorna aliquota FCP por UF
   */
  getAliquotaFcp(uf: string): number {
    return this.FCP_POR_UF[uf] || 0;
  }

  /**
   * Retorna aliquota interestadual conforme Convenio 115/2003
   * Sul/Sudeste → Sul/Sudeste = 12%
   * Sul/Sudeste → Outros = 7%
   * Outros → Qualquer = 12%
   */
  getAliquotaInterestadual(ufOrigem: string, ufDestino: string): number {
    if (ufOrigem === ufDestino) return 0; // interna, nao interestadual
    if (this.SUL_SUDESTE.includes(ufOrigem)) {
      return this.SUL_SUDESTE.includes(ufDestino) ? 12 : 7;
    }
    return 12;
  }

  /**
   * Busca aliquota interna do banco ou usa padroes conhecidos
   */
  private async getAliquotaInterna(uf: string): Promise<number> {
    const registro = await this.aliquotasRepo.findOne({
      where: { ufOrigem: uf, ufDestino: uf, ativo: true },
    });
    if (registro?.aliqInterna) return Number(registro.aliqInterna);

    // Padroes conhecidos
    const aliqPadrao: Record<string, number> = {
      SP: 18, RJ: 20, MG: 18, ES: 17, PR: 19.5, SC: 17, RS: 17,
      BA: 20.5, PE: 18, CE: 18, MA: 18, PA: 19, PI: 21, PB: 18,
      RN: 18, AL: 19, SE: 18, MT: 17, MS: 17, GO: 17, DF: 18,
      TO: 18, AM: 18, RO: 17.5, AC: 17, AP: 18, RR: 17,
    };
    return aliqPadrao[uf] || 18;
  }

  private resultadoZerado(valorBase: number, observacoes: string[]) {
    return {
      aplicaDifal: false,
      baseCalculo: valorBase,
      aliquotaInternaDestino: 0,
      aliquotaInterestadual: 0,
      aliquotaDifal: 0,
      valorDifal: 0,
      aliquotaFcp: 0,
      valorFcp: 0,
      valorDifalDestino: 0,
      valorDifalOrigem: 0,
      partilhaDestinoPercent: 0,
      partilhaOrigemPercent: 0,
      observacoes,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
