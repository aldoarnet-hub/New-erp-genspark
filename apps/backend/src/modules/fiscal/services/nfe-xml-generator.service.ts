import { Injectable, Logger } from '@nestjs/common';
import { CertificadoDigitalService } from './certificado-digital.service';

/**
 * Gerador de XML NF-e conforme layout versao 4.00
 * Documentacao tecnica: NT 2023.001
 */
@Injectable()
export class NfeXmlGeneratorService {
  private readonly logger = new Logger(NfeXmlGeneratorService.name);
  private readonly VERSAO_LAYOUT = '4.00';
  private readonly NFE_NS = 'http://www.portalfiscal.inf.br/nfe';

  constructor(private readonly certService: CertificadoDigitalService) {}

  /**
   * Gera XML completo da NF-e (modelo 55)
   */
  async gerarXmlNfe(dadosNfe: Record<string, any>): Promise<string> {
    this.logger.log(`Gerando XML NF-e chave: ${dadosNfe.chaveAcesso}`);

    const ide = dadosNfe.ide || {};
    const emit = dadosNfe.emitente || {};
    const dest = dadosNfe.destinatario || {};
    const produtos = dadosNfe.produtos || [];
    const totais = dadosNfe.totais || {};
    const transp = dadosNfe.transporte || {};
    const pag = dadosNfe.pagamentos || [];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<NFe xmlns="${this.NFE_NS}">`;
    xml += `<infNFe versao="${this.VERSAO_LAYOUT}" Id="NFe${dadosNfe.chaveAcesso}">`;

    // Grupo ide
    xml += this.gerarIde(ide);

    // Grupo emit
    xml += this.gerarEmit(emit);

    // Grupo dest
    if (dest.cnpjCpf || dest.cnpj) {
      xml += this.gerarDest(dest);
    }

    // Grupo det (produtos)
    for (let i = 0; i < produtos.length; i++) {
      xml += this.gerarDet(produtos[i], i + 1);
    }

    // Grupo total
    xml += this.gerarTotal(totais);

    // Grupo transp
    xml += this.gerarTransp(transp);

    // Grupo pag
    xml += this.gerarPag(pag);

    // Grupo cobr (Cobranca)
    if (dadosNfe.cobranca) {
      xml += this.gerarCobranca(dadosNfe.cobranca);
    }

    // Grupo infAdic
    if (dadosNfe.infAdic) {
      xml += this.gerarInfAdic(dadosNfe.infAdic);
    }

    // Grupo exporta (Exportacao)
    if (dadosNfe.exportacao) {
      xml += this.gerarExportacao(dadosNfe.exportacao);
    }

    // Grupo compra (Dados de compra)
    if (dadosNfe.compra) {
      xml += this.gerarCompra(dadosNfe.compra);
    }

    // Grupo cana (Cana-de-Acucar)
    if (dadosNfe.cana) {
      xml += this.gerarCana(dadosNfe.cana);
    }

    // Grupo responsavel tecnico
    if (dadosNfe.infRespTec) {
      xml += this.gerarInfRespTec(dadosNfe.infRespTec);
    }

    xml += `</infNFe>`;

    // Grupo infNFeSupl (NFC-e suplementar)
    if (dadosNfe.infNFeSupl) {
      xml += '<infNFeSupl>';
      xml += this.tag('qrCode', `<![CDATA[${dadosNfe.infNFeSupl.qrCode || ''}]]>`);
      xml += this.tag('urlChave', dadosNfe.infNFeSupl.urlChave || '');
      xml += '</infNFeSupl>';
    }

    xml += `</NFe>`;

    return xml;
  }

  /**
   * Gera XML da NFC-e (modelo 65) com QR Code
   */
  async gerarXmlNfce(dadosNfce: Record<string, any>): Promise<{ xml: string; qrCodeUrl: string }> {
    this.logger.log(`Gerando XML NFC-e chave: ${dadosNfce.chaveAcesso}`);

    const ide = { ...dadosNfce.ide, mod: '65', tpImp: '4', indFinal: '1', indPres: '1' };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<NFe xmlns="${this.NFE_NS}">`;
    xml += `<infNFe versao="${this.VERSAO_LAYOUT}" Id="NFe${dadosNfce.chaveAcesso}">`;
    xml += this.gerarIde(ide);
    xml += this.gerarEmit(dadosNfce.emitente || {});

    if (dadosNfce.destinatario?.cnpjCpf) {
      xml += this.gerarDest(dadosNfce.destinatario);
    }

    const produtos = dadosNfce.produtos || [];
    for (let i = 0; i < produtos.length; i++) {
      xml += this.gerarDet(produtos[i], i + 1);
    }

    xml += this.gerarTotal(dadosNfce.totais || {});
    xml += `<transp><modFrete>9</modFrete></transp>`;
    xml += this.gerarPag(dadosNfce.pagamentos || []);

    xml += `</infNFe>`;
    xml += `</NFe>`;

    const qrCodeUrl = this.gerarQrCode(dadosNfce);

    return { xml, qrCodeUrl };
  }

