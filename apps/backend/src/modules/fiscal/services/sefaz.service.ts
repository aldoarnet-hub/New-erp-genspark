import { Injectable, Logger } from '@nestjs/common';
import { CertificadoDigitalService } from './certificado-digital.service';

/**
 * Servico de integracao com webservices da SEFAZ.
 * Autorização, consulta, cancelamento, inutilização, CC-e.
 * Em producao: usar SOAP com certificado SSL mTLS.
 */
@Injectable()
export class SefazService {
  private readonly logger = new Logger(SefazService.name);

  // URLs dos webservices por UF e ambiente (resumido)
  private readonly WEBSERVICES: Record<string, Record<string, Record<string, string>>> = {
    SP: {
      producao: {
        recepcao: 'https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
        retorno: 'https://nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
        consulta: 'https://nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
        status: 'https://nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
        cancelamento: 'https://nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
        inutilizacao: 'https://nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      },
      homologacao: {
        recepcao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx',
        retorno: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferetautorizacao4.asmx',
        consulta: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeconsultaprotocolo4.asmx',
        status: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfestatusservico4.asmx',
        cancelamento: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nferecepcaoevento4.asmx',
        inutilizacao: 'https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeinutilizacao4.asmx',
      },
    },
    SVRS: {
      producao: {
        recepcao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
        retorno: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
        consulta: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
        status: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
        cancelamento: 'https://nfe.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
        inutilizacao: 'https://nfe.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      },
      homologacao: {
        recepcao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
        retorno: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
        consulta: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
        status: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
        cancelamento: 'https://nfe-homologacao.svrs.rs.gov.br/ws/recepcaoevento/recepcaoevento4.asmx',
        inutilizacao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/nfeinutilizacao/nfeinutilizacao4.asmx',
      },
    },
  };

  // Estados que usam SVRS
  private readonly SVRS_UFS = [
    'AC', 'AL', 'AP', 'DF', 'ES', 'MG', 'PB', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'TO',
  ];

  constructor(private readonly certService: CertificadoDigitalService) {}

  /**
   * Envia lote de NF-e para a SEFAZ
   */
  async enviarLote(xmlNfe: string, idLote: string, uf: string, ambiente: string = '2'): Promise<{
    sucesso: boolean;
    cStat: string;
    xMotivo: string;
    nRec?: string;
    dhRecbto?: string;
  }> {
    this.logger.log(`Enviando lote ${idLote} para SEFAZ UF=${uf} ambiente=${ambiente}`);

    const url = this.getUrl(uf, ambiente, 'recepcao');
    this.logger.log(`URL: ${url}`);

    // Em producao: montar envelope SOAP, enviar com certificado mTLS
    // Stub: simular resposta de homologacao
    return {
      sucesso: true,
      cStat: '103',
      xMotivo: 'Lote recebido com sucesso',
      nRec: `${Date.now()}`.substring(0, 15),
      dhRecbto: new Date().toISOString(),
    };
  }

  /**
   * Consulta processamento do lote pelo numero do recibo
   */
  async consultarRecibo(nRecibo: string, uf: string, ambiente: string = '2'): Promise<{
    sucesso: boolean;
    cStat: string;
    xMotivo: string;
    protocolos?: Array<{
      chaveAcesso: string;
      cStat: string;
      xMotivo: string;
      nProt: string;
      dhRecbto: string;
    }>;
  }> {
    this.logger.log(`Consultando recibo ${nRecibo}`);

    // Stub
    return {
      sucesso: true,
      cStat: '104',
      xMotivo: 'Lote processado',
      protocolos: [{
        chaveAcesso: '35000000000000000000550010000000011000000010',
        cStat: '100',
        xMotivo: 'Autorizado o uso da NF-e',
        nProt: `${Date.now()}`.substring(0, 15),
        dhRecbto: new Date().toISOString(),
      }],
    };
  }

  /**
   * Cancela uma NF-e autorizada
   */
  async cancelarNfe(
    chaveAcesso: string,
    protocolo: string,
    justificativa: string,
    uf: string,
    ambiente: string = '2',
  ): Promise<{ sucesso: boolean; cStat: string; xMotivo: string; nProt?: string }> {
    this.logger.log(`Cancelando NF-e chave=${chaveAcesso}`);

    if (justificativa.length < 15) {
      return { sucesso: false, cStat: '999', xMotivo: 'Justificativa deve ter no minimo 15 caracteres' };
    }

    // Stub
    return {
      sucesso: true,
      cStat: '101',
      xMotivo: 'Cancelamento de NF-e homologado',
      nProt: `${Date.now()}`.substring(0, 15),
    };
  }

  /**
   * Envia Carta de Correcao Eletronica (CC-e)
   */
  async cartaCorrecao(
    chaveAcesso: string,
    correcao: string,
    sequencia: number,
    uf: string,
    ambiente: string = '2',
  ): Promise<{ sucesso: boolean; cStat: string; xMotivo: string; nProt?: string }> {
    this.logger.log(`CC-e chave=${chaveAcesso} seq=${sequencia}`);

    if (correcao.length > 1000) {
      return { sucesso: false, cStat: '999', xMotivo: 'Correcao excede 1000 caracteres' };
    }

    // Stub
    return {
      sucesso: true,
      cStat: '135',
      xMotivo: 'Evento registrado e vinculado a NF-e',
      nProt: `${Date.now()}`.substring(0, 15),
    };
  }

  /**
   * Inutiliza numeracao de NF-e
   */
  async inutilizarNumeracao(
    ano: number, cnpj: string, serie: number,
    numeroInicial: number, numeroFinal: number,
    justificativa: string, uf: string, ambiente: string = '2',
  ): Promise<{ sucesso: boolean; cStat: string; xMotivo: string; nProt?: string }> {
    this.logger.log(`Inutilizacao serie=${serie} ${numeroInicial}-${numeroFinal}`);

    // Stub
    return {
      sucesso: true,
      cStat: '102',
      xMotivo: 'Inutilizacao de numero homologado',
      nProt: `${Date.now()}`.substring(0, 15),
    };
  }

  /**
   * Consulta status do servico SEFAZ
   */
  async consultarStatusServico(uf: string, ambiente: string = '2'): Promise<{
    sucesso: boolean; cStat: string; xMotivo: string; dhRecbto: string;
  }> {
    this.logger.log(`Consultando status SEFAZ UF=${uf}`);

    // Stub
    return {
      sucesso: true,
      cStat: '107',
      xMotivo: 'Servico em Operacao',
      dhRecbto: new Date().toISOString(),
    };
  }

  /**
   * Consulta NF-e pelo protocolo ou chave de acesso
   */
  async consultarNfe(chaveAcesso: string, uf: string, ambiente: string = '2'): Promise<{
    sucesso: boolean; cStat: string; xMotivo: string; nProt?: string; xml?: string;
  }> {
    this.logger.log(`Consultando NF-e chave=${chaveAcesso}`);

    // Stub
    return {
      sucesso: true,
      cStat: '100',
      xMotivo: 'Autorizado o uso da NF-e',
      nProt: `${Date.now()}`.substring(0, 15),
    };
  }

  /**
   * Manifestacao do destinatario
   */
  async manifestarDestinatario(
    chaveAcesso: string,
    tipoManifestacao: string,
    justificativa?: string,
    uf?: string,
    ambiente: string = '2',
  ): Promise<{ sucesso: boolean; cStat: string; xMotivo: string }> {
    this.logger.log(`Manifestacao tipo=${tipoManifestacao} chave=${chaveAcesso}`);

    const tiposValidos: Record<string, string> = {
      '210200': 'Confirmacao da Operacao',
      '210210': 'Ciencia da Operacao',
      '210220': 'Desconhecimento da Operacao',
      '210240': 'Operacao nao Realizada',
    };

    if (!tiposValidos[tipoManifestacao]) {
      return { sucesso: false, cStat: '999', xMotivo: 'Tipo de manifestacao invalido' };
    }

    // Stub
    return {
      sucesso: true,
      cStat: '135',
      xMotivo: `Evento ${tiposValidos[tipoManifestacao]} registrado`,
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private getUrl(uf: string, ambiente: string, servico: string): string {
    const sefaz = this.SVRS_UFS.includes(uf) ? 'SVRS' : uf;
    const amb = ambiente === '1' ? 'producao' : 'homologacao';
    return this.WEBSERVICES[sefaz]?.[amb]?.[servico] || this.WEBSERVICES['SVRS'][amb][servico];
  }
}
