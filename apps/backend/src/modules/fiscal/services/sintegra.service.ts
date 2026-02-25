import { Injectable, Logger } from '@nestjs/common';

/**
 * Servico de integracao com SINTEGRA (Sistema Integrado de Informacoes
 * sobre Operacoes Interestaduais com Mercadorias e Servicos)
 *
 * - Validacao de Inscricao Estadual por UF
 * - Consulta de situacao cadastral estadual
 *
 * Em producao: integrar com webservices estaduais ou SEFAZ via certificado.
 */
@Injectable()
export class SintegraService {
  private readonly logger = new Logger(SintegraService.name);

  // Formatos de IE por UF (regex para validacao basica)
  private readonly FORMATOS_IE: Record<string, RegExp> = {
    AC: /^\d{13}$/,
    AL: /^24\d{7}$/,
    AM: /^\d{9}$/,
    AP: /^03\d{7}$/,
    BA: /^\d{8,9}$/,
    CE: /^\d{9}$/,
    DF: /^07\d{11}$/,
    ES: /^\d{9}$/,
    GO: /^(10|11|15|20|29)\d{7}$/,
    MA: /^12\d{7}$/,
    MG: /^\d{13}$/,
    MS: /^28\d{7}$/,
    MT: /^\d{11}$/,
    PA: /^15\d{7}$/,
    PB: /^\d{9}$/,
    PE: /^\d{14}$/,
    PI: /^\d{9}$/,
    PR: /^\d{10}$/,
    RJ: /^\d{8}$/,
    RN: /^(20)\d{7,8}$/,
    RO: /^\d{14}$/,
    RR: /^24\d{6}$/,
    RS: /^\d{10}$/,
    SC: /^\d{9}$/,
    SE: /^\d{9}$/,
    SP: /^\d{12}$/,
    TO: /^\d{11}$/,
  };

  /**
   * Valida Inscricao Estadual (IE) conforme regras de cada UF
   */
  validarIE(uf: string, ie: string): {
    valido: boolean;
    uf: string;
    ie: string;
    mensagem: string;
  } {
    const ieLimpa = ie.replace(/\D/g, '');

    if (!ieLimpa || ieLimpa.toUpperCase() === 'ISENTO') {
      return { valido: true, uf, ie: 'ISENTO', mensagem: 'Contribuinte isento de IE' };
    }

    const formato = this.FORMATOS_IE[uf.toUpperCase()];
    if (!formato) {
      return {
        valido: false,
        uf,
        ie: ieLimpa,
        mensagem: `UF ${uf} nao suportada para validacao de IE`,
      };
    }

    // Validacao de formato basico
    if (!formato.test(ieLimpa)) {
      return {
        valido: false,
        uf,
        ie: ieLimpa,
        mensagem: `IE ${ieLimpa} nao corresponde ao formato esperado para ${uf}`,
      };
    }

    // Validacao de digito verificador por UF
    let dvValido = true;
    switch (uf.toUpperCase()) {
      case 'SP':
        dvValido = this.validarIESP(ieLimpa);
        break;
      case 'RJ':
        dvValido = this.validarIERJ(ieLimpa);
        break;
      case 'MG':
        dvValido = this.validarIEMG(ieLimpa);
        break;
      case 'RS':
        dvValido = this.validarIERS(ieLimpa);
        break;
      case 'PR':
        dvValido = this.validarIEPR(ieLimpa);
        break;
      default:
        // Para UFs sem validacao de DV especifica, aceita se formato bateu
        dvValido = true;
    }

    if (!dvValido) {
      return {
        valido: false,
        uf,
        ie: ieLimpa,
        mensagem: `IE ${ieLimpa} para ${uf}: digito verificador invalido`,
      };
    }

    return {
      valido: true,
      uf,
      ie: ieLimpa,
      mensagem: `IE ${ieLimpa} valida para ${uf}`,
    };
  }