  // ============================================================
  // Geradores de grupos XML
  // ============================================================

  private gerarIde(ide: Record<string, any>): string {
    const mod = ide.mod || '55';
    let xml = '<ide>';
    xml += this.tag('cUF', ide.cUf || '35');
    xml += this.tag('cNF', (ide.cNf || '00000001').padStart(8, '0'));
    xml += this.tag('natOp', (ide.natOp || 'VENDA').substring(0, 60));
    xml += this.tag('mod', mod);
    xml += this.tag('serie', String(ide.serie || 1));
    xml += this.tag('nNF', String(ide.nNf || 1));
    xml += this.tag('dhEmi', ide.dhEmi || new Date().toISOString());
    xml += this.tag('tpNF', ide.tpNf || '1');
    xml += this.tag('idDest', ide.idDest || '1');
    xml += this.tag('cMunFG', ide.cMunFg || '3550308');
    xml += this.tag('tpImp', ide.tpImp || '1');
    xml += this.tag('tpEmis', String(ide.tpEmis || 1));
    xml += this.tag('cDV', ide.cDv || '0');
    xml += this.tag('tpAmb', ide.tpAmb || '2');
    xml += this.tag('finNFe', ide.finNfe || '1');
    xml += this.tag('indFinal', ide.indFinal || '0');
    xml += this.tag('indPres', ide.indPres || '1');
    xml += this.tag('indIntermed', ide.indIntermed || '0');
    xml += this.tag('procEmi', '0');
    xml += this.tag('verProc', ide.verProc || 'ERP-SaaS 1.0');
    xml += '</ide>';
    return xml;
  }

  private gerarEmit(emit: Record<string, any>): string {
    let xml = '<emit>';
    xml += this.tag('CNPJ', emit.cnpj || '');
    xml += this.tag('xNome', (emit.xNome || emit.razaoSocial || '').substring(0, 60));
    if (emit.xFant) xml += this.tag('xFant', emit.xFant.substring(0, 60));
    xml += '<enderEmit>';
    xml += this.tag('xLgr', emit.endereco?.logradouro || emit.xLgr || '');
    xml += this.tag('nro', emit.endereco?.numero || emit.nro || '');
    xml += this.tag('xBairro', emit.endereco?.bairro || emit.xBairro || '');
    xml += this.tag('cMun', emit.endereco?.codigoMunicipio || emit.cMun || '');
    xml += this.tag('xMun', emit.endereco?.municipio || emit.xMun || '');
    xml += this.tag('UF', emit.endereco?.uf || emit.uf || '');
    xml += this.tag('CEP', emit.endereco?.cep || emit.cep || '');
    xml += this.tag('cPais', '1058');
    xml += this.tag('xPais', 'BRASIL');
    xml += '</enderEmit>';
    xml += this.tag('IE', emit.ie || '');
    xml += this.tag('CRT', emit.crt || '3');
    xml += '</emit>';
    return xml;
  }

