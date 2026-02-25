import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfE, NfItem, EventoNfe } from '../entities/nfe.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import { DocumentoFiscalArquivado } from '../entities/fiscal-complementar.entity';
import { NfeXmlGeneratorService } from './nfe-xml-generator.service';
import { SefazService } from './sefaz.service';
import { CertificadoDigitalService } from './certificado-digital.service';
import { MotorTributarioService, ItemOperacao, ContextoTributario } from './motor-tributario.service';
import * as crypto from 'crypto';

/**
 * Servico principal de NF-e / NFC-e
 * Emissao, cancelamento, consulta, CC-e, inutilizacao, arquivamento
 */
@Injectable()
export class NfeService {
  private readonly logger = new Logger(NfeService.name);

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
    private readonly motorTributario: MotorTributarioService,
  ) {}

  /**
   * Emite uma NF-e completa: gera XML, assina, envia para SEFAZ
   */
  async emitirNfe(tenantId: string, empresaId: string, dadosNfe: Record<string, any>): Promise<NfE> {
    this.logger.log(`Emitindo NF-e para empresa ${empresaId}`);

    // 1. Buscar empresa fiscal
    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    // 2. Verificar certificado
    const certValidade = await this.certService.verificarValidade(tenantId, empresaId);
    if (!certValidade.valido) {
      throw new BadRequestException('Certificado digital invalido ou expirado');
    }

    // 3. Gerar numero e chave de acesso
    const numero = empresa.nfeNumeroAtual + 1;
    const cNf = String(Math.floor(Math.random() * 99999999)).padStart(8, '0');
    const aamm = this.getAAMM();
    const cUf = this.getCodUf(empresa.enderecoUf);

    const chaveAcesso = this.certService.gerarChaveAcesso({
      cUf, aamm,
      cnpj: empresa.cnpj,
      mod: '55',
      serie: String(empresa.nfeSerie),
      nNf: String(numero),
      tpEmis: '1',
      cNf,
    });

    // 4. Montar dados completos para XML
    const dadosXml = {
      ...dadosNfe,
      chaveAcesso,
      ide: {
        ...(dadosNfe.ide || {}),
        cUf, cNf,
        serie: empresa.nfeSerie,
        nNf: numero,
        tpAmb: empresa.nfeAmbiente,
        cDv: chaveAcesso.slice(-1),
      },
      emitente: {
        cnpj: empresa.cnpj,
        xNome: empresa.razaoSocial,
        xFant: empresa.nomeFantasia,
        ie: empresa.inscricaoEstadual,
        crt: empresa.regimeTributario,
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

    // 5. Gerar XML
    const xmlBruto = await this.xmlGenerator.gerarXmlNfe(dadosXml);

    // 6. Assinar XML
    const xmlAssinado = await this.certService.assinarXml(xmlBruto, tenantId, empresaId);

    // 7. Enviar para SEFAZ
    const idLote = String(Date.now());
    const resultado = await this.sefaz.enviarLote(xmlAssinado, idLote, empresa.enderecoUf, empresa.nfeAmbiente);

    // 8. Salvar NF-e no banco
    const nfe = this.nfeRepo.create({
      tenantId,
      empresaId,
      chaveAcesso,
      numero,
      serie: empresa.nfeSerie,
      modelo: '55',
      dataEmissao: new Date(),
      tipoOperacao: dadosNfe.tipoOperacao || 'S',
      finalidadeEmissao: dadosNfe.finalidadeEmissao || '1',
      naturezaOperacao: dadosNfe.naturezaOperacao || 'VENDA',
      emitenteCnpj: empresa.cnpj,
      emitenteNome: empresa.razaoSocial,
      emitenteIe: empresa.inscricaoEstadual,
      emitenteUf: empresa.enderecoUf,
      destinatarioCnpjCpf: dadosNfe.destinatario?.cnpjCpf,
      destinatarioNome: dadosNfe.destinatario?.nome,
      destinatarioIe: dadosNfe.destinatario?.ie,
      destinatarioUf: dadosNfe.destinatario?.uf,
      valorProdutos: dadosNfe.totais?.vProd || 0,
      valorTotal: dadosNfe.totais?.vNf || 0,
      xmlAssinado,
      status: resultado.sucesso ? 'processando' : 'rejeitada',
      motivoStatus: resultado.xMotivo,
    });

    const nfeSalva = await this.nfeRepo.save(nfe);

    // 9. Salvar itens
    if (dadosNfe.itens && Array.isArray(dadosNfe.itens)) {
      for (let i = 0; i < dadosNfe.itens.length; i++) {
        const item = dadosNfe.itens[i];
        const nfItem = this.nfItemRepo.create({
          tenantId,
          nfeId: nfeSalva.id,
          numeroItem: i + 1,
          codigoProduto: item.codigo || '',
          descricaoProduto: item.descricao || '',
          ncm: item.ncm,
          cest: item.cest,
          cfop: item.cfop,
          unidadeComercial: item.unidade || 'UN',
          quantidadeComercial: item.quantidade || 1,
          valorUnitarioComercial: item.valorUnitario || 0,
          valorTotal: item.valorTotal || 0,
          icmsCst: item.icmsCst,
          icmsBaseCalculo: item.icmsBaseCalculo || 0,
          icmsAliquota: item.icmsAliquota || 0,
          icmsValor: item.icmsValor || 0,
          pisCst: item.pisCst,
          pisBaseCalculo: item.pisBaseCalculo || 0,
          pisAliquota: item.pisAliquota || 0,
          pisValor: item.pisValor || 0,
          cofinsCst: item.cofinsCst,
          cofinsBaseCalculo: item.cofinsBaseCalculo || 0,
          cofinsAliquota: item.cofinsAliquota || 0,
          cofinsValor: item.cofinsValor || 0,
        });
        await this.nfItemRepo.save(nfItem);
      }
    }

    // 10. Atualizar numero da empresa
    empresa.nfeNumeroAtual = numero;
    await this.empresaRepo.save(empresa);

    // 11. Se lote foi recebido, consultar resultado
    if (resultado.sucesso && resultado.nRec) {
      const retorno = await this.sefaz.consultarRecibo(resultado.nRec, empresa.enderecoUf, empresa.nfeAmbiente);
      if (retorno.sucesso && retorno.protocolos?.length) {
        const prot = retorno.protocolos[0];
        nfeSalva.protocoloAutorizacao = prot.nProt;
        nfeSalva.dataAutorizacao = new Date(prot.dhRecbto);
        nfeSalva.status = prot.cStat === '100' ? 'autorizada' : 'rejeitada';
        nfeSalva.motivoStatus = prot.xMotivo;
        await this.nfeRepo.save(nfeSalva);
      }
    }

    // 12. Arquivar documento
    await this.arquivarDocumento(tenantId, empresaId, nfeSalva, xmlAssinado);

    return nfeSalva;
  }

  /**
   * Cancela uma NF-e autorizada
   */
  async cancelarNfe(
    tenantId: string, nfeId: string, justificativa: string,
  ): Promise<EventoNfe> {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e nao encontrada');
    if (nfe.status !== 'autorizada') {
      throw new BadRequestException('Apenas NF-e autorizadas podem ser canceladas');
    }
    if (justificativa.length < 15) {
      throw new BadRequestException('Justificativa deve ter no minimo 15 caracteres');
    }

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId: nfe.empresaId } });
    const resultado = await this.sefaz.cancelarNfe(
      nfe.chaveAcesso, nfe.protocoloAutorizacao || '', justificativa,
      empresa?.enderecoUf || 'SP', empresa?.nfeAmbiente || '2',
    );

    const evento = this.eventoRepo.create({
      tenantId,
      nfeId: nfe.id,
      tipoEvento: '110111',
      sequencial: 1,
      descricaoEvento: 'Cancelamento',
      protocolo: resultado.nProt,
      dataEvento: new Date(),
      justificativa,
      status: resultado.sucesso ? 'registrado' : 'rejeitado',
    });
    const eventoSalvo = await this.eventoRepo.save(evento);

    if (resultado.sucesso) {
      nfe.status = 'cancelada';
      nfe.protocoloCancelamento = resultado.nProt || '';
      nfe.dataCancelamento = new Date();
      nfe.motivoStatus = resultado.xMotivo;
      await this.nfeRepo.save(nfe);
    }

    return eventoSalvo;
  }

  /**
   * Envia carta de correcao (CC-e)
   */
  async cartaCorrecao(
    tenantId: string, nfeId: string, correcao: string,
  ): Promise<EventoNfe> {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e nao encontrada');
    if (nfe.status !== 'autorizada') {
      throw new BadRequestException('CC-e so pode ser enviada para NF-e autorizada');
    }

    // Buscar sequencial
    const ultimoEvento = await this.eventoRepo.findOne({
      where: { nfeId: nfe.id, tipoEvento: '110110' },
      order: { sequencial: 'DESC' },
    });
    const sequencia = (ultimoEvento?.sequencial || 0) + 1;

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId: nfe.empresaId } });
    const resultado = await this.sefaz.cartaCorrecao(
      nfe.chaveAcesso, correcao, sequencia,
      empresa?.enderecoUf || 'SP', empresa?.nfeAmbiente || '2',
    );

    const evento = this.eventoRepo.create({
      tenantId,
      nfeId: nfe.id,
      tipoEvento: '110110',
      sequencial: sequencia,
      descricaoEvento: 'Carta de Correcao',
      protocolo: resultado.nProt,
      dataEvento: new Date(),
      correcao,
      status: resultado.sucesso ? 'registrado' : 'rejeitado',
    });

    return this.eventoRepo.save(evento);
  }

  /**
   * Inutiliza faixa de numeracao
   */
  async inutilizarNumeracao(
    tenantId: string, empresaId: string,
    serie: number, numeroInicial: number, numeroFinal: number, justificativa: string,
  ): Promise<{ sucesso: boolean; cStat: string; xMotivo: string }> {
    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    return this.sefaz.inutilizarNumeracao(
      new Date().getFullYear(), empresa.cnpj, serie,
      numeroInicial, numeroFinal, justificativa,
      empresa.enderecoUf, empresa.nfeAmbiente,
    );
  }

  /**
   * Consulta NF-e na SEFAZ
   */
  async consultarNfe(tenantId: string, nfeId: string): Promise<any> {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e nao encontrada');

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId: nfe.empresaId } });
    return this.sefaz.consultarNfe(
      nfe.chaveAcesso, empresa?.enderecoUf || 'SP', empresa?.nfeAmbiente || '2',
    );
  }

  /**
   * Lista NF-e com filtros
   */
  async listarNfe(tenantId: string, filtros: {
    empresaId?: string; status?: string; modelo?: string;
    dataInicio?: string; dataFim?: string;
    page?: number; limit?: number;
  }): Promise<{ data: NfE[]; total: number; page: number; limit: number }> {
    const page = filtros.page || 1;
    const limit = Math.min(filtros.limit || 20, 100);
    const qb = this.nfeRepo.createQueryBuilder('nfe')
      .where('nfe.tenantId = :tenantId', { tenantId });

    if (filtros.empresaId) qb.andWhere('nfe.empresaId = :empresaId', { empresaId: filtros.empresaId });
    if (filtros.status) qb.andWhere('nfe.status = :status', { status: filtros.status });
    if (filtros.modelo) qb.andWhere('nfe.modelo = :modelo', { modelo: filtros.modelo });
    if (filtros.dataInicio) qb.andWhere('nfe.dataEmissao >= :dataInicio', { dataInicio: filtros.dataInicio });
    if (filtros.dataFim) qb.andWhere('nfe.dataEmissao <= :dataFim', { dataFim: filtros.dataFim });

    qb.orderBy('nfe.dataEmissao', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * Busca itens de uma NF-e
   */
  async buscarItensNfe(tenantId: string, nfeId: string): Promise<NfItem[]> {
    return this.nfItemRepo.find({
      where: { tenantId, nfeId },
      order: { numeroItem: 'ASC' },
    });
  }

  /**
   * Busca eventos de uma NF-e
   */
  async buscarEventosNfe(tenantId: string, nfeId: string): Promise<EventoNfe[]> {
    return this.eventoRepo.find({
      where: { tenantId, nfeId },
      order: { criadoEm: 'DESC' },
    });
  }

  // ============================================================
  // Helpers privados
  // ============================================================

  private async arquivarDocumento(
    tenantId: string, empresaId: string, nfe: NfE, xml: string,
  ): Promise<void> {
    const hash = crypto.createHash('sha256').update(xml).digest('hex');
    const doc = this.docArqRepo.create({
      tenantId,
      empresaId,
      tipoDocumento: nfe.modelo === '65' ? 'NFC-e' : 'NF-e',
      chaveAcesso: nfe.chaveAcesso,
      serie: String(nfe.serie),
      numero: nfe.numero,
      dataEmissao: nfe.dataEmissao,
      competenciaAno: new Date(nfe.dataEmissao).getFullYear(),
      competenciaMes: new Date(nfe.dataEmissao).getMonth() + 1,
      nomeArquivo: `${nfe.chaveAcesso}.xml`,
      caminhoArquivo: `/fiscal/xml/${tenantId}/${nfe.chaveAcesso}.xml`,
      hashArquivo: hash,
      mimeType: 'text/xml',
      xmlConteudo: xml,
      statusRetencao: 'ativo',
      usuarioArquivamento: nfe.usuarioCadastro,
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
}
