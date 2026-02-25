import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfE, NfItem } from '../entities/nfe.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

/**
 * Servico de geracao de DANFE (Documento Auxiliar da Nota Fiscal Eletronica)
 *
 * Formatos suportados:
 * - DANFE Normal (retrato A4) - modelo 55
 * - DANFE Simplificado (paisagem A4) - modelo 55
 * - DANFE NFC-e (80mm termica) - modelo 65
 *
 * Em producao: integrar com PDFKit, Puppeteer ou biblioteca de PDF
 * Nesta implementacao: retorna dados estruturados para geracao de PDF
 */
@Injectable()
export class DanfeService {
  private readonly logger = new Logger(DanfeService.name);

  constructor(
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
    @InjectRepository(NfItem)
    private readonly nfItemRepo: Repository<NfItem>,
    @InjectRepository(EmpresaFiscal)
    private readonly empresaRepo: Repository<EmpresaFiscal>,
  ) {}

  /**
   * Gera dados para DANFE NF-e em formato retrato (padrao)
   */
  async gerarDanfeRetrato(tenantId: string, nfeId: string): Promise<Record<string, any>> {
    const { nfe, itens, empresa } = await this.carregarDadosNfe(tenantId, nfeId);

    return {
      formato: 'DANFE_RETRATO',
      orientacao: 'retrato',
      modelo: nfe.modelo,
      // Quadro 1 - Identificacao
      identificacao: {
        chaveAcesso: this.formatChave(nfe.chaveAcesso),
        naturezaOperacao: nfe.naturezaOperacao,
        protocolo: nfe.protocoloAutorizacao,
        inscricaoEstadual: empresa.inscricaoEstadual,
        inscricaoMunicipal: empresa.inscricaoMunicipal,
        cnpjEmitente: this.formatCnpj(empresa.cnpj),
        serie: nfe.serie,
        numero: nfe.numero,
        dataEmissao: this.formatDateTime(nfe.dataEmissao),
        dataEntradaSaida: nfe.dataSaidaEntrada ? this.formatDateTime(nfe.dataSaidaEntrada) : '',
        tipoOperacao: nfe.tipoOperacao === 'S' ? '1 - SAIDA' : '0 - ENTRADA',
        codigoBarras: nfe.chaveAcesso,
      },
      // Quadro 2 - Emitente
      emitente: {
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia,
        cnpj: this.formatCnpj(empresa.cnpj),
        ie: empresa.inscricaoEstadual,
        im: empresa.inscricaoMunicipal,
        endereco: `${empresa.enderecoLogradouro}, ${empresa.enderecoNumero}`,
        bairro: empresa.enderecoBairro,
        cep: this.formatCep(empresa.enderecoCep),
        municipio: empresa.enderecoCodigoMunicipio,
        uf: empresa.enderecoUf,
        telefone: empresa.telefoneDdd && empresa.telefoneNumero
          ? `(${empresa.telefoneDdd}) ${empresa.telefoneNumero}` : '',
      },
      // Quadro 3 - Destinatario
      destinatario: {
        nome: nfe.destinatarioNome,
        cpfCnpj: nfe.destinatarioCnpjCpf ? this.formatCpfCnpj(nfe.destinatarioCnpjCpf) : '',
        ie: nfe.destinatarioIe || '',
        endereco: '',
        bairro: '',
        cep: '',
        municipio: '',
        uf: nfe.destinatarioUf || '',
        telefone: '',
      },
      // Quadro 4 - Calculo imposto
      impostos: {
        baseCalculoIcms: this.formatValor(nfe.valorBaseCalculoIcms),
        valorIcms: this.formatValor(nfe.valorIcms),
        baseCalculoIcmsSt: this.formatValor(nfe.valorBaseCalculoIcmsSt),
        valorIcmsSt: this.formatValor(nfe.valorIcmsSt),
        valorProdutos: this.formatValor(nfe.valorProdutos),
        valorFrete: this.formatValor(nfe.valorFrete),
        valorSeguro: this.formatValor(nfe.valorSeguro),
        valorDesconto: this.formatValor(nfe.valorDesconto),
        valorOutrasDespesas: this.formatValor(nfe.valorOutrasDespesas),
        valorIpi: this.formatValor(nfe.valorIpi),
        valorApproxTributos: this.formatValor(nfe.valorAproximadoTributos),
        valorTotalNf: this.formatValor(nfe.valorTotal),
      },
      // Quadro 5 - Transporte
      transporte: {
        modalidadeFrete: nfe.modalidadeFrete || '9',
        transportadora: nfe.transportadoraNome || '',
        cnpjTransp: nfe.transportadoraCnpj || '',
      },
      // Quadro 6 - Itens
      itens: itens.map(item => ({
        codigo: item.codigoProduto,
        descricao: item.descricaoProduto,
        ncm: item.ncm,
        cst: item.icmsCst,
        cfop: item.cfop,
        unidade: item.unidadeComercial,
        quantidade: this.formatQtd(item.quantidadeComercial),
        valorUnitario: this.formatValor(item.valorUnitarioComercial, 4),
        valorTotal: this.formatValor(item.valorTotal),
        baseCalculoIcms: this.formatValor(item.icmsBaseCalculo),
        valorIcms: this.formatValor(item.icmsValor),
        valorIpi: this.formatValor(item.ipiValor),
        aliquotaIcms: this.formatAliquota(item.icmsAliquota),
        aliquotaIpi: this.formatAliquota(item.ipiAliquota),
      })),
      // Quadro 7 - Informacoes Complementares
      informacoesComplementares: nfe.informacoesComplementares || '',
      informacoesFisco: nfe.informacoesFisco || '',
      // Quadro 8 - Dados adicionais
      dadosAdicionais: {
        status: nfe.status,
        ambiente: empresa.nfeAmbiente === '1' ? 'PRODUCAO' : 'HOMOLOGACAO - SEM VALOR FISCAL',
        versaoXml: '4.00',
      },
    };
  }