  private gerarDest(dest: Record<string, any>): string {
    let xml = '<dest>';
    const doc = dest.cnpjCpf || dest.cnpj || dest.cpf || '';
    if (doc.length > 11) {
      xml += this.tag('CNPJ', doc);
    } else if (doc.length > 0) {
      xml += this.tag('CPF', doc);
    }
    xml += this.tag('xNome', (dest.xNome || dest.nome || '').substring(0, 60));
    xml += '<enderDest>';
    xml += this.tag('xLgr', dest.endereco?.logradouro || dest.xLgr || '');
    xml += this.tag('nro', dest.endereco?.numero || dest.nro || '');
    xml += this.tag('xBairro', dest.endereco?.bairro || dest.xBairro || '');
    xml += this.tag('cMun', dest.endereco?.codigoMunicipio || dest.cMun || '');
    xml += this.tag('xMun', dest.endereco?.municipio || dest.xMun || '');
    xml += this.tag('UF', dest.endereco?.uf || dest.uf || '');
    xml += this.tag('CEP', dest.endereco?.cep || dest.cep || '');
    xml += this.tag('cPais', '1058');
    xml += this.tag('xPais', 'BRASIL');
    xml += '</enderDest>';
    if (dest.indIEDest !== undefined) {
      xml += this.tag('indIEDest', String(dest.indIEDest));
    } else {
      xml += this.tag('indIEDest', dest.ie ? '1' : '9');
    }
    if (dest.ie) xml += this.tag('IE', dest.ie);
    xml += '</dest>';
    return xml;
  }

  private gerarDet(produto: Record<string, any>, nItem: number): string {
    let xml = `<det nItem="${nItem}">`;
    xml += '<prod>';
    xml += this.tag('cProd', (produto.cProd || produto.codigo || '').substring(0, 60));
    xml += this.tag('cEAN', produto.cEan || 'SEM GTIN');
    xml += this.tag('xProd', (produto.xProd || produto.descricao || '').substring(0, 120));
    xml += this.tag('NCM', produto.ncm || '');
    if (produto.cest) xml += this.tag('CEST', produto.cest);
    xml += this.tag('CFOP', produto.cfop || '5102');
    xml += this.tag('uCom', (produto.uCom || 'UN').substring(0, 6));
    xml += this.tag('qCom', this.formatDec(produto.qCom || produto.quantidade || 1, 4));
    xml += this.tag('vUnCom', this.formatDec(produto.vUnCom || produto.valorUnitario || 0, 10));
    xml += this.tag('vProd', this.formatDec(produto.vProd || produto.valorTotal || 0, 2));
    xml += this.tag('cEANTrib', produto.cEanTrib || 'SEM GTIN');
    xml += this.tag('uTrib', (produto.uTrib || produto.uCom || 'UN').substring(0, 6));
    xml += this.tag('qTrib', this.formatDec(produto.qTrib || produto.qCom || produto.quantidade || 1, 4));
    xml += this.tag('vUnTrib', this.formatDec(produto.vUnTrib || produto.vUnCom || produto.valorUnitario || 0, 10));
    if (produto.vDesc) xml += this.tag('vDesc', this.formatDec(produto.vDesc, 2));
    if (produto.vFrete) xml += this.tag('vFrete', this.formatDec(produto.vFrete, 2));
    if (produto.vSeg) xml += this.tag('vSeg', this.formatDec(produto.vSeg, 2));
    if (produto.vOutro) xml += this.tag('vOutro', this.formatDec(produto.vOutro, 2));
    xml += this.tag('indTot', produto.indTot || '1');
    xml += '</prod>';

    // Impostos
    xml += this.gerarImpostos(produto.imposto || {});

    if (produto.infAdProd) {
      xml += this.tag('infAdProd', produto.infAdProd.substring(0, 500));
    }

    xml += '</det>';
    return xml;
  }

