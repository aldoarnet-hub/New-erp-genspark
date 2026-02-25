import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import { NfE } from '../entities/nfe.entity';
import { SefazService } from './sefaz.service';

/**
 * Servico de contingencia para NF-e/NFC-e
 *
 * Modos suportados:
 * - SVC-AN (tpEmis=6): Sefaz Virtual de Contingencia - Ambiente Nacional (AN)
 * - SVC-RS (tpEmis=7): Sefaz Virtual de Contingencia - SVRS
 * - SCAN (tpEmis=3): Deprecated, substituido por SVC
 * - EPEC (tpEmis=4): Evento Previo de Emissao em Contingencia
 * - FS-DA (tpEmis=5): Formulario de Seguranca - Documento Auxiliar (impressao)
 * - NFC-e Offline (tpEmis=9): Contingencia offline para NFC-e
 *
 * Legislacao: NT 2015.003 e Ajuste SINIEF 07/2005
 */

// UFs por autorizador SVC
const SVC_AN_UFS = ['AM', 'BA', 'CE', 'GO', 'MA', 'MS', 'MT', 'PA', 'PE', 'PI'];
const SVC_RS_UFS = ['AC', 'AL', 'AP', 'DF', 'ES', 'MG', 'PB', 'PR', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'SP', 'TO'];

interface ContingenciaStatus {
  ativo: boolean;
  tipo: string; // SVC-AN, SVC-RS, EPEC, FS-DA, NFC-e Offline
  motivo: string;
  dataInicio: Date;
  dataFim?: Date;
  nfePendentes: number;
}

@Injectable()
export class ContingenciaService {
  private readonly logger = new Logger(ContingenciaService.name);

  // URLs SVC-AN (Ambiente Nacional)
  private readonly SVC_AN_URLS: Record<string, Record<string, string>> = {
    producao: {
      recepcao: 'https://www.svc.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retorno: 'https://www.svc.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consulta: 'https://www.svc.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      status: 'https://www.svc.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
    },
    homologacao: {
      recepcao: 'https://hom.svc.fazenda.gov.br/NFeAutorizacao4/NFeAutorizacao4.asmx',
      retorno: 'https://hom.svc.fazenda.gov.br/NFeRetAutorizacao4/NFeRetAutorizacao4.asmx',
      consulta: 'https://hom.svc.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx',
      status: 'https://hom.svc.fazenda.gov.br/NFeStatusServico4/NFeStatusServico4.asmx',
    },
  };

  // URLs SVC-RS
  private readonly SVC_RS_URLS: Record<string, Record<string, string>> = {
    producao: {
      recepcao: 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retorno: 'https://nfe.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consulta: 'https://nfe.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      status: 'https://nfe.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
    },
    homologacao: {
      recepcao: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx',
      retorno: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeRetAutorizacao/NFeRetAutorizacao4.asmx',
      consulta: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeConsulta/NfeConsulta4.asmx',
      status: 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeStatusServico/NfeStatusServico4.asmx',
    },
  };

  constructor(
    @InjectRepository(EmpresaFiscal)
    private readonly empresaRepo: Repository<EmpresaFiscal>,
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
    private readonly sefaz: SefazService,
  ) {}

  /**
   * Verifica se a SEFAZ esta indisponivel e sugere modo de contingencia
   */
  async verificarNecessidadeContingencia(uf: string, ambiente: string = '2'): Promise<{
    sefazDisponivel: boolean;
    modoContingencia?: string;
    urlsContingencia?: Record<string, string>;
  }> {
    try {
      const status = await this.sefaz.consultarStatusServico(uf, ambiente);
      if (status.sucesso && status.cStat === '107') {
        return { sefazDisponivel: true };
      }
      return {
        sefazDisponivel: false,
        modoContingencia: this.getModoContingencia(uf),
        urlsContingencia: this.getUrlsContingencia(uf, ambiente),
      };
    } catch (_error) {
      return {
        sefazDisponivel: false,
        modoContingencia: this.getModoContingencia(uf),
        urlsContingencia: this.getUrlsContingencia(uf, ambiente),
      };
    }
  }

