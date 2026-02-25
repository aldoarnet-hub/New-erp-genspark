import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NfeXmlGeneratorService } from '../services/nfe-xml-generator.service';
import { CertificadoDigitalService } from '../services/certificado-digital.service';
import { SpedService } from '../services/sped.service';
import { SefazService } from '../services/sefaz.service';
import { GuiaPagamentoService } from '../services/guia-pagamento.service';
import { SpedRegistro } from '../entities/fiscal-complementar.entity';
import { ObrigacaoFiscal } from '../entities/fiscal-complementar.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

// ============================================================
// NfeXmlGeneratorService Tests
// ============================================================

describe('NfeXmlGeneratorService', () => {
  let service: NfeXmlGeneratorService;

  beforeEach(async () => {
    const certService = { assinarXml: jest.fn().mockResolvedValue('<xml/>') };

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
    it('should generate valid NF-e XML with required elements', async () => {
      const xml = await service.gerarXmlNfe({
        chaveAcesso: '35260011222333000181550010000000011000000010',
        ide: {
          cUf: '35', cNf: '00000001', natOp: 'VENDA',
          serie: 1, nNf: 1, tpAmb: '2',
        },
        emitente: {
          cnpj: '11222333000181',
          xNome: 'Empresa Teste LTDA',
          ie: '123456789012',
          crt: '3',
          endereco: {
            logradouro: 'Rua Teste', numero: '100',
            bairro: 'Centro', cep: '01001000',
            codigoMunicipio: '3550308', uf: 'SP',
          },
        },
        destinatario: {
          cnpjCpf: '98765432000199',
          nome: 'Destinatario Teste',
          uf: 'SP',
        },
        produtos: [{
          cProd: 'PROD001', xProd: 'Cimento CP-II 50kg',
          ncm: '25232900', cfop: '5102',
          qCom: 10, vUnCom: 35, vProd: 350,
          imposto: {
            icms: { cst: '00', vBc: 350, pIcms: 18, vIcms: 63 },
            pis: { cst: '01', vBc: 350, pPis: 1.65, vPis: 5.78 },
            cofins: { cst: '01', vBc: 350, pCofins: 7.60, vCofins: 26.60 },
          },
        }],
        totais: { vProd: 350, vNf: 350, vIcms: 63, vPis: 5.78, vCofins: 26.60 },
        pagamentos: [{ tPag: '01', vPag: 350 }],
      });

      expect(xml).toBeDefined();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('<NFe xmlns=');
      expect(xml).toContain('<infNFe');
      expect(xml).toContain('<ide>');
      expect(xml).toContain('<emit>');
      expect(xml).toContain('<dest>');
      expect(xml).toContain('<det nItem="1">');
      expect(xml).toContain('<total>');
      expect(xml).toContain('<pag>');
      expect(xml).toContain('</NFe>');
    });

    it('should generate XML without destinatario when no cnpjCpf', async () => {
      const xml = await service.gerarXmlNfe({
        chaveAcesso: '35260011222333000181550010000000011000000010',
        ide: { cUf: '35' },
        emitente: { cnpj: '11222333000181', xNome: 'Teste' },
        destinatario: {},
        produtos: [],
        totais: {},
      });

      expect(xml).toBeDefined();
      expect(xml).not.toContain('<dest>');
    });

    it('should handle multiple products', async () => {
      const xml = await service.gerarXmlNfe({
        chaveAcesso: '35260011222333000181550010000000011000000010',
        ide: {},
        emitente: { cnpj: '11222333000181' },
        produtos: [
          { cProd: 'P1', xProd: 'Produto 1', vProd: 100 },
          { cProd: 'P2', xProd: 'Produto 2', vProd: 200 },
          { cProd: 'P3', xProd: 'Produto 3', vProd: 300 },
        ],
        totais: { vProd: 600 },
      });

      expect(xml).toContain('nItem="1"');
      expect(xml).toContain('nItem="2"');
      expect(xml).toContain('nItem="3"');
    });
  });

  describe('gerarXmlNfce', () => {
    it('should generate NFC-e XML with QR Code URL', async () => {
      const result = await service.gerarXmlNfce({
        chaveAcesso: '35260011222333000181650010000000011000000010',
        ide: { cUf: '35', tpAmb: '2' },
        emitente: { cnpj: '11222333000181', cscId: '000001' },
        produtos: [{ cProd: 'P1', xProd: 'Produto', vProd: 50 }],
        totais: { vProd: 50, vNf: 50 },
        pagamentos: [{ tPag: '01', vPag: 50 }],
      });

      expect(result.xml).toBeDefined();
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.qrCodeUrl).toContain('qrcode');
    });
  });
});

// ============================================================
// SefazService Tests
// ============================================================