  private gerarImpostos(imposto: Record<string, any>): string {
    let xml = '<imposto>';
    if (imposto.vTotTrib !== undefined) {
      xml += this.tag('vTotTrib', this.formatDec(imposto.vTotTrib, 2));
    }

    // ICMS
    xml += '<ICMS>';
    const icms = imposto.icms || {};
    const cst = icms.cst || '000';
    xml += `<ICMS${cst.padStart(2, '0').substring(0, 2)}>`;
    xml += this.tag('orig', icms.orig || '0');
    xml += this.tag('CST', cst);
    if (['00', '10', '20', '51', '70', '90'].includes(cst.substring(0, 2))) {
      xml += this.tag('modBC', icms.modBc || '3');
      xml += this.tag('vBC', this.formatDec(icms.vBc || 0, 2));
      xml += this.tag('pICMS', this.formatDec(icms.pIcms || 0, 2));
      xml += this.tag('vICMS', this.formatDec(icms.vIcms || 0, 2));
    }
    if (['20', '70'].includes(cst.substring(0, 2))) {
      xml += this.tag('pRedBC', this.formatDec(icms.pRedBc || 0, 2));
    }
    xml += `</ICMS${cst.padStart(2, '0').substring(0, 2)}>`;
    xml += '</ICMS>';

    // IPI
    if (imposto.ipi) {
      xml += '<IPI>';
      xml += this.tag('cEnq', imposto.ipi.cEnq || '999');
      xml += '<IPITrib>';
      xml += this.tag('CST', imposto.ipi.cst || '99');
      xml += this.tag('vBC', this.formatDec(imposto.ipi.vBc || 0, 2));
      xml += this.tag('pIPI', this.formatDec(imposto.ipi.pIpi || 0, 2));
      xml += this.tag('vIPI', this.formatDec(imposto.ipi.vIpi || 0, 2));
      xml += '</IPITrib>';
      xml += '</IPI>';
    }

    // PIS
    xml += '<PIS>';
    const pis = imposto.pis || {};
    xml += '<PISAliq>';
    xml += this.tag('CST', pis.cst || '01');
    xml += this.tag('vBC', this.formatDec(pis.vBc || 0, 2));
    xml += this.tag('pPIS', this.formatDec(pis.pPis || 0, 2));
    xml += this.tag('vPIS', this.formatDec(pis.vPis || 0, 2));
    xml += '</PISAliq>';
    xml += '</PIS>';

    // COFINS
    xml += '<COFINS>';
    const cofins = imposto.cofins || {};
    xml += '<COFINSAliq>';
    xml += this.tag('CST', cofins.cst || '01');
    xml += this.tag('vBC', this.formatDec(cofins.vBc || 0, 2));
    xml += this.tag('pCOFINS', this.formatDec(cofins.pCofins || 0, 2));
    xml += this.tag('vCOFINS', this.formatDec(cofins.vCofins || 0, 2));
    xml += '</COFINSAliq>';
    xml += '</COFINS>';

    // DIFAL
    if (imposto.icmsUfDest) {
      const d = imposto.icmsUfDest;
      xml += '<ICMSUFDest>';
      xml += this.tag('vBCUFDest', this.formatDec(d.vBcUfDest || 0, 2));
      xml += this.tag('pFCPUFDest', this.formatDec(d.pFcpUfDest || 0, 2));
      xml += this.tag('pICMSUFDest', this.formatDec(d.pIcmsUfDest || 0, 2));
      xml += this.tag('pICMSInter', this.formatDec(d.pIcmsInter || 0, 2));
      xml += this.tag('pICMSInterPart', this.formatDec(d.pIcmsInterPart || 100, 2));
      xml += this.tag('vFCPUFDest', this.formatDec(d.vFcpUfDest || 0, 2));
      xml += this.tag('vICMSUFDest', this.formatDec(d.vIcmsUfDest || 0, 2));
      xml += this.tag('vICMSUFRemet', this.formatDec(d.vIcmsUfRemet || 0, 2));
      xml += '</ICMSUFDest>';
    }

    xml += '</imposto>';
    return xml;
  }

