import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NfeXmlGeneratorService } from '../services/nfe-xml-generator.service';
import { CertificadoDigitalService } from '../services/certificado-digital.service';
import { SefazService } from '../services/sefaz.service';
import { SpedService } from '../services/sped.service';
import { GuiaPagamentoService } from '../services/guia-pagamento.service';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import { SpedRegistro, ObrigacaoFiscal } from '../entities/fiscal-complementar.entity';

// ============================================================
// NfeXmlGeneratorService Tests
// ============================================================

describe('NfeXmlGeneratorService', () => {
  let service: NfeXmlGeneratorService;

  beforeEach(async () => {
    const certService = {
      assinarXml: jest.fn().mockImplementation((xml) => xml + '<Signature/>'),
      verificarValidade: jest.fn().mockResolvedValue({ valido: true, diasRestantes: 365 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfeXmlGeneratorService,
        { provide: CertificadoDigitalService, useValue: certService },
      ],
    }).compile();

    service = module.get<NfeXmlGeneratorService>(NfeXmlGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('gerarXmlNfe', () => {
    it('should generate valid NF-e XML with header and footer', async () => {
      const xml = await service.gerarXmlNfe({
        chaveAcesso: '35260111222333000181550010000000011000000010',
        ide: {
          cUf: '35', cNf: '00000001', natOp: 'VENDA', mod: '55',
          serie: 1, nNf: 1, tpAmb: '2', cDv: '0',
        },
        emitente: {
          cnpj: '11222333000181', xNome: 'Empresa Teste',
          ie: '123456789', crt: '3',
          endereco: {
            logradouro: 'Rua Teste', numero: '100', bairro: 'Centro',
            cep: '01001000', codigoMunicipio: '3550308', uf: 'SP',
          },
        },
        produtos: [{
          cProd: 'PROD001', xProd: 'Cimento CP-II 50kg', ncm: '25232900',
          cfop: '5102', uCom: 'UN', qCom: 10, vUnCom: 35, vProd: 350,
          imposto: {
            icms: { cst: '00', orig: '0', modBc: '3', vBc: 350, pIcms: 18, vIcms: 63 },
            pis: { cst: '01', vBc: 350, pPis: 0.65, vPis: 2.28 },
            cofins: { cst: '01', vBc: 350, pCofins: 3, vCofins: 10.50 },
          },
        }],
        totais: { vBc: 350, vIcms: 63, vProd: 350, vNf: 350, vPis: 2.28, vCofins: 10.50 },
      });

      expect(xml).toBeDefined();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<NFe xmlns=');
      expect(xml).toContain('<infNFe');
      expect(xml).toContain('</NFe>');
      expect(xml).toContain('<ide>');
      expect(xml).toContain('<emit>');
      expect(xml).toContain('<det nItem="1"');
      expect(xml).toContain('<total>');
      expect(xml).toContain('Cimento CP-II 50kg');
      expect(xml).toContain('25232900');
    });

    it('should escape XML special characters', async () => {
      const xml = await service.gerarXmlNfe({
        chaveAcesso: '35260111222333000181550010000000011000000010',
        emitente: { cnpj: '11222333000181', xNome: 'Test & Co <Ltd>' },
        produtos: [],
        totais: {},
      });

      expect(xml).toContain('&amp;');
      expect(xml).toContain('&lt;');
      expect(xml).toContain('&gt;');
    });
  });

  describe('gerarXmlNfce', () => {
    it('should generate NFC-e XML with QR code', async () => {
      const resultado = await service.gerarXmlNfce({
        chaveAcesso: '35260111222333000181650010000000011000000010',
        ide: { cUf: '35', cNf: '00000001', tpAmb: '2' },
        emitente: { cnpj: '11222333000181', xNome: 'Empresa Teste', cscId: '000001' },
        produtos: [],
        totais: {},
      });

      expect(resultado.xml).toBeDefined();
      expect(resultado.qrCodeUrl).toBeDefined();
      expect(resultado.xml).toContain('mod');
      expect(resultado.qrCodeUrl).toContain('qrcode');
    });
  });
});

// ============================================================
// SefazService Tests
// ============================================================

describe('SefazService', () => {
  let service: SefazService;

  beforeEach(async () => {
    const certService = {
      assinarXml: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SefazService,
        { provide: CertificadoDigitalService, useValue: certService },
      ],
    }).compile();

    service = module.get<SefazService>(SefazService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enviarLote', () => {
    it('should return success stub for lot submission', async () => {
      const resultado = await service.enviarLote('<xml/>', '123', 'SP', '2');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('103');
      expect(resultado.nRec).toBeDefined();
    });
  });

  describe('consultarRecibo', () => {
    it('should return authorized protocol', async () => {
      const resultado = await service.consultarRecibo('123456789012345', 'SP', '2');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('104');
      expect(resultado.protocolos).toBeDefined();
      expect(resultado.protocolos!.length).toBeGreaterThan(0);
      expect(resultado.protocolos![0].cStat).toBe('100');
    });
  });

  describe('cancelarNfe', () => {
    it('should reject cancellation with short justification', async () => {
      const resultado = await service.cancelarNfe('chave44', 'prot', 'curta', 'SP');
      expect(resultado.sucesso).toBe(false);
    });

    it('should accept valid cancellation', async () => {
      const resultado = await service.cancelarNfe(
        'chave44', 'prot', 'Justificativa valida para cancelamento da NF-e', 'SP',
      );
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('101');
    });
  });

  describe('cartaCorrecao', () => {
    it('should accept valid correction letter', async () => {
      const resultado = await service.cartaCorrecao('chave44', 'Correcao no endereco', 1, 'SP');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('135');
    });
  });

  describe('consultarStatusServico', () => {
    it('should return service operational', async () => {
      const resultado = await service.consultarStatusServico('SP');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('107');
    });
  });

  describe('manifestarDestinatario', () => {
    it('should accept valid manifestation type', async () => {
      const resultado = await service.manifestarDestinatario('chave44', '210200');
      expect(resultado.sucesso).toBe(true);
    });

    it('should reject invalid manifestation type', async () => {
      const resultado = await service.manifestarDestinatario('chave44', '999999');
      expect(resultado.sucesso).toBe(false);
    });
  });
});

// ============================================================
// SpedService Tests
// ============================================================

describe('SpedService', () => {
  let service: SpedService;
  let spedRepo: any;
  let empresaRepo: any;

  beforeEach(async () => {
    spedRepo = {
      create: jest.fn().mockImplementation((data) => ({ id: 'sped-1', ...data })),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
    };

    empresaRepo = {
      findOne: jest.fn().mockResolvedValue({
        cnpj: '11222333000181',
        razaoSocial: 'Empresa Teste LTDA',
        nomeFantasia: 'Empresa Teste',
        inscricaoEstadual: '123456789',
        inscricaoMunicipal: '12345',
        inscricaoSuframa: '',
        enderecoUf: 'SP',
        enderecoCodigoMunicipio: '3550308',
        enderecoLogradouro: 'Rua Teste',
        enderecoNumero: '100',
        enderecoComplemento: '',
        enderecoBairro: 'Centro',
        enderecoCep: '01001000',
        telefoneDdd: '11',
        telefoneNumero: '33334444',
        email: 'teste@empresa.com',
        spedCodigoPerfil: 'A',
        spedIndAtividade: '1',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpedService,
        { provide: getRepositoryToken(SpedRegistro), useValue: spedRepo },
        { provide: getRepositoryToken(EmpresaFiscal), useValue: empresaRepo },
      ],
    }).compile();

    service = module.get<SpedService>(SpedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('gerarSpedFiscal', () => {
    it('should generate SPED Fiscal file', async () => {
      const resultado = await service.gerarSpedFiscal('tenant1', 'empresa1', 2026, 1);

      expect(resultado).toBeDefined();
      expect(resultado.tipoSped).toBe('fiscal');
      expect(resultado.periodoAno).toBe(2026);
      expect(resultado.periodoMes).toBe(1);
      expect(resultado.conteudoArquivo).toBeDefined();
      expect(resultado.conteudoArquivo).toContain('|0000|');
      expect(resultado.conteudoArquivo).toContain('|9999|');
      expect(resultado.hashArquivo).toBeDefined();
      expect(resultado.hashArquivo.length).toBe(64); // SHA-256 hex
    });
  });

  describe('gerarSpedContribuicoes', () => {
    it('should generate SPED Contribuicoes file', async () => {
      const resultado = await service.gerarSpedContribuicoes('tenant1', 'empresa1', 2026, 1);

      expect(resultado).toBeDefined();
      expect(resultado.tipoSped).toBe('contribuicoes');
      expect(resultado.conteudoArquivo).toContain('|0000|');
      expect(resultado.conteudoArquivo).toContain('|M200|'); // Apuracao PIS
      expect(resultado.conteudoArquivo).toContain('|M600|'); // Apuracao COFINS
    });
  });

  describe('validarSped', () => {
    it('should validate a correct SPED file', async () => {
      spedRepo.findOne.mockResolvedValue({
        id: 'sped-1',
        conteudoArquivo: '|0000|019|0|\r\n|0001|0|\r\n|0990|3|\r\n|9999|4|',
        status: 'gerado',
      });
      spedRepo.save.mockImplementation((e: any) => Promise.resolve(e));

      const resultado = await service.validarSped('sped-1');
      expect(resultado.valido).toBe(true);
      expect(resultado.erros.length).toBe(0);
    });

    it('should reject SPED without 0000 record', async () => {
      spedRepo.findOne.mockResolvedValue({
        id: 'sped-2',
        conteudoArquivo: '|0001|0|\r\n|9999|2|',
        status: 'gerado',
      });
      spedRepo.save.mockImplementation((e: any) => Promise.resolve(e));

      const resultado = await service.validarSped('sped-2');
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('0000'))).toBe(true);
    });
  });
});

// ============================================================
// GuiaPagamentoService Tests
// ============================================================

describe('GuiaPagamentoService', () => {
  let service: GuiaPagamentoService;

  beforeEach(async () => {
    const obrigacaoRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    const empresaRepo = {
      findOne: jest.fn().mockResolvedValue({
        cnpj: '11222333000181',
        razaoSocial: 'Empresa Teste LTDA',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuiaPagamentoService,
        { provide: getRepositoryToken(ObrigacaoFiscal), useValue: obrigacaoRepo },
        { provide: getRepositoryToken(EmpresaFiscal), useValue: empresaRepo },
      ],
    }).compile();

    service = module.get<GuiaPagamentoService>(GuiaPagamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('gerarDAS', () => {
    it('should generate DAS payment guide', async () => {
      const resultado = await service.gerarDAS({
        tenantId: 'tenant1',
        empresaId: 'empresa1',
        periodoApuracao: '01/2026',
        valorTotal: 1500.00,
      });

      expect(resultado.tipo).toBe('DAS');
      expect(resultado.cnpj).toBe('11222333000181');
      expect(resultado.valorTotal).toBe(1500);
      expect(resultado.codigoBarras).toBeDefined();
      expect(resultado.linhaDigitavel).toBeDefined();
      expect(resultado.dataVencimento).toBeDefined();
      expect(resultado.reparticao).toBeDefined();
    });
  });

  describe('gerarDARF', () => {
    it('should generate DARF payment guide', async () => {
      const resultado = await service.gerarDARF({
        tenantId: 'tenant1',
        empresaId: 'empresa1',
        codigoReceita: '2172',
        periodoApuracao: '01/2026',
        valorPrincipal: 5000.00,
      });

      expect(resultado.tipo).toBe('DARF');
      expect(resultado.valorPrincipal).toBe(5000);
      expect(resultado.valorTotal).toBe(5000);
      expect(resultado.codigoReceita).toBe('2172');
    });

    it('should include multa and juros in total', async () => {
      const resultado = await service.gerarDARF({
        tenantId: 'tenant1',
        empresaId: 'empresa1',
        codigoReceita: '2172',
        periodoApuracao: '01/2026',
        valorPrincipal: 5000.00,
        valorMulta: 500.00,
        valorJuros: 150.00,
      });

      expect(resultado.valorTotal).toBe(5650);
    });
  });

  describe('gerarGNRE', () => {
    it('should generate GNRE payment guide', async () => {
      const resultado = await service.gerarGNRE({
        tenantId: 'tenant1',
        empresaId: 'empresa1',
        ufFavorecida: 'RJ',
        valorIcms: 2000.00,
        valorFcp: 200.00,
      });

      expect(resultado.tipo).toBe('GNRE');
      expect(resultado.ufFavorecida).toBe('RJ');
      expect(resultado.valorIcms).toBe(2000);
      expect(resultado.valorFcp).toBe(200);
      expect(resultado.valorTotal).toBe(2200);
    });
  });
});