  /**
   * Determina o modo de contingencia adequado para a UF
   */
  getModoContingencia(uf: string): string {
    if (SVC_AN_UFS.includes(uf)) return 'SVC-AN';
    if (SVC_RS_UFS.includes(uf)) return 'SVC-RS';
    return 'SVC-RS'; // Default
  }

  /**
   * Retorna tipo de emissao (tpEmis) para o modo de contingencia
   */
  getTpEmis(modoContingencia: string): string {
    const modos: Record<string, string> = {
      'SVC-AN': '6',
      'SVC-RS': '7',
      'SCAN': '3',
      'EPEC': '4',
      'FS-DA': '5',
      'NFC-e Offline': '9',
    };
    return modos[modoContingencia] || '1';
  }

  /**
   * Retorna URLs do webservice de contingencia
   */
  getUrlsContingencia(uf: string, ambiente: string): Record<string, string> {
    const amb = ambiente === '1' ? 'producao' : 'homologacao';
    if (SVC_AN_UFS.includes(uf)) {
      return this.SVC_AN_URLS[amb];
    }
    return this.SVC_RS_URLS[amb];
  }

  /**
   * Lista NF-e pendentes de transmissao apos contingencia
   */
  async listarPendentesContingencia(tenantId: string): Promise<NfE[]> {
    return this.nfeRepo.find({
      where: { tenantId, status: 'contingencia' },
      order: { dataEmissao: 'ASC' },
    });
  }

  /**
   * Retransmite NF-e emitidas em contingencia para a SEFAZ normal
   */
  async retransmitirContingencia(
    tenantId: string, nfeId: string, uf: string, ambiente: string = '2',
  ): Promise<{ sucesso: boolean; status: string; mensagem: string }> {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) return { sucesso: false, status: 'erro', mensagem: 'NF-e nao encontrada' };
    if (nfe.status !== 'contingencia') {
      return { sucesso: false, status: 'ignorada', mensagem: 'NF-e nao esta em contingencia' };
    }

    if (!nfe.xmlAssinado) {
      return { sucesso: false, status: 'erro', mensagem: 'XML assinado nao encontrado' };
    }

    try {
      const resultado = await this.sefaz.enviarLote(nfe.xmlAssinado, String(Date.now()), uf, ambiente);
      if (resultado.sucesso && resultado.nRec) {
        const retorno = await this.sefaz.consultarRecibo(resultado.nRec, uf, ambiente);
        if (retorno.sucesso && retorno.protocolos?.length) {
          const prot = retorno.protocolos[0];
          nfe.protocoloAutorizacao = prot.nProt;
          nfe.dataAutorizacao = new Date(prot.dhRecbto);
          nfe.status = prot.cStat === '100' ? 'autorizada' : 'rejeitada';
          nfe.motivoStatus = prot.xMotivo;
          await this.nfeRepo.save(nfe);
          return { sucesso: true, status: nfe.status, mensagem: prot.xMotivo };
        }
      }
      return { sucesso: false, status: 'erro', mensagem: resultado.xMotivo };
    } catch (error: any) {
      return { sucesso: false, status: 'erro', mensagem: error.message };
    }
  }

  /**
   * Status geral de contingencia para um tenant
   */
  async getStatusContingencia(tenantId: string): Promise<ContingenciaStatus> {
    const pendentes = await this.nfeRepo.count({ where: { tenantId, status: 'contingencia' } });
    return {
      ativo: pendentes > 0,
      tipo: 'SVC-RS',
      motivo: pendentes > 0 ? 'Existem NF-e emitidas em contingencia pendentes de transmissao' : 'Operacao normal',
      dataInicio: new Date(),
      nfePendentes: pendentes,
    };
  }
}