  private gerarTotal(totais: Record<string, any>): string {
    let xml = '<total><ICMSTot>';
    xml += this.tag('vBC', this.formatDec(totais.vBc || 0, 2));
    xml += this.tag('vICMS', this.formatDec(totais.vIcms || 0, 2));
    xml += this.tag('vICMSDeson', this.formatDec(totais.vIcmsDeson || 0, 2));
    xml += this.tag('vFCP', this.formatDec(totais.vFcp || 0, 2));
    xml += this.tag('vBCST', this.formatDec(totais.vBcSt || 0, 2));
    xml += this.tag('vST', this.formatDec(totais.vSt || 0, 2));
    xml += this.tag('vFCPST', this.formatDec(totais.vFcpSt || 0, 2));
    xml += this.tag('vFCPSTRet', this.formatDec(totais.vFcpStRet || 0, 2));
    xml += this.tag('vProd', this.formatDec(totais.vProd || 0, 2));
    xml += this.tag('vFrete', this.formatDec(totais.vFrete || 0, 2));
    xml += this.tag('vSeg', this.formatDec(totais.vSeg || 0, 2));
    xml += this.tag('vDesc', this.formatDec(totais.vDesc || 0, 2));
    xml += this.tag('vII', this.formatDec(totais.vIi || 0, 2));
    xml += this.tag('vIPI', this.formatDec(totais.vIpi || 0, 2));
    xml += this.tag('vIPIDevol', this.formatDec(totais.vIpiDevol || 0, 2));
    xml += this.tag('vPIS', this.formatDec(totais.vPis || 0, 2));
    xml += this.tag('vCOFINS', this.formatDec(totais.vCofins || 0, 2));
    xml += this.tag('vOutro', this.formatDec(totais.vOutro || 0, 2));
    xml += this.tag('vNF', this.formatDec(totais.vNf || 0, 2));
    xml += this.tag('vTotTrib', this.formatDec(totais.vTotTrib || 0, 2));
    xml += '</ICMSTot></total>';
    return xml;
  }

  private gerarTransp(transp: Record<string, any>): string {
    let xml = '<transp>';
    xml += this.tag('modFrete', transp.modFrete || '9'); // 9=Sem frete
    if (transp.transportadora) {
      xml += '<transporta>';
      if (transp.transportadora.cnpj) xml += this.tag('CNPJ', transp.transportadora.cnpj);
      if (transp.transportadora.nome) xml += this.tag('xNome', transp.transportadora.nome);
      xml += '</transporta>';
    }
    xml += '</transp>';
    return xml;
  }

  private gerarPag(pagamentos: Record<string, any>[]): string {
    let xml = '<pag>';
    if (pagamentos.length === 0) {
      xml += '<detPag>';
      xml += this.tag('tPag', '01'); // Dinheiro
      xml += this.tag('vPag', '0.00');
      xml += '</detPag>';
    } else {
      for (const pag of pagamentos) {
        xml += '<detPag>';
        xml += this.tag('tPag', pag.tPag || '01');
        xml += this.tag('vPag', this.formatDec(pag.vPag || 0, 2));
        xml += '</detPag>';
      }
    }
    xml += '</pag>';
    return xml;
  }

  private gerarInfAdic(infAdic: Record<string, any>): string {
    let xml = '<infAdic>';
    if (infAdic.infCpl) {
      xml += this.tag('infCpl', infAdic.infCpl.substring(0, 5000));
    }
    if (infAdic.infAdFisco) {
      xml += this.tag('infAdFisco', infAdic.infAdFisco.substring(0, 2000));
    }
    xml += '</infAdic>';
    return xml;
  }