  /**
   * Consulta situacao cadastral de IE no SINTEGRA
   * Em producao: chamar webservice estadual
   */
  async consultarIE(uf: string, ie: string): Promise<{
    sucesso: boolean;
    uf: string;
    ie: string;
    razaoSocial?: string;
    situacao?: string;
    cnpj?: string;
    endereco?: string;
    dataConsulta: string;
    erro?: string;
  }> {
    this.logger.log(`Consultando IE ${ie} UF=${uf} no SINTEGRA`);

    const validacao = this.validarIE(uf, ie);
    if (!validacao.valido) {
      return {
        sucesso: false,
        uf,
        ie,
        dataConsulta: new Date().toISOString(),
        erro: validacao.mensagem,
      };
    }

    // Stub: em producao consultar webservice SINTEGRA ou SEFAZ
    return {
      sucesso: true,
      uf,
      ie: validacao.ie,
      razaoSocial: 'EMPRESA CONSULTADA LTDA',
      situacao: 'HABILITADO',
      cnpj: '00000000000000',
      endereco: `Endereco exemplo - ${uf}`,
      dataConsulta: new Date().toISOString(),
    };
  }

  /**
   * Consulta multiplas IEs em lote
   */
  async consultarLoteIE(
    consultas: Array<{ uf: string; ie: string }>,
  ): Promise<Array<{ uf: string; ie: string; valido: boolean; situacao: string }>> {
    const resultados: Array<{ uf: string; ie: string; valido: boolean; situacao: string }> = [];

    for (const consulta of consultas) {
      const resultado = await this.consultarIE(consulta.uf, consulta.ie);
      resultados.push({
        uf: consulta.uf,
        ie: consulta.ie,
        valido: resultado.sucesso,
        situacao: resultado.situacao || 'ERRO',
      });
    }

    return resultados;
  }

  // ============================================================
  // Validacoes de DV por UF
  // ============================================================

  /** SP: modulo 11, pesos 1,3,4,5,6,7,8,10 para posicoes 0-7, DV na posicao 8 e 11 */
  private validarIESP(ie: string): boolean {
    if (ie.length !== 12) return false;
    const pesos1 = [1, 3, 4, 5, 6, 7, 8, 10];
    let soma = 0;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(ie[i]) * pesos1[i];
    }
    let resto = soma % 11;
    const dv1 = resto >= 10 ? 0 : resto;
    if (parseInt(ie[8]) !== dv1) return false;

    const pesos2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    soma = 0;
    for (let i = 0; i < 11; i++) {
      soma += parseInt(ie[i]) * pesos2[i];
    }
    resto = soma % 11;
    const dv2 = resto >= 10 ? 0 : resto;
    return parseInt(ie[11]) === dv2;
  }

  /** RJ: modulo 11, pesos 2,7,6,5,4,3,2 */
  private validarIERJ(ie: string): boolean {
    if (ie.length !== 8) return false;
    const pesos = [2, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 7; i++) {
      soma += parseInt(ie[i]) * pesos[i];
    }
    const resto = soma % 11;
    const dv = resto <= 1 ? 0 : 11 - resto;
    return parseInt(ie[7]) === dv;
  }

  /** MG: modulo 10 primeiro DV, modulo 11 segundo DV */
  private validarIEMG(ie: string): boolean {
    if (ie.length !== 13) return false;
    // Simplificacao: aceitar se formato OK
    return true;
  }

  /** RS: modulo 11, pesos 2,9,8,7,6,5,4,3,2 */
  private validarIERS(ie: string): boolean {
    if (ie.length !== 10) return false;
    const pesos = [2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(ie[i]) * pesos[i];
    }
    const resto = soma % 11;
    const dv = resto <= 1 ? 0 : 11 - resto;
    return parseInt(ie[9]) === dv;
  }

  /** PR: modulo 11, pesos 3,2,7,6,5,4,3,2 */
  private validarIEPR(ie: string): boolean {
    if (ie.length !== 10) return false;
    const pesos1 = [3, 2, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(ie[i]) * pesos1[i];
    }
    let resto = soma % 11;
    const dv1 = resto <= 1 ? 0 : 11 - resto;
    if (parseInt(ie[8]) !== dv1) return false;

    const pesos2 = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(ie[i]) * pesos2[i];
    }
    resto = soma % 11;
    const dv2 = resto <= 1 ? 0 : 11 - resto;
    return parseInt(ie[9]) === dv2;
  }
}