describe('SefazService', () => {
  let service: SefazService;

  beforeEach(async () => {
    const certService = {};

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
    it('should return success stub for homologacao', async () => {
      const resultado = await service.enviarLote('<xml/>', '123', 'SP', '2');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('103');
      expect(resultado.nRec).toBeDefined();
    });
  });

  describe('consultarRecibo', () => {
    it('should return success with protocol', async () => {
      const resultado = await service.consultarRecibo('123456789012345', 'SP', '2');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.protocolos).toBeDefined();
      expect(resultado.protocolos!.length).toBeGreaterThan(0);
      expect(resultado.protocolos![0].cStat).toBe('100');
    });
  });

  describe('cancelarNfe', () => {
    it('should reject short justification', async () => {
      const resultado = await service.cancelarNfe('chave', 'prot', 'curta', 'SP', '2');
      expect(resultado.sucesso).toBe(false);
    });

    it('should accept valid cancellation', async () => {
      const resultado = await service.cancelarNfe(
        'chave', 'prot',
        'Justificativa para cancelamento da nota fiscal',
        'SP', '2',
      );
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('101');
    });
  });

  describe('consultarStatusServico', () => {
    it('should return service operational', async () => {
      const resultado = await service.consultarStatusServico('SP', '2');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.cStat).toBe('107');
    });
  });

  describe('manifestarDestinatario', () => {
    it('should reject invalid manifestation type', async () => {
      const resultado = await service.manifestarDestinatario('chave', '999999');
      expect(resultado.sucesso).toBe(false);
    });

    it('should accept valid manifestation', async () => {
      const resultado = await service.manifestarDestinatario('chave', '210200');
      expect(resultado.sucesso).toBe(true);
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
      create: jest.fn().mockImplementation((data) => ({ id: 'sped-uuid', ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
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
        razaoSocial: 'Empresa Teste',
        nomeFantasia: 'Teste',
        enderecoUf: 'SP',
        inscricaoEstadual: '123456789012',
        inscricaoMunicipal: '12345',
        inscricaoSuframa: null,
        enderecoCep: '01001000',
        enderecoLogradouro: 'Rua Teste',
        enderecoNumero: '100',
        enderecoComplemento: '',
        enderecoBairro: 'Centro',
        enderecoCodigoMunicipio: '3550308',
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
      const resultado = await service.gerarSpedFiscal('tenant1', 'emp1', 2026, 1);

      expect(resultado).toBeDefined();
      expect(resultado.tipoSped).toBe('fiscal');
      expect(resultado.periodoAno).toBe(2026);
      expect(resultado.periodoMes).toBe(1);
      expect(resultado.conteudoArquivo).toContain('|0000|');
      expect(resultado.conteudoArquivo).toContain('|9999|');
      expect(resultado.hashArquivo).toBeDefined();
      expect(resultado.hashArquivo.length).toBe(64); // SHA-256
      expect(spedRepo.save).toHaveBeenCalled();
    });
  });

  describe('gerarSpedContribuicoes', () => {
    it('should generate SPED Contribuicoes file', async () => {
      const resultado = await service.gerarSpedContribuicoes('tenant1', 'emp1', 2026, 1);

      expect(resultado).toBeDefined();
      expect(resultado.tipoSped).toBe('contribuicoes');
      expect(resultado.conteudoArquivo).toContain('|0000|');
      expect(resultado.conteudoArquivo).toContain('|M200|'); // PIS
      expect(resultado.conteudoArquivo).toContain('|M600|'); // COFINS
      expect(resultado.conteudoArquivo).toContain('|9999|');
    });
  });

  describe('validarSped', () => {
    it('should validate a valid SPED file', async () => {
      spedRepo.findOne.mockResolvedValue({
        id: 'sped1',
        conteudoArquivo: '|0000|test|\r\n|0001|0|\r\n|0990|3|\r\n|9999|4|',
        status: 'gerado',
      });
      spedRepo.save.mockImplementation((data: any) => Promise.resolve(data));

      const resultado = await service.validarSped('sped1');
      expect(resultado.valido).toBe(true);
      expect(resultado.erros).toHaveLength(0);
    });

    it('should reject SPED without 0000 record', async () => {
      spedRepo.findOne.mockResolvedValue({
        id: 'sped2',
        conteudoArquivo: '|0001|0|\r\n|9999|2|',
        status: 'gerado',
      });
      spedRepo.save.mockImplementation((data: any) => Promise.resolve(data));

      const resultado = await service.validarSped('sped2');
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.length).toBeGreaterThan(0);
    });

    it('should reject non-existent SPED', async () => {
      spedRepo.findOne.mockResolvedValue(null);

      const resultado = await service.validarSped('inexistente');
      expect(resultado.valido).toBe(false);
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
    it('should generate DAS payment slip', async () => {
      const resultado = await service.gerarDAS({
        tenantId: 'tenant1',
        empresaId: 'emp1',
        periodoApuracao: '01/2026',
        valorTotal: 1500.00,
      });

      expect(resultado.tipo).toBe('DAS');
      expect(resultado.valorTotal).toBe(1500);
      expect(resultado.cnpj).toBe('11222333000181');
      expect(resultado.codigoBarras).toBeDefined();
      expect(resultado.linhaDigitavel).toBeDefined();
      expect(resultado.reparticao).toBeDefined();
      expect(resultado.dataVencimento).toBeDefined();
    });
  });

  describe('gerarDARF', () => {
    it('should generate DARF payment slip', async () => {
      const resultado = await service.gerarDARF({
        tenantId: 'tenant1',
        empresaId: 'emp1',
        codigoReceita: '2172',
        periodoApuracao: '01/2026',
        valorPrincipal: 5000,
        valorMulta: 100,
        valorJuros: 50,
      });

      expect(resultado.tipo).toBe('DARF');
      expect(resultado.valorPrincipal).toBe(5000);
      expect(resultado.valorMulta).toBe(100);
      expect(resultado.valorJuros).toBe(50);
      expect(resultado.valorTotal).toBe(5150);
      expect(resultado.codigoReceita).toBe('2172');
    });
  });

  describe('gerarGNRE', () => {
    it('should generate GNRE payment slip', async () => {
      const resultado = await service.gerarGNRE({
        tenantId: 'tenant1',
        empresaId: 'emp1',
        ufFavorecida: 'RJ',
        valorIcms: 500,
        valorFcp: 20,
      });

      expect(resultado.tipo).toBe('GNRE');
      expect(resultado.ufFavorecida).toBe('RJ');
      expect(resultado.valorIcms).toBe(500);
      expect(resultado.valorFcp).toBe(20);
      expect(resultado.valorTotal).toBe(520);
    });
  });
});