  private gerarCobranca(cobr: Record<string, any>): string {
    let xml = '<cobr>';
    if (cobr.fatura) {
      xml += '<fat>';
      if (cobr.fatura.nFat) xml += this.tag('nFat', cobr.fatura.nFat);
      if (cobr.fatura.vOrig !== undefined) xml += this.tag('vOrig', this.formatDec(cobr.fatura.vOrig, 2));
      if (cobr.fatura.vDesc !== undefined) xml += this.tag('vDesc', this.formatDec(cobr.fatura.vDesc, 2));
      if (cobr.fatura.vLiq !== undefined) xml += this.tag('vLiq', this.formatDec(cobr.fatura.vLiq, 2));
      xml += '</fat>';
    }
    if (cobr.duplicatas && Array.isArray(cobr.duplicatas)) {
      for (const dup of cobr.duplicatas) {
        xml += '<dup>';
        if (dup.nDup) xml += this.tag('nDup', dup.nDup);
        if (dup.dVenc) xml += this.tag('dVenc', dup.dVenc);
        if (dup.vDup !== undefined) xml += this.tag('vDup', this.formatDec(dup.vDup, 2));
        xml += '</dup>';
      }
    }
    xml += '</cobr>';
    return xml;
  }

  private gerarExportacao(exp: Record<string, any>): string {
    let xml = '<exporta>';
    if (exp.ufSaidaPais) xml += this.tag('UFSaidaPais', exp.ufSaidaPais);
    if (exp.xLocExporta) xml += this.tag('xLocExporta', exp.xLocExporta);
    if (exp.xLocDespacho) xml += this.tag('xLocDespacho', exp.xLocDespacho);
    xml += '</exporta>';
    return xml;
  }

  private gerarCompra(compra: Record<string, any>): string {
    let xml = '<compra>';
    if (compra.xNEmp) xml += this.tag('xNEmp', compra.xNEmp);
    if (compra.xPed) xml += this.tag('xPed', compra.xPed);
    if (compra.xCont) xml += this.tag('xCont', compra.xCont);
    xml += '</compra>';
    return xml;
  }

  private gerarCana(cana: Record<string, any>): string {
    let xml = '<cana>';
    if (cana.safra) xml += this.tag('safra', cana.safra);
    if (cana.ref) xml += this.tag('ref', cana.ref);
    if (cana.fornecimentos && Array.isArray(cana.fornecimentos)) {
      for (const f of cana.fornecimentos) {
        xml += '<forDia>';
        xml += this.tag('dia', String(f.dia));
        xml += this.tag('qtde', this.formatDec(f.qtde, 10));
        xml += '</forDia>';
      }
    }
    xml += '</cana>';
    return xml;
  }

  private gerarInfRespTec(resp: Record<string, any>): string {
    let xml = '<infRespTec>';
    xml += this.tag('CNPJ', resp.cnpj || '');
    xml += this.tag('xContato', resp.xContato || '');
    xml += this.tag('email', resp.email || '');
    xml += this.tag('fone', resp.fone || '');
    if (resp.idCSRT) {
      xml += this.tag('idCSRT', resp.idCSRT);
      xml += this.tag('hashCSRT', resp.hashCSRT || '');
    }
    xml += '</infRespTec>';
    return xml;
  }

  private gerarQrCode(dadosNfce: Record<string, any>): string {
    const chave = dadosNfce.chaveAcesso || '';
    const versao = '2';
    const ambiente = dadosNfce.ide?.tpAmb || '2';
    const cscId = dadosNfce.emitente?.cscId || '000001';
    const urlBase = ambiente === '1'
      ? 'https://www.nfce.fazenda.sp.gov.br/qrcode'
      : 'https://homologacao.nfce.fazenda.sp.gov.br/qrcode';

    return `${urlBase}?p=${chave}|${versao}|${ambiente}|${cscId}`;
  }

  // ============================================================
  // Helpers
  // ============================================================

  private tag(name: string, value: string): string {
    return `<${name}>${this.escapeXml(value)}</${name}>`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatDec(value: number | string | null | undefined, decimals: number): string {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  }
}
