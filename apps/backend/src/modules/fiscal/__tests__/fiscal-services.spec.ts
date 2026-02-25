import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ValidadorTributarioService } from '../services/validador-tributario.service';
import { ReceitaFederalService } from '../services/receita-federal.service';
import { SintegraService } from '../services/sintegra.service';
import { CertificadoDigitalService } from '../services/certificado-digital.service';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

// ============================================================
// ValidadorTributarioService Tests
// ============================================================

describe('ValidadorTributarioService', () => {
  let service: ValidadorTributarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidadorTributarioService],
    }).compile();

    service = module.get<ValidadorTributarioService>(ValidadorTributarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate a correct tax result', () => {
    const resultado: any = {
      icmsCst: '000',
      icmsAliquota: 18,
      icmsBaseCalculo: 100,
      icmsValor: 18,
      icmsStBaseCalculo: 0,
      icmsStValor: 0,
      icmsStMva: 0,
      pisCst: '01',
      pisAliquota: 1.65,
      pisValor: 1.65,
      cofinsCst: '01',
      cofinsAliquota: 7.60,
      cofinsValor: 7.60,
      ipiValor: 0,
      valorTotalImpostos: 27.25,
      valorTotalProdutos: 100,
      difalValor: 0,
    };
    const contexto: any = {
      ufOrigem: 'SP',
      ufDestino: 'SP',
      regimeEmpresa: '3',
    };

    const alertas = service.validarOperacao(resultado, contexto);
    expect(alertas).toBeDefined();
    expect(Array.isArray(alertas)).toBe(true);
  });
});

// ============================================================
// ReceitaFederalService Tests
// ============================================================

describe('ReceitaFederalService', () => {
  let service: ReceitaFederalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReceitaFederalService],
    }).compile();

    service = module.get<ReceitaFederalService>(ReceitaFederalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validarCnpj', () => {
    it('should validate a valid CNPJ', () => {
      // CNPJ: 11.222.333/0001-81 (valido)
      expect(service.validarCnpj('11222333000181')).toBe(true);
    });

    it('should reject an invalid CNPJ', () => {
      expect(service.validarCnpj('11111111111111')).toBe(false);
      expect(service.validarCnpj('00000000000000')).toBe(false);
      expect(service.validarCnpj('12345678901234')).toBe(false);
    });

    it('should reject CNPJ with wrong length', () => {
      expect(service.validarCnpj('123')).toBe(false);
      expect(service.validarCnpj('')).toBe(false);
    });
  });

  describe('validarCpf', () => {
    it('should validate a valid CPF', () => {
      // CPF: 529.982.247-25 (valido)
      expect(service.validarCpf('52998224725')).toBe(true);
    });

    it('should reject an invalid CPF', () => {
      expect(service.validarCpf('11111111111')).toBe(false);
      expect(service.validarCpf('00000000000')).toBe(false);
      expect(service.validarCpf('12345678901')).toBe(false);
    });

    it('should reject CPF with wrong length', () => {
      expect(service.validarCpf('123')).toBe(false);
      expect(service.validarCpf('')).toBe(false);
    });
  });

  describe('consultarCnpj', () => {
    it('should reject CNPJ with wrong length', async () => {
      const resultado = await service.consultarCnpj('123');
      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toContain('14 digitos');
    });

    it('should reject invalid CNPJ (bad check digit)', async () => {
      const resultado = await service.consultarCnpj('12345678901234');
      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toContain('invalido');
    });

    it('should return stub data for valid CNPJ', async () => {
      const resultado = await service.consultarCnpj('11222333000181');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.razaoSocial).toBeDefined();
      expect(resultado.situacaoCadastral).toBeDefined();
    });
  });
});

// ============================================================
// SintegraService Tests
// ============================================================

describe('SintegraService', () => {
  let service: SintegraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SintegraService],
    }).compile();

    service = module.get<SintegraService>(SintegraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validarIE', () => {
    it('should accept ISENTO', () => {
      const resultado = service.validarIE('SP', 'ISENTO');
      expect(resultado.valido).toBe(true);
      expect(resultado.ie).toBe('ISENTO');
    });

    it('should validate SP IE format (12 digits)', () => {
      const resultado = service.validarIE('SP', '123456789012');
      // Format OK but DV might fail
      expect(resultado).toBeDefined();
      expect(resultado.uf).toBe('SP');
    });

    it('should reject IE with wrong format for UF', () => {
      const resultado = service.validarIE('SP', '123'); // SP needs 12 digits
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('formato');
    });

    it('should handle unknown UF', () => {
      const resultado = service.validarIE('XX', '123456789');
      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toContain('suportada');
    });
  });
});

// ============================================================
// CertificadoDigitalService Tests
// ============================================================

describe('CertificadoDigitalService', () => {
  let service: CertificadoDigitalService;

  beforeEach(async () => {
    const empresaRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadoDigitalService,
        { provide: getRepositoryToken(EmpresaFiscal), useValue: empresaRepo },
      ],
    }).compile();

    service = module.get<CertificadoDigitalService>(CertificadoDigitalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('gerarChaveAcesso', () => {
    it('should generate a 44-digit access key', () => {
      const chave = service.gerarChaveAcesso({
        cUf: '35',
        aamm: '2601',
        cnpj: '11222333000181',
        mod: '55',
        serie: '1',
        nNf: '1',
        tpEmis: '1',
        cNf: '00000001',
      });

      expect(chave).toBeDefined();
      expect(chave.length).toBe(44);
      expect(/^\d{44}$/.test(chave)).toBe(true);
    });

    it('should pad shorter values with zeros', () => {
      const chave = service.gerarChaveAcesso({
        cUf: '35',
        aamm: '2601',
        cnpj: '11222333000181',
        mod: '55',
        serie: '1',
        nNf: '1',
        tpEmis: '1',
        cNf: '1',
      });

      expect(chave.length).toBe(44);
    });
  });
});
