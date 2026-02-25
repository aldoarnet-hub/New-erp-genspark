import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfE, NfItem, EventoNfe } from '../entities/nfe.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import { DocumentoFiscalArquivado } from '../entities/fiscal-complementar.entity';
import { NfeXmlGeneratorService } from './nfe-xml-generator.service';
import { SefazService } from './sefaz.service';
import { CertificadoDigitalService } from './certificado-digital.service';
import * as crypto from 'crypto';

/**
 * Servico de NFC-e (Nota Fiscal de Consumidor Eletronica) - Modelo 65
 *
 * Funcionalidades:
 * - Emissao de NFC-e com QR Code e CSC
 * - Contingencia offline (tpEmis=9)
 * - DANFE NFC-e simplificado (dados para impressao termica)
 * - Cancelamento e inutilizacao
 *
 * Legislacao: Ajuste SINIEF 07/2005, NT 2015.002, MOC 7.0
 */
@Injectable()
export class NFCeService {
  private readonly logger = new Logger(NFCeService.name);

  // URLs de QR Code por UF e ambiente
  private readonly QRCODE_URLS: Record<string, Record<string, string>> = {
    SP: {
      producao: 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx',
      homologacao: 'https://www.homologacao.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx',
    },
    RS: {
      producao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
      homologacao: 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx',
    },
    DEFAULT: {
      producao: 'https://www.nfce.fazenda.sp.gov.br/qrcode',
      homologacao: 'https://homologacao.nfce.fazenda.sp.gov.br/qrcode',
    },
  };

  // URLs de consulta por chave
  private readonly CONSULTA_URLS: Record<string, Record<string, string>> = {
    SP: {
      producao: 'https://www.nfce.fazenda.sp.gov.br/consulta',
      homologacao: 'https://www.homologacao.nfce.fazenda.sp.gov.br/consulta',
    },
    DEFAULT: {
      producao: 'https://www.nfce.fazenda.sp.gov.br/consulta',
      homologacao: 'https://www.homologacao.nfce.fazenda.sp.gov.br/consulta',
    },
  };

  constructor(
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
    @InjectRepository(NfItem)
    private readonly nfItemRepo: Repository<NfItem>,
    @InjectRepository(EventoNfe)
    private readonly eventoRepo: Repository<EventoNfe>,
    @InjectRepository(EmpresaFiscal)
    private readonly empresaRepo: Repository<EmpresaFiscal>,
    @InjectRepository(DocumentoFiscalArquivado)
    private readonly docArqRepo: Repository<DocumentoFiscalArquivado>,
    private readonly xmlGenerator: NfeXmlGeneratorService,
    private readonly sefaz: SefazService,
    private readonly certService: CertificadoDigitalService,
  ) {}

