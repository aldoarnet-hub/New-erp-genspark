import { Injectable, Logger } from '@nestjs/common';
import { ResultadoTributario, ContextoTributario } from './motor-tributario.service';
import { SeveridadeAlerta } from '../enums/fiscal.enums';

export interface AlertaFiscal {
  severidade: string;
  campo: string;
  mensagem: string;
}

/**
 * Valida consistência de cálculos tributários e alerta sobre inconsistências
 */
@Injectable()
export class ValidadorTributarioService {
  private readonly logger = new Logger(ValidadorTributarioService.name);

  /**
   * Valida uma operação fiscal e retorna alertas
   */
  validarOperacao(
    resultado: ResultadoTributario,
    contexto: ContextoTributario,
  ): AlertaFiscal[] {
    const alertas: AlertaFiscal[] = [];

    alertas.push(...this.validarICMS(resultado, contexto));
    alertas.push(...this.validarICMSST(resultado, contexto));
    alertas.push(...this.validarPISCOFINS(resultado, contexto));
    alertas.push(...this.validarConsistenciaGeral(resultado, contexto));

    if (alertas.length > 0) {
      this.logger.warn(`${alertas.length} alertas encontrados na validação fiscal`);
    }

    return alertas;
  }

  private validarICMS(resultado: ResultadoTributario, contexto: ContextoTributario): AlertaFiscal[] {
    const alertas: AlertaFiscal[] = [];

    // CST 000 (Tributada integralmente) requer alíquota > 0
    if (resultado.icmsCst === '000' && resultado.icmsAliquota === 0) {
      alertas.push({
        severidade: SeveridadeAlerta.ERRO,
        campo: 'icms_aliquota',
        mensagem: 'CST 000 (Tributada integralmente) requer alíquota > 0',
      });
    }

    // CST 040/041/050 não deve ter valor de ICMS
    if (['040', '041', '050'].includes(resultado.icmsCst) && resultado.icmsValor > 0) {
      alertas.push({
        severidade: SeveridadeAlerta.ERRO,
        campo: 'icms_valor',
        mensagem: `CST ${resultado.icmsCst} não deve ter valor de ICMS`,
      });
    }

    // Verificar DIFAL em operações interestaduais com não contribuinte
    if (contexto.ufOrigem !== contexto.ufDestino && !contexto.contribuinteIcms && !resultado.difalAplica) {
      alertas.push({
        severidade: SeveridadeAlerta.ALERTA,
        campo: 'difal',
        mensagem: 'Operação interestadual com não contribuinte deveria calcular DIFAL',
      });
    }

    // Alíquota acima do esperado
    if (resultado.icmsAliquota > 25) {
      alertas.push({
        severidade: SeveridadeAlerta.ALERTA,
        campo: 'icms_aliquota',
        mensagem: `Alíquota ICMS muito alta (${resultado.icmsAliquota}%). Verificar configuração.`,
      });
    }

    return alertas;
  }

  private validarICMSST(resultado: ResultadoTributario, contexto: ContextoTributario): AlertaFiscal[] {
    const alertas: AlertaFiscal[] = [];

    // MVA muito alta
    if (resultado.icmsStMva > 150) {
      alertas.push({
        severidade: SeveridadeAlerta.ALERTA,
        campo: 'icms_st_mva',
        mensagem: `MVA muito alta (${resultado.icmsStMva}%). Verificar se está correta.`,
      });
    }

    // CST incompatível com ST
    const cstsComST = ['010', '030', '060', '070', '201', '202', '203'];
    if (resultado.icmsStValor > 0 && !cstsComST.includes(resultado.icmsCst)) {
      alertas.push({
        severidade: SeveridadeAlerta.ERRO,
        campo: 'icms_cst',
        mensagem: `CST ${resultado.icmsCst} não é compatível com ICMS-ST`,
      });
    }

    return alertas;
  }

  private validarPISCOFINS(resultado: ResultadoTributario, contexto: ContextoTributario): AlertaFiscal[] {
    const alertas: AlertaFiscal[] = [];

    // CST PIS e COFINS devem ser compatíveis
    const tributados = ['01', '02'];
    const naoTributados = ['04', '05', '06', '07', '08', '09'];

    if (
      (tributados.includes(resultado.pisCst) && naoTributados.includes(resultado.cofinsCst)) ||
      (naoTributados.includes(resultado.pisCst) && tributados.includes(resultado.cofinsCst))
    ) {
      alertas.push({
        severidade: SeveridadeAlerta.ALERTA,
        campo: 'pis_cofins_cst',
        mensagem: 'CST de PIS e COFINS parecem incompatíveis',
      });
    }

    // Simples Nacional não deve ter PIS/COFINS destacado
    if (contexto.regimeEmpresa === '1' && (resultado.pisValor > 0 || resultado.cofinsValor > 0)) {
      alertas.push({
        severidade: SeveridadeAlerta.ERRO,
        campo: 'pis_cofins_simples',
        mensagem: 'Simples Nacional não destaca PIS/COFINS (já incluídos no DAS)',
      });
    }

    return alertas;
  }

  private validarConsistenciaGeral(resultado: ResultadoTributario, contexto: ContextoTributario): AlertaFiscal[] {
    const alertas: AlertaFiscal[] = [];

    // Soma dos impostos deve bater com total
    const impostosCalculados =
      resultado.icmsValor + resultado.icmsStValor +
      resultado.ipiValor + resultado.pisValor +
      resultado.cofinsValor + resultado.difalValor + resultado.fcpValor;

    if (Math.abs(impostosCalculados - resultado.valorTotalImpostos) > 0.02) {
      alertas.push({
        severidade: SeveridadeAlerta.ERRO,
        campo: 'valor_total_impostos',
        mensagem: `Divergência no total de impostos: calculado=${impostosCalculados.toFixed(2)}, informado=${resultado.valorTotalImpostos.toFixed(2)}`,
      });
    }

    // Carga tributária excessiva
    if (resultado.valorTotalProdutos > 0) {
      const carga = (resultado.valorTotalImpostos / resultado.valorTotalProdutos) * 100;
      if (carga > 50) {
        alertas.push({
          severidade: SeveridadeAlerta.ALERTA,
          campo: 'carga_tributaria',
          mensagem: `Carga tributária muito alta (${carga.toFixed(2)}%). Verificar configurações.`,
        });
      }
    }

    return alertas;
  }
}