  /**
   * Gera dados para DANFE simplificado (paisagem)
   */
  async gerarDanfeSimplificado(tenantId: string, nfeId: string): Promise<Record<string, any>> {
    const danfeRetrato = await this.gerarDanfeRetrato(tenantId, nfeId);
    return {
      ...danfeRetrato,
      formato: 'DANFE_SIMPLIFICADO',
      orientacao: 'paisagem',
    };
  }

  /**
   * Gera dados para DANFE NFC-e (termica 80mm)
   */
  async gerarDanfeNfce(
    tenantId: string, nfeId: string, qrCodeUrl?: string,
  ): Promise<Record<string, any>> {
    const { nfe, itens, empresa } = await this.carregarDadosNfe(tenantId, nfeId);

    return {
      formato: 'DANFE_NFCE',
      orientacao: 'retrato',
      largura: '80mm',
      modelo: '65',
      emitente: {
        razaoSocial: empresa.razaoSocial,
        nomeFantasia: empresa.nomeFantasia || empresa.razaoSocial,
        cnpj: this.formatCnpj(empresa.cnpj),
        ie: empresa.inscricaoEstadual,
        endereco: `${empresa.enderecoLogradouro}, ${empresa.enderecoNumero} - ${empresa.enderecoBairro}`,
      },
      documento: {
        numero: nfe.numero,
        serie: nfe.serie,
        dataEmissao: this.formatDateTime(nfe.dataEmissao),
        chaveAcesso: nfe.chaveAcesso,
        protocolo: nfe.protocoloAutorizacao,
      },
      itens: itens.map((item, idx) => ({
        seq: idx + 1,
        codigo: item.codigoProduto,
        descricao: item.descricaoProduto,
        qtd: item.quantidadeComercial,
        unidade: item.unidadeComercial,
        valorUnitario: item.valorUnitarioComercial,
        valorTotal: item.valorTotal,
      })),
      totais: {
        qtdItens: itens.length,
        valorProdutos: nfe.valorProdutos,
        valorDesconto: nfe.valorDesconto || 0,
        valorTotal: nfe.valorTotal,
      },
      qrCode: qrCodeUrl || '',
      ambiente: empresa.nfceAmbiente === '1' ? 'PRODUCAO' : 'HOMOLOGACAO',
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private async carregarDadosNfe(tenantId: string, nfeId: string) {
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e/NFC-e nao encontrada');

    const itens = await this.nfItemRepo.find({
      where: { tenantId, nfeId },
      order: { numeroItem: 'ASC' },
    });

    const empresa = await this.empresaRepo.findOne({
      where: { tenantId, empresaId: nfe.empresaId },
    });
    if (!empresa) throw new NotFoundException('Empresa fiscal nao encontrada');

    return { nfe, itens, empresa };
  }

  private formatChave(chave: string): string {
    if (!chave) return '';
    return chave.match(/.{1,4}/g)?.join(' ') || chave;
  }

  private formatCnpj(cnpj: string): string {
    const c = (cnpj || '').replace(/\D/g, '');
    if (c.length !== 14) return cnpj || '';
    return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12)}`;
  }

  private formatCpfCnpj(doc: string): string {
    const d = (doc || '').replace(/\D/g, '');
    if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    if (d.length === 14) return this.formatCnpj(d);
    return doc || '';
  }

  private formatCep(cep: string): string {
    const c = (cep || '').replace(/\D/g, '');
    if (c.length === 8) return `${c.slice(0,5)}-${c.slice(5)}`;
    return cep || '';
  }

  private formatValor(valor: any, decimals: number = 2): string {
    const num = Number(valor) || 0;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  private formatQtd(valor: any): string {
    const num = Number(valor) || 0;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  private formatAliquota(valor: any): string {
    const num = Number(valor) || 0;
    return `${num.toFixed(2)}%`;
  }

  private formatDateTime(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  }
}