  /**
   * Emite uma NFC-e (modelo 65) com QR Code
   */
  async emitirNfce(tenantId: string, empresaId: string, dadosNfce: Record<string, any>): Promise<{
    nfce: NfE;
    qrCodeUrl: string;
    urlConsulta: string;
    danfeData: Record<string, any>;
  }> {
    this.logger.log(`Emitindo NFC-e para empresa ${empresaId}`);

    // 1. Buscar empresa fiscal
    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    // 2. Validar CSC (Codigo de Seguranca do Contribuinte)
    if (!empresa.nfceCscId || !empresa.nfceCscToken) {
      throw new BadRequestException('CSC (Codigo de Seguranca do Contribuinte) nao configurado para NFC-e');
    }

    // 3. Verificar certificado
    const certValidade = await this.certService.verificarValidade(tenantId, empresaId);
    if (!certValidade.valido) {
      throw new BadRequestException('Certificado digital invalido ou expirado');
    }

    // 4. Gerar numero e chave de acesso
    const numero = (empresa.nfceNumeroAtual || 0) + 1;
    const cNf = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
    const aamm = this.getAAMM();
    const cUf = this.getCodUf(empresa.enderecoUf);

    const chaveAcesso = this.certService.gerarChaveAcesso({
      cUf, aamm,
      cnpj: empresa.cnpj,
      mod: '65',
      serie: String(empresa.nfceSerie || 1),
      nNf: String(numero),
      tpEmis: '1',
      cNf,
    });

    // 5. Gerar QR Code URL
    const qrCodeUrl = this.gerarQRCodeURL(
      chaveAcesso, empresa.nfceAmbiente || '2',
      empresa.enderecoUf, empresa.nfceCscId, empresa.nfceCscToken,
      dadosNfce.totais?.vNf || 0, dadosNfce.pagamentos?.[0]?.tPag || '01',
    );

    // 6. Gerar URL de consulta
    const urlConsulta = this.getUrlConsulta(empresa.enderecoUf, empresa.nfceAmbiente || '2');

    // 7. Montar dados para XML NFC-e
    const dadosXml = {
      ...dadosNfce,
      chaveAcesso,
      ide: {
        ...(dadosNfce.ide || {}),
        cUf, cNf,
        mod: '65',
        serie: empresa.nfceSerie || 1,
        nNf: numero,
        tpAmb: empresa.nfceAmbiente || '2',
        tpImp: '4', // DANFE NFC-e
        indFinal: '1', // Consumidor final
        indPres: '1', // Presencial
        tpEmis: '1',
        cDv: chaveAcesso.slice(-1),
      },
      emitente: {
        cnpj: empresa.cnpj,
        xNome: empresa.razaoSocial,
        xFant: empresa.nomeFantasia,
        ie: empresa.inscricaoEstadual,
        crt: empresa.regimeTributario,
        cscId: empresa.nfceCscId,
        endereco: {
          logradouro: empresa.enderecoLogradouro,
          numero: empresa.enderecoNumero,
          bairro: empresa.enderecoBairro,
          cep: empresa.enderecoCep,
          codigoMunicipio: empresa.enderecoCodigoMunicipio,
          uf: empresa.enderecoUf,
        },
      },
    };

    // 8. Gerar XML NFC-e
    const { xml } = await this.xmlGenerator.gerarXmlNfce(dadosXml);

    // 9. Assinar XML
    const xmlAssinado = await this.certService.assinarXml(xml, tenantId, empresaId);

    // 10. Enviar para SEFAZ
    const idLote = String(Date.now());
    const resultado = await this.sefaz.enviarLote(
      xmlAssinado, idLote, empresa.enderecoUf, empresa.nfceAmbiente || '2',
    );

    // 11. Salvar NFC-e no banco
    const nfce = this.nfeRepo.create({
      tenantId,
      empresaId,
      chaveAcesso,
      numero,
      serie: empresa.nfceSerie || 1,
      modelo: '65',
      dataEmissao: new Date(),
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      naturezaOperacao: 'VENDA AO CONSUMIDOR',
      emitenteCnpj: empresa.cnpj,
      emitenteNome: empresa.razaoSocial,
      emitenteIe: empresa.inscricaoEstadual,
      emitenteUf: empresa.enderecoUf,
      destinatarioCnpjCpf: dadosNfce.destinatario?.cnpjCpf || null,
      destinatarioNome: dadosNfce.destinatario?.nome || 'CONSUMIDOR NAO IDENTIFICADO',
      valorProdutos: dadosNfce.totais?.vProd || 0,
      valorTotal: dadosNfce.totais?.vNf || 0,
      xmlAssinado,
      status: resultado.sucesso ? 'processando' : 'rejeitada',
      motivoStatus: resultado.xMotivo,
    });

    const nfceSalva = await this.nfeRepo.save(nfce);

    // 12. Salvar itens
    if (dadosNfce.itens && Array.isArray(dadosNfce.itens)) {
      for (let i = 0; i < dadosNfce.itens.length; i++) {
        const item = dadosNfce.itens[i];
        const nfItem = this.nfItemRepo.create({
          tenantId,
          nfeId: nfceSalva.id,
          numeroItem: i + 1,
          codigoProduto: item.codigo || '',
          descricaoProduto: item.descricao || '',
          ncm: item.ncm,
          cfop: item.cfop || '5102',
          unidadeComercial: item.unidade || 'UN',
          quantidadeComercial: item.quantidade || 1,
          valorUnitarioComercial: item.valorUnitario || 0,
          valorTotal: item.valorTotal || 0,
        });
        await this.nfItemRepo.save(nfItem);
      }
    }

    // 13. Atualizar numero
    empresa.nfceNumeroAtual = numero;
    await this.empresaRepo.save(empresa);

    // 14. Consultar resultado do lote
    if (resultado.sucesso && resultado.nRec) {
      const retorno = await this.sefaz.consultarRecibo(
        resultado.nRec, empresa.enderecoUf, empresa.nfceAmbiente || '2',
      );
      if (retorno.sucesso && retorno.protocolos?.length) {
        const prot = retorno.protocolos[0];
        nfceSalva.protocoloAutorizacao = prot.nProt;
        nfceSalva.dataAutorizacao = new Date(prot.dhRecbto);
        nfceSalva.status = prot.cStat === '100' ? 'autorizada' : 'rejeitada';
        nfceSalva.motivoStatus = prot.xMotivo;
        await this.nfeRepo.save(nfceSalva);
      }
    }

    // 15. Arquivar documento
    await this.arquivarDocumento(tenantId, empresaId, nfceSalva, xmlAssinado);

    // 16. Montar dados DANFE NFC-e (para impressao termica)
    const danfeData = this.montarDanfeNfce(nfceSalva, empresa, dadosNfce, qrCodeUrl, urlConsulta);

    return { nfce: nfceSalva, qrCodeUrl, urlConsulta, danfeData };
  }

