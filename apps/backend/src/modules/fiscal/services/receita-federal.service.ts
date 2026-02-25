import { Injectable, Logger } from '@nestjs/common';

/**
 * Servico de integracao com a Receita Federal do Brasil
 * - Consulta de CNPJ
 * - Validacao de CPF/CNPJ
 * - Consulta situacao cadastral
 *
 * Em producao: integrar com APIs oficiais e/ou servicos terceirizados
 * com autenticacao por certificado digital.
 */
@Injectable()
export class ReceitaFederalService {
  private readonly logger = new Logger(ReceitaFederalService.name);

  /**
   * Consulta dados cadastrais de um CNPJ na Receita Federal
   */
  async consultarCnpj(cnpj: string): Promise<{
    sucesso: boolean;
    cnpj: string;
    razaoSocial?: string;
    nomeFantasia?: string;
    situacaoCadastral?: string;
    dataSituacao?: string;
    motivoSituacao?: string;
    naturezaJuridica?: string;
    cnaePrincipal?: { codigo: string; descricao: string };
    cnaeSecundarios?: Array<{ codigo: string; descricao: string }>;
    endereco?: {
      logradouro: string;
      numero: string;
      complemento: string;
      bairro: string;
      cep: string;
      municipio: string;
      uf: string;
    };
    telefone?: string;
    email?: string;
    capitalSocial?: number;
    simplesNacional?: { optante: boolean; dataOpcao?: string; dataExclusao?: string };
    mei?: { optante: boolean };
    erro?: string;
  }> {
    const cnpjLimpo = cnpj.replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      return { sucesso: false, cnpj: cnpjLimpo, erro: 'CNPJ deve ter 14 digitos' };
    }

    if (!this.validarCnpj(cnpjLimpo)) {
      return { sucesso: false, cnpj: cnpjLimpo, erro: 'CNPJ invalido (digito verificador incorreto)' };
    }

    this.logger.log(`Consultando CNPJ: ${cnpjLimpo}`);

    // Em producao: chamar API da Receita Federal
    // Stub: retornar dados simulados
    try {
      return {
        sucesso: true,
        cnpj: cnpjLimpo,
        razaoSocial: 'EMPRESA DEMONSTRACAO LTDA',
        nomeFantasia: 'EMPRESA DEMO',
        situacaoCadastral: 'ATIVA',
        dataSituacao: '2020-01-15',
        motivoSituacao: undefined,
        naturezaJuridica: '206-2 - Sociedade Empresaria Limitada',
        cnaePrincipal: { codigo: '4744099', descricao: 'Comercio varejista de materiais de construcao em geral' },
        cnaeSecundarios: [
          { codigo: '4744001', descricao: 'Comercio varejista de ferragens e ferramentas' },
          { codigo: '4744002', descricao: 'Comercio varejista de madeira e artefatos' },
        ],
        endereco: {
          logradouro: 'Rua Demonstracao',
          numero: '100',
          complemento: 'Sala 1',
          bairro: 'Centro',
          cep: '01001000',
          municipio: 'Sao Paulo',
          uf: 'SP',
        },
        telefone: '1133334444',
        email: 'contato@empresa-demo.com.br',
        capitalSocial: 100000.00,
        simplesNacional: { optante: false },
        mei: { optante: false },
      };
    } catch (error) {
      this.logger.error(`Erro ao consultar CNPJ ${cnpjLimpo}: ${error.message}`);
      return { sucesso: false, cnpj: cnpjLimpo, erro: `Erro na consulta: ${error.message}` };
    }
  }

  /**
   * Valida CPF
   */
  validarCpf(cpf: string): boolean {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;

    // Primeiro digito
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpfLimpo[i]) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpfLimpo[9])) return false;

    // Segundo digito
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpfLimpo[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    return resto === parseInt(cpfLimpo[10]);
  }

  /**
   * Valida CNPJ
   */
  validarCnpj(cnpj: string): boolean {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    // Primeiro digito
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpjLimpo[i]) * pesos1[i];
    }
    let resto = soma % 11;
    const dig1 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cnpjLimpo[12]) !== dig1) return false;

    // Segundo digito
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpjLimpo[i]) * pesos2[i];
    }
    resto = soma % 11;
    const dig2 = resto < 2 ? 0 : 11 - resto;
    return parseInt(cnpjLimpo[13]) === dig2;
  }

  /**
   * Consulta situacao cadastral resumida
   */
  async consultarSituacao(cnpj: string): Promise<{
    cnpj: string;
    situacao: string;
    ativa: boolean;
  }> {
    const resultado = await this.consultarCnpj(cnpj);
    return {
      cnpj: resultado.cnpj,
      situacao: resultado.situacaoCadastral || 'DESCONHECIDA',
      ativa: resultado.situacaoCadastral === 'ATIVA',
    };
  }
}