  /**
   * Emite NFC-e em contingencia offline (tpEmis=9)
   */
  async emitirNfceContingencia(
    tenantId: string, empresaId: string, dadosNfce: Record<string, any>,
  ): Promise<{ nfce: NfE; qrCodeUrl: string }> {
    this.logger.log(`Emitindo NFC-e em contingencia offline para empresa ${empresaId}`);

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    const numero = (empresa.nfceNumeroAtual || 0) + 1;
    const cNf = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
    const chaveAcesso = this.certService.gerarChaveAcesso({
      cUf: this.getCodUf(empresa.enderecoUf),
      aamm: this.getAAMM(),
      cnpj: empresa.cnpj,
      mod: '65',
      serie: String(empresa.nfceSerie || 1),
      nNf: String(numero),
      tpEmis: '9', // Contingencia offline
      cNf,
    });

    const qrCodeUrl = this.gerarQRCodeURL(
      chaveAcesso, empresa.nfceAmbiente || '2',
      empresa.enderecoUf, empresa.nfceCscId || '', empresa.nfceCscToken || '',
      dadosNfce.totais?.vNf || 0, dadosNfce.pagamentos?.[0]?.tPag || '01',
    );

    const nfce = this.nfeRepo.create({
      tenantId, empresaId, chaveAcesso, numero,
      serie: empresa.nfceSerie || 1,
      modelo: '65',
      dataEmissao: new Date(),
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      naturezaOperacao: 'VENDA AO CONSUMIDOR',
      emitenteCnpj: empresa.cnpj,
      emitenteNome: empresa.razaoSocial,
      emitenteUf: empresa.enderecoUf,
      valorProdutos: dadosNfce.totais?.vProd || 0,
      valorTotal: dadosNfce.totais?.vNf || 0,
      status: 'contingencia',
      motivoStatus: 'Emissao em contingencia offline (tpEmis=9)',
    });

    const nfceSalva = await this.nfeRepo.save(nfce);
    empresa.nfceNumeroAtual = numero;
    await this.empresaRepo.save(empresa);

    return { nfce: nfceSalva, qrCodeUrl };
  }

  /**
   * Transmite NFC-e emitidas em contingencia
   */
  async transmitirContingencia(tenantId: string, nfceId: string): Promise<NfE> {
    const nfce = await this.nfeRepo.findOne({ where: { id: nfceId, tenantId } });
    if (!nfce) throw new NotFoundException('NFC-e nao encontrada');
    if (nfce.status !== 'contingencia') {
      throw new BadRequestException('Apenas NFC-e em contingencia podem ser transmitidas');
    }

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId: nfce.empresaId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    // Reenviar para SEFAZ
    if (nfce.xmlAssinado) {
      const idLote = String(Date.now());
      const resultado = await this.sefaz.enviarLote(
        nfce.xmlAssinado, idLote, empresa.enderecoUf, empresa.nfceAmbiente || '2',
      );

      if (resultado.sucesso && resultado.nRec) {
        const retorno = await this.sefaz.consultarRecibo(
          resultado.nRec, empresa.enderecoUf, empresa.nfceAmbiente || '2',
        );
        if (retorno.sucesso && retorno.protocolos?.length) {
          const prot = retorno.protocolos[0];
          nfce.protocoloAutorizacao = prot.nProt;
          nfce.dataAutorizacao = new Date(prot.dhRecbto);
          nfce.status = prot.cStat === '100' ? 'autorizada' : 'rejeitada';
          nfce.motivoStatus = prot.xMotivo;
        }
      }
    } else {
      nfce.status = 'rejeitada';
      nfce.motivoStatus = 'XML assinado nao encontrado para retransmissao';
    }

    return this.nfeRepo.save(nfce);
  }

  /**
   * Cancela NFC-e (prazo de 30 minutos em SP, variavel por UF)
   */
  async cancelarNfce(tenantId: string, nfceId: string, justificativa: string): Promise<EventoNfe> {
    const nfce = await this.nfeRepo.findOne({ where: { id: nfceId, tenantId } });
    if (!nfce) throw new NotFoundException('NFC-e nao encontrada');
    if (nfce.status !== 'autorizada') {
      throw new BadRequestException('Apenas NFC-e autorizadas podem ser canceladas');
    }
    if (justificativa.length < 15) {
      throw new BadRequestException('Justificativa deve ter no minimo 15 caracteres');
    }

    // Verificar prazo de cancelamento (30 min para NFC-e em SP)
    if (nfce.dataAutorizacao) {
      const diffMs = Date.now() - new Date(nfce.dataAutorizacao).getTime();
      const diffMin = diffMs / (1000 * 60);
      if (diffMin > 30) {
        this.logger.warn(`Cancelamento de NFC-e fora do prazo de 30min (${diffMin.toFixed(0)}min)`);
      }
    }

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId: nfce.empresaId } });
    const resultado = await this.sefaz.cancelarNfe(
      nfce.chaveAcesso, nfce.protocoloAutorizacao || '', justificativa,
      empresa?.enderecoUf || 'SP', empresa?.nfceAmbiente || '2',
    );

    const evento = this.eventoRepo.create({
      tenantId,
      nfeId: nfce.id,
      tipoEvento: '110111',
      sequencial: 1,
      descricaoEvento: 'Cancelamento NFC-e',
      protocolo: resultado.nProt,
      dataEvento: new Date(),
      justificativa,
      status: resultado.sucesso ? 'registrado' : 'rejeitado',
    });
    const eventoSalvo = await this.eventoRepo.save(evento);

    if (resultado.sucesso) {
      nfce.status = 'cancelada';
      nfce.protocoloCancelamento = resultado.nProt || '';
      nfce.dataCancelamento = new Date();
      nfce.motivoStatus = resultado.xMotivo;
      await this.nfeRepo.save(nfce);
    }

    return eventoSalvo;
  }

  /**
   * Gera dados para impressao do DANFE NFC-e (formato termica 80mm)
   */
  montarDanfeNfce(
    nfce: NfE, empresa: EmpresaFiscal,
    dadosNfce: Record<string, any>,
    qrCodeUrl: string, urlConsulta: string,
  ): Record<string, any> {
    const itens = (dadosNfce.itens || []).map((item: any, idx: number) => ({
      seq: idx + 1,
      codigo: item.codigo,
      descricao: item.descricao,
      qtd: item.quantidade,
      unidade: item.unidade || 'UN',
      valorUnitario: item.valorUnitario,
      valorTotal: item.valorTotal,
    }));

    return {
      formato: 'DANFE_NFCE',
      largura: '80mm',
      // Cabecalho
      emitente: {
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia,
        cnpj: this.formatCnpj(empresa.cnpj),
        ie: empresa.inscricaoEstadual,
        endereco: `${empresa.enderecoLogradouro}, ${empresa.enderecoNumero} - ${empresa.enderecoBairro}`,
        cep: empresa.enderecoCep,
        uf: empresa.enderecoUf,
      },
      // Documento
      documento: {
        modelo: '65',
        serie: nfce.serie,
        numero: nfce.numero,
        dataEmissao: nfce.dataEmissao?.toISOString(),
        chaveAcesso: nfce.chaveAcesso,
        protocolo: nfce.protocoloAutorizacao,
        dataAutorizacao: nfce.dataAutorizacao?.toISOString(),
      },
      // Itens
      itens,
      // Totais
      totais: {
        qtdItens: itens.length,
        valorProdutos: dadosNfce.totais?.vProd || 0,
        valorDesconto: dadosNfce.totais?.vDesc || 0,
        valorTotal: dadosNfce.totais?.vNf || 0,
        valorTroco: dadosNfce.troco || 0,
        valorTributos: dadosNfce.totais?.vTotTrib || 0,
      },
      // Pagamentos
      pagamentos: (dadosNfce.pagamentos || []).map((p: any) => ({
        tipo: this.getDescricaoPagamento(p.tPag),
        valor: p.vPag,
      })),
      // Destinatario
      destinatario: dadosNfce.destinatario?.cnpjCpf
        ? { cpfCnpj: dadosNfce.destinatario.cnpjCpf, nome: dadosNfce.destinatario.nome }
        : null,
      // QR Code e consulta
      qrCode: qrCodeUrl,
      urlConsulta,
      // Mensagens
      mensagemFiscal: 'Documento Auxiliar da Nota Fiscal de Consumidor Eletronica',
      mensagemContribuinte: dadosNfce.infAdic?.infCpl || '',
    };
  }

  // ============================================================
  // QR Code Generation
  // ============================================================

  /**
   * Gera URL do QR Code conforme MOC 7.0
   * Formato: URL?p=chave|versao|ambiente|cscId|hash
   */
  private gerarQRCodeURL(
    chaveAcesso: string, ambiente: string, uf: string,
    cscId: string, cscToken: string,
    valorTotal: number, formaPagamento: string,
  ): string {
    const versao = '2';
    const params = `${chaveAcesso}|${versao}|${ambiente}|${cscId}`;
    const hashInput = `${params}${cscToken}`;
    const hash = crypto.createHash('sha1').update(hashInput).digest('hex').toUpperCase();

    const urlBase = this.getUrlQrCode(uf, ambiente);
    return `${urlBase}?p=${params}|${hash}`;
  }

  private getUrlQrCode(uf: string, ambiente: string): string {
    const amb = ambiente === '1' ? 'producao' : 'homologacao';
    return this.QRCODE_URLS[uf]?.[amb] || this.QRCODE_URLS.DEFAULT[amb];
  }

  private getUrlConsulta(uf: string, ambiente: string): string {
    const amb = ambiente === '1' ? 'producao' : 'homologacao';
    return this.CONSULTA_URLS[uf]?.[amb] || this.CONSULTA_URLS.DEFAULT[amb];
  }

  // ============================================================
  // Helpers
  // ============================================================

  private async arquivarDocumento(
    tenantId: string, empresaId: string, nfce: NfE, xml: string,
  ): Promise<void> {
    const hash = crypto.createHash('sha256').update(xml).digest('hex');
    const doc = this.docArqRepo.create({
      tenantId, empresaId,
      tipoDocumento: 'NFC-e',
      chaveAcesso: nfce.chaveAcesso,
      serie: String(nfce.serie),
      numero: nfce.numero,
      dataEmissao: nfce.dataEmissao,
      competenciaAno: new Date(nfce.dataEmissao).getFullYear(),
      competenciaMes: new Date(nfce.dataEmissao).getMonth() + 1,
      nomeArquivo: `${nfce.chaveAcesso}.xml`,
      caminhoArquivo: `/fiscal/xml/${tenantId}/${nfce.chaveAcesso}.xml`,
      hashArquivo: hash,
      mimeType: 'text/xml',
      xmlConteudo: xml,
      statusRetencao: 'ativo',
    });
    await this.docArqRepo.save(doc);
  }

  private getAAMM(): string {
    const d = new Date();
    return String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0');
  }

  private getCodUf(uf: string): string {
    const codigos: Record<string, string> = {
      AC: '12', AL: '27', AM: '13', AP: '16', BA: '29', CE: '23', DF: '53', ES: '32',
      GO: '52', MA: '21', MG: '31', MS: '50', MT: '51', PA: '15', PB: '25', PE: '26',
      PI: '22', PR: '41', RJ: '33', RN: '24', RO: '11', RR: '14', RS: '43', SC: '42',
      SE: '28', SP: '35', TO: '17',
    };
    return codigos[uf] || '35';
  }

  private formatCnpj(cnpj: string): string {
    const c = cnpj.replace(/\D/g, '');
    return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12,14)}`;
  }

  private getDescricaoPagamento(tPag: string): string {
    const tipos: Record<string, string> = {
      '01': 'Dinheiro', '02': 'Cheque', '03': 'Cartao Credito',
      '04': 'Cartao Debito', '05': 'Credito Loja', '10': 'Vale Alimentacao',
      '11': 'Vale Refeicao', '12': 'Vale Presente', '13': 'Vale Combustivel',
      '14': 'Duplicata Mercantil', '15': 'Boleto Bancario',
      '16': 'Deposito Bancario', '17': 'PIX', '18': 'Transferencia',
      '90': 'Sem Pagamento', '99': 'Outros',
    };
    return tipos[tPag] || 'Outros';
  }
}
