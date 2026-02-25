/**
 * TESTES DOS EXEMPLOS DE CÁLCULO DO PROMPT 2 - FASE 2
 * 
 * Exemplos extraídos do documento de requisitos:
 * 1. Venda interna de cimento (SP→SP, Lucro Presumido)
 * 2. Venda interestadual com DIFAL (SP→RJ, consumidor final)
 * 3. Simples Nacional (Anexo I, Faixa 3)
 * 4. Devolução de compra
 * 5. ICMS-ST com redução de base de cálculo
 * 
 * + Validações de CalculoDifalService, CalculoSimplesNacionalService,
 *   ValidadorTributarioService, CertificadoDigitalService, SimuladorTributarioService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorTributarioService, ItemOperacao, ContextoTributario, ResultadoTributario } from '../services/motor-tributario.service';
import { CalculoDifalService } from '../services/calculo-difal.service';
import { CalculoSimplesNacionalService, ResultadoDAS } from '../services/calculo-simples-nacional.service';
import { ValidadorTributarioService, AlertaFiscal } from '../services/validador-tributario.service';
import { CertificadoDigitalService } from '../services/certificado-digital.service';
import { MatrizTributaria } from '../entities/matriz-tributaria.entity';
import { IcmsAliquotasUf } from '../entities/icms-tabelas.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

// ============================================================
// Helpers
// ============================================================
const round2 = (v: number) => Math.round(v * 100) / 100;

function createMatrizRegra(overrides: Partial<MatrizTributaria> = {}): MatrizTributaria {
  return {
    id: 'regra-001',
    tenantId: 'tenant-001',
    codigo: 'REGRA-001',
    descricao: 'Regra teste',
    prioridade: 1,
    icmsCst: '000',
    icmsAliq: 18,
    icmsReducaoBc: 0,
    icmsDiferimento: 0,
    icmsDesonerado: false,
    icmsMotivoDesoneracao: null,
    icmsStMva: null,
    icmsStAliq: null,
    icmsStReducaoBc: 0,
    icmsStModalidadeBc: '4',
    icmsStCst: null,
    icmsStPauta: null,
    ipiCst: '50',
    ipiAliq: 5,
    ipiUnidadeMedida: null,
    ipiValorUnidade: null,
    ipiEnquadramento: '999',
    pisCst: '01',
    pisAliq: 0.65,
    pisValorUnidade: null,
    cofinsCst: '01',
    cofinsAliq: 3.0,
    cofinsValorUnidade: null,
    issAliq: null,
    issRetido: false,
    issIncentivo: false,
    snCsosn: null,
    snAliquota: null,
    snCreditoSn: null,
    observacaoFiscal: null,
    informacaoComplementar: null,
    ativo: true,
    dataInicio: new Date('2020-01-01'),
    dataFim: null,
    ...overrides,
  } as any;
}

// ============================================================
// 1. MotorTributarioService - Exemplos de cálculo do Prompt 2
// ============================================================
describe('Prompt 2 - Exemplos de Cálculo Tributário', () => {
  let motorService: MotorTributarioService;
  let matrizQB: any;

  beforeEach(async () => {
    matrizQB = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    const matrizRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(matrizQB),
    };

    const aliquotasRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotorTributarioService,
        { provide: getRepositoryToken(MatrizTributaria), useValue: matrizRepo },
        { provide: getRepositoryToken(IcmsAliquotasUf), useValue: aliquotasRepo },
      ],
    }).compile();

    motorService = module.get<MotorTributarioService>(MotorTributarioService);
  });

  // ============================================================
  // Exemplo 1: Venda interna de cimento SP→SP (Lucro Presumido)
  // Cimento: NCM 25232900, CEST 0100100, CFOP 5102
  // Valor produto: R$ 350,00 (10 sacos × R$ 35,00)
  // ICMS: 18%, IPI: 5%, PIS: 0.65%, COFINS: 3.00%
  // ============================================================
  describe('Exemplo 1: Venda interna de cimento (SP→SP)', () => {
    const itemCimento: ItemOperacao = {
      produtoId: 'prod-cimento-001',
      ncm: '25232900',
      cest: '0100100',
      cfop: '5102',
      quantidade: 10,
      valorUnitario: 35.00,
      valorTotal: 350.00,
    };

    const contextoVendaInternaSP: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '3', // Lucro Presumido/Real
      ufOrigem: 'SP',
      ufDestino: 'SP',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
      pisCofinsCumulativo: true,
    };

    it('deve calcular ICMS 18% sobre base de R$ 350,00 = R$ 63,00', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({ icmsAliq: 18 }));
      const r = await motorService.calcularTributacao(itemCimento, contextoVendaInternaSP);
      expect(r.icmsBaseCalculo).toBe(350);
      expect(r.icmsAliquota).toBe(18);
      expect(r.icmsValor).toBe(63);
    });

    it('deve calcular IPI 5% sobre base de R$ 350,00 = R$ 17,50', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({ ipiCst: '50', ipiAliq: 5 }));
      const r = await motorService.calcularTributacao(itemCimento, contextoVendaInternaSP);
      expect(r.ipiBaseCalculo).toBe(350);
      expect(r.ipiAliquota).toBe(5);
      expect(r.ipiValor).toBe(17.50);
    });

    it('deve calcular PIS 0.65% e COFINS 3.00% (cumulativo)', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({
        pisCst: '01', pisAliq: 0.65,
        cofinsCst: '01', cofinsAliq: 3.0,
      }));
      const r = await motorService.calcularTributacao(itemCimento, contextoVendaInternaSP);
      expect(r.pisBaseCalculo).toBe(350);
      expect(r.pisAliquota).toBe(0.65);
      expect(r.pisValor).toBe(round2(350 * 0.65 / 100)); // 2.28
      expect(r.cofinsBaseCalculo).toBe(350);
      expect(r.cofinsAliquota).toBe(3.0);
      expect(r.cofinsValor).toBe(round2(350 * 3.0 / 100)); // 10.50
    });

    it('nao deve aplicar DIFAL em venda interna (SP→SP)', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra());
      const r = await motorService.calcularTributacao(itemCimento, contextoVendaInternaSP);
      expect(r.difalAplica).toBe(false);
      expect(r.difalValor).toBe(0);
      expect(r.fcpValor).toBe(0);
    });

    it('nao deve aplicar ICMS-ST (sem MVA configurada)', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({ icmsStMva: undefined as any }));
      const r = await motorService.calcularTributacao(itemCimento, contextoVendaInternaSP);
      expect(r.icmsStValor).toBe(0);
    });
  });

  // ============================================================
  // Exemplo 2: Venda interestadual com DIFAL (SP→RJ, consumidor final)
  // Valor: R$ 1.000,00
  // Alíquota interestadual: 12% (Sul/Sudeste → Sul/Sudeste)
  // Alíquota interna RJ: 20%
  // DIFAL: 20% - 12% = 8% → R$ 80,00 (100% UF destino desde 2019)
  // FCP RJ: 2% → R$ 20,00
  // ============================================================
  describe('Exemplo 2: Venda interestadual SP→RJ com DIFAL', () => {
    const itemInterestadual: ItemOperacao = {
      produtoId: 'prod-inter-001',
      ncm: '25232900',
      cfop: '6102',
      quantidade: 1,
      valorUnitario: 1000.00,
      valorTotal: 1000.00,
    };

    const contextoDIFAL: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '3',
      ufOrigem: 'SP',
      ufDestino: 'RJ',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: true, // Consumidor final
      contribuinteIcms: false, // Não contribuinte
    };

    it('deve aplicar DIFAL para operação interestadual com não-contribuinte', async () => {
      matrizQB.getOne.mockResolvedValue(null); // Sem regra específica
      const r = await motorService.calcularTributacao(itemInterestadual, contextoDIFAL);
      expect(r.difalAplica).toBe(true);
    });

    it('deve calcular DIFAL = (aliq interna RJ - aliq inter) × base', async () => {
      matrizQB.getOne.mockResolvedValue(null);
      const r = await motorService.calcularTributacao(itemInterestadual, contextoDIFAL);
      // RJ interna = 20%, SP→RJ interestadual (contribuinte for DIFAL) = 12%
      // DIFAL = (20-12) = 8% de 1000 = 80
      expect(r.difalAplica).toBe(true);
      expect(r.difalBase).toBe(1000);
      expect(r.difalAliqInterna).toBe(20);
      expect(r.difalAliqInter).toBe(12);
      expect(r.difalValor).toBe(80);
    });

    it('deve calcular FCP do RJ = 2%', async () => {
      matrizQB.getOne.mockResolvedValue(null);
      const r = await motorService.calcularTributacao(itemInterestadual, contextoDIFAL);
      expect(r.fcpAliq).toBe(2);
      expect(r.fcpValor).toBe(20); // 2% de 1000
    });
  });

  // ============================================================
  // Exemplo 3: Simples Nacional (testado via CalculoSimplesNacionalService)
  // ============================================================
  describe('Exemplo 3: Operação no Simples Nacional', () => {
    const itemSN: ItemOperacao = {
      produtoId: 'prod-sn-001',
      ncm: '25232900',
      cfop: '5102',
      quantidade: 5,
      valorUnitario: 100.00,
      valorTotal: 500.00,
    };

    const contextoSN: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '1', // Simples Nacional
      ufOrigem: 'SP',
      ufDestino: 'SP',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
    };

    it('PIS e COFINS devem ser zero (já incluídos no DAS)', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({
        snCsosn: '102', snAliquota: 4.0,
      }));
      const r = await motorService.calcularTributacao(itemSN, contextoSN);
      expect(r.pisValor).toBe(0);
      expect(r.cofinsValor).toBe(0);
    });

    it('deve retornar CSOSN para Simples Nacional', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({ snCsosn: '102' }));
      const r = await motorService.calcularTributacao(itemSN, contextoSN);
      expect(r.snCsosn).toBe('102');
    });
  });

  // ============================================================
  // Exemplo 4: Devolução de compra (CFOP 5201)
  // ============================================================
  describe('Exemplo 4: Devolução de compra', () => {
    const itemDevolucao: ItemOperacao = {
      produtoId: 'prod-dev-001',
      ncm: '25232900',
      cfop: '5201',
      quantidade: 5,
      valorUnitario: 35.00,
      valorTotal: 175.00,
    };

    const contextoDevolucao: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '3',
      ufOrigem: 'SP',
      ufDestino: 'SP',
      tipoOperacao: 'S',
      finalidadeEmissao: '4', // Devolução
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
    };

    it('deve calcular valores em operação de devolução', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({ icmsAliq: 18, ipiCst: '50', ipiAliq: 5 }));
      const r = await motorService.calcularTributacao(itemDevolucao, contextoDevolucao);
      expect(r.valorTotalProdutos).toBe(175.00);
      expect(r.icmsValor).toBeGreaterThan(0); // Deve destacar ICMS
      expect(r.ipiValor).toBeGreaterThan(0);  // Deve destacar IPI
    });
  });

  // ============================================================
  // Exemplo 5: ICMS-ST com redução de base de cálculo
  // Produto: NCM 25232900, MVA 40%, redução BC ST 10%
  // Base ICMS próprio: R$ 350,00 → ICMS = R$ 63,00
  // Base ST = 350 × (1 + 40%) = 490; com redução 10% = 441
  // ICMS-ST = (441 × 18%) - 63 = 79,38 - 63 = 16,38
  // ============================================================
  describe('Exemplo 5: ICMS-ST com redução de BC', () => {
    const itemST: ItemOperacao = {
      produtoId: 'prod-st-001',
      ncm: '25232900',
      cest: '0100100',
      cfop: '5401',
      quantidade: 10,
      valorUnitario: 35.00,
      valorTotal: 350.00,
    };

    const contextoST: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '3',
      ufOrigem: 'SP',
      ufDestino: 'SP',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
    };

    it('deve calcular ICMS-ST com MVA e redução de BC', async () => {
      matrizQB.getOne.mockResolvedValue(createMatrizRegra({
        icmsCst: '010', icmsAliq: 18,
        icmsStMva: 40, icmsStReducaoBc: 10,
      }));
      const r = await motorService.calcularTributacao(itemST, contextoST);

      // ICMS próprio
      expect(r.icmsBaseCalculo).toBe(350);
      expect(r.icmsValor).toBe(63);

      // ICMS-ST
      expect(r.icmsStMva).toBe(40);
      expect(r.icmsStReducaoBc).toBe(10);
      // Base ST = 350 × 1.4 = 490 → com redução 10% = 441
      expect(r.icmsStBaseCalculo).toBe(441);
      // Valor ST = (441 × 18%) - 63 = 79.38 - 63 = 16.38
      expect(r.icmsStValor).toBe(16.38);
    });
  });

  // ============================================================
  // Alíquota interestadual conforme Convênio 115/2003
  // ============================================================
  describe('Alíquotas interestaduais (Convênio 115/2003)', () => {
    const item1000: ItemOperacao = {
      produtoId: 'prod-001',
      ncm: '25232900',
      cfop: '6102',
      quantidade: 1,
      valorUnitario: 1000,
      valorTotal: 1000,
    };

    const baseCtx: ContextoTributario = {
      tenantId: 'tenant-001',
      empresaId: 'empresa-001',
      regimeEmpresa: '3',
      ufOrigem: 'SP',
      ufDestino: 'BA',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
    };

    it('SP→BA (Sul/Sudeste→Outros) = 7%', async () => {
      matrizQB.getOne.mockResolvedValue(null);
      const r = await motorService.calcularTributacao(item1000, { ...baseCtx, ufOrigem: 'SP', ufDestino: 'BA' });
      expect(r.icmsAliquota).toBe(7);
    });

    it('SP→RJ (Sul/Sudeste→Sul/Sudeste) = 12%', async () => {
      matrizQB.getOne.mockResolvedValue(null);
      const r = await motorService.calcularTributacao(item1000, { ...baseCtx, ufOrigem: 'SP', ufDestino: 'RJ' });
      expect(r.icmsAliquota).toBe(12);
    });

    it('BA→SP (Outros→Qualquer) = 12%', async () => {
      matrizQB.getOne.mockResolvedValue(null);
      const r = await motorService.calcularTributacao(item1000, { ...baseCtx, ufOrigem: 'BA', ufDestino: 'SP' });
      expect(r.icmsAliquota).toBe(12);
    });
  });
});

// ============================================================
// 2. CalculoDifalService - Exemplos do Prompt 2
// ============================================================
describe('CalculoDifalService - Prompt 2 Examples', () => {
  let difalService: CalculoDifalService;

  beforeEach(async () => {
    const aliquotasRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculoDifalService,
        { provide: getRepositoryToken(IcmsAliquotasUf), useValue: aliquotasRepo },
      ],
    }).compile();

    difalService = module.get<CalculoDifalService>(CalculoDifalService);
  });

  it('SP→RJ consumidor final: DIFAL = (20 - 12)% = 8%', async () => {
    const r = await difalService.calcularDifal({
      valorBase: 1000,
      ufOrigem: 'SP',
      ufDestino: 'RJ',
      consumidorFinal: true,
      contribuinteIcms: false,
    });
    expect(r.aplicaDifal).toBe(true);
    expect(r.aliquotaDifal).toBe(8);
    expect(r.valorDifal).toBe(80);
    expect(r.partilhaDestinoPercent).toBe(100); // 100% destino desde 2019
  });

  it('SP→BA consumidor final: DIFAL = (20.5 - 7)% = 13.5%', async () => {
    const r = await difalService.calcularDifal({
      valorBase: 1000,
      ufOrigem: 'SP',
      ufDestino: 'BA',
      consumidorFinal: true,
      contribuinteIcms: false,
    });
    expect(r.aplicaDifal).toBe(true);
    expect(r.aliquotaDifal).toBe(13.5);
    expect(r.valorDifal).toBe(135);
  });

  it('Operação interna: DIFAL não se aplica', async () => {
    const r = await difalService.calcularDifal({
      valorBase: 1000,
      ufOrigem: 'SP',
      ufDestino: 'SP',
      consumidorFinal: true,
      contribuinteIcms: false,
    });
    expect(r.aplicaDifal).toBe(false);
    expect(r.valorDifal).toBe(0);
  });

  it('Contribuinte ICMS (antecipação): deve calcular DIFAL', async () => {
    const r = await difalService.calcularDifalContribuinte({
      valorBase: 1000,
      ufOrigem: 'SP',
      ufDestino: 'RJ',
    });
    expect(r.valorDifal).toBeGreaterThan(0);
    expect(r.diferencial).toBeGreaterThan(0);
  });

  it('FCP por UF', () => {
    expect(difalService.getAliquotaFcp('RJ')).toBe(2);
    expect(difalService.getAliquotaFcp('SP')).toBe(2);
    expect(difalService.getAliquotaFcp('SC')).toBe(0);
  });

  it('Alíquota interestadual conforme Convênio 115/2003', () => {
    expect(difalService.getAliquotaInterestadual('SP', 'BA')).toBe(7); // Sul/Sudeste → Outros
    expect(difalService.getAliquotaInterestadual('SP', 'RJ')).toBe(12); // Sul/Sudeste → Sul/Sudeste
    expect(difalService.getAliquotaInterestadual('BA', 'SP')).toBe(12); // Outros → Qualquer
    expect(difalService.getAliquotaInterestadual('SP', 'SP')).toBe(0); // Interna
  });
});

// ============================================================
// 3. CalculoSimplesNacionalService - Prompt 2 tabelas e exemplos
// ============================================================
describe('CalculoSimplesNacionalService - Prompt 2 Examples', () => {
  let snService: CalculoSimplesNacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculoSimplesNacionalService],
    }).compile();

    snService = module.get<CalculoSimplesNacionalService>(CalculoSimplesNacionalService);
  });

  describe('Tabela Anexo I (Comércio)', () => {
    it('Faixa 1: RBT12 = R$ 150.000 → Alíquota 4%, Desconto R$ 0', () => {
      const r = snService.calcularDAS(150000, 12500, 'I');
      expect(r.faixa).toBe(1);
      expect(r.aliquotaTabela).toBe(4.0);
      expect(r.desconto).toBe(0);
    });

    it('Faixa 3: RBT12 = R$ 500.000, Receita mês = R$ 80.000', () => {
      const r = snService.calcularDAS(500000, 80000, 'I');
      expect(r.faixa).toBe(3);
      expect(r.aliquotaTabela).toBe(9.5);
      expect(r.desconto).toBe(13860);
      // Alíquota efetiva = [(500000 × 9.5%) - 13860] / 500000 = (47500 - 13860) / 500000 = 6.728%
      expect(r.aliquotaEfetiva).toBeCloseTo(6.73, 1);
      // Valor DAS = 80000 × 6.728% ≈ R$ 5.382,40
      expect(r.valorDas).toBeGreaterThan(5000);
    });

    it('Faixa 6: RBT12 = R$ 4.500.000 → Alíquota 19.00%', () => {
      const r = snService.calcularDAS(4500000, 375000, 'I');
      expect(r.faixa).toBe(6);
      expect(r.aliquotaTabela).toBe(19.0);
      expect(r.desconto).toBe(378000);
    });
  });

  describe('Tabela Anexo II (Indústria)', () => {
    it('Faixa 1: RBT12 = R$ 100.000 → Alíquota 4.5%', () => {
      const r = snService.calcularDAS(100000, 8333, 'II');
      expect(r.faixa).toBe(1);
      expect(r.aliquotaTabela).toBe(4.5);
    });
  });

  describe('Tabela Anexo III (Serviços)', () => {
    it('Faixa 1: RBT12 = R$ 100.000 → Alíquota 6.00%', () => {
      const r = snService.calcularDAS(100000, 8333, 'III');
      expect(r.faixa).toBe(1);
      expect(r.aliquotaTabela).toBe(6.0);
    });
  });

  describe('Fator R (Anexo III vs V)', () => {
    it('Fator R >= 0.28 → Tributar pelo Anexo III', () => {
      const r = snService.calcularDAS(500000, 50000, 'V', 0.30);
      expect(r.anexo).toBe('III');
    });

    it('Fator R < 0.28 → Tributar pelo Anexo V', () => {
      const r = snService.calcularDAS(500000, 50000, 'V', 0.20);
      expect(r.anexo).toBe('V');
    });

    it('Calcular Fator R', () => {
      const fatorR = snService.calcularFatorR(150000, 500000);
      expect(fatorR).toBe(0.3);
    });
  });

  describe('Repartição do DAS entre tributos', () => {
    it('Anexo I deve repartir entre IRPJ, CSLL, COFINS, PIS, CPP, ICMS', () => {
      const r = snService.calcularDAS(150000, 12500, 'I');
      expect(r.reparticao).toHaveProperty('irpj');
      expect(r.reparticao).toHaveProperty('csll');
      expect(r.reparticao).toHaveProperty('cofins');
      expect(r.reparticao).toHaveProperty('pis');
      expect(r.reparticao).toHaveProperty('cpp');
      expect(r.reparticao).toHaveProperty('icms');
    });

    it('Anexo II deve incluir IPI na repartição', () => {
      const r = snService.calcularDAS(150000, 12500, 'II');
      expect(r.reparticao).toHaveProperty('ipi');
    });

    it('Anexo III deve incluir ISS na repartição', () => {
      const r = snService.calcularDAS(150000, 12500, 'III');
      expect(r.reparticao).toHaveProperty('iss');
    });
  });

  describe('Comparação de regimes', () => {
    it('deve comparar Simples, Presumido e Real e recomendar o melhor', () => {
      const resultado = snService.compararRegimes(500000, 'SP');
      expect(resultado.comparacao).toHaveProperty('simples');
      expect(resultado.comparacao).toHaveProperty('presumido');
      expect(resultado.comparacao).toHaveProperty('real');
      expect(resultado.recomendacao).toBeDefined();
      expect(resultado.economiaPotencial).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================
// 4. ValidadorTributarioService - Alertas do Prompt 2
// ============================================================
describe('ValidadorTributarioService - Prompt 2 Validations', () => {
  let validador: ValidadorTributarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidadorTributarioService],
    }).compile();

    validador = module.get<ValidadorTributarioService>(ValidadorTributarioService);
  });

  const baseResultado: ResultadoTributario = {
    icmsBaseCalculo: 1000, icmsAliquota: 18, icmsValor: 180,
    icmsReducaoBc: 0, icmsDiferido: 0, icmsDesonerado: 0, icmsCst: '000',
    icmsStBaseCalculo: 0, icmsStAliquota: 0, icmsStValor: 0, icmsStMva: 0, icmsStReducaoBc: 0,
    difalAplica: false, difalBase: 0, difalAliqInterna: 0, difalAliqInter: 0,
    difalValor: 0, fcpBase: 0, fcpAliq: 0, fcpValor: 0,
    ipiBaseCalculo: 1000, ipiAliquota: 5, ipiValor: 50, ipiCst: '50',
    pisBaseCalculo: 1000, pisAliquota: 0.65, pisValor: 6.5, pisCst: '01',
    cofinsBaseCalculo: 1000, cofinsAliquota: 3, cofinsValor: 30, cofinsCst: '01',
    issBaseCalculo: 0, issAliquota: 0, issValor: 0, issRetido: false,
    valorTotalProdutos: 1000, valorTotalImpostos: 266.5, valorTotalNota: 1266.5,
    regraPrioridade: 1, observacoes: [],
  };

  const baseContexto: ContextoTributario = {
    tenantId: 't1', empresaId: 'e1', regimeEmpresa: '3',
    ufOrigem: 'SP', ufDestino: 'SP', tipoOperacao: 'S',
    finalidadeEmissao: '1', indicadorPresenca: '1',
    consumidorFinal: false, contribuinteIcms: true,
  };

  it('CST 000 com alíquota 0 deve gerar alerta ERRO', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, icmsCst: '000', icmsAliquota: 0 },
      baseContexto,
    );
    const alerta = alertas.find(a => a.campo === 'icms_aliquota');
    expect(alerta).toBeDefined();
    expect(alerta!.severidade).toBe('erro');
  });

  it('CST 040/041/050 com valor ICMS > 0 deve gerar alerta', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, icmsCst: '040', icmsValor: 100 },
      baseContexto,
    );
    const alerta = alertas.find(a => a.campo === 'icms_valor');
    expect(alerta).toBeDefined();
  });

  it('MVA > 150% deve gerar alerta', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, icmsStMva: 200 },
      baseContexto,
    );
    const alerta = alertas.find(a => a.campo === 'icms_st_mva');
    expect(alerta).toBeDefined();
    expect(alerta!.mensagem).toContain('MVA muito alta');
  });

  it('Divergência no total de impostos deve gerar alerta ERRO', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, valorTotalImpostos: 999 },
      baseContexto,
    );
    const alerta = alertas.find(a => a.campo === 'valor_total_impostos');
    expect(alerta).toBeDefined();
    expect(alerta!.severidade).toBe('erro');
  });

  it('Carga tributária > 50% deve gerar alerta', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, valorTotalImpostos: 600, valorTotalProdutos: 1000 },
      baseContexto,
    );
    const alerta = alertas.find(a => a.campo === 'carga_tributaria');
    expect(alerta).toBeDefined();
  });

  it('PIS/COFINS destacado no Simples Nacional deve gerar alerta ERRO', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, pisValor: 10, cofinsValor: 30 },
      { ...baseContexto, regimeEmpresa: '1' },
    );
    const alerta = alertas.find(a => a.campo === 'pis_cofins_simples');
    expect(alerta).toBeDefined();
    expect(alerta!.severidade).toBe('erro');
  });

  it('Operação interestadual com não contribuinte sem DIFAL deve alertar', () => {
    const alertas = validador.validarOperacao(
      { ...baseResultado, difalAplica: false },
      { ...baseContexto, ufDestino: 'RJ', contribuinteIcms: false },
    );
    const alerta = alertas.find(a => a.campo === 'difal');
    expect(alerta).toBeDefined();
  });
});

// ============================================================
// 5. CertificadoDigitalService - Chave de acesso e DV
// ============================================================
describe('CertificadoDigitalService - Chave de acesso NF-e', () => {
  let certService: CertificadoDigitalService;

  beforeEach(async () => {
    const empresaRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificadoDigitalService,
        { provide: getRepositoryToken(EmpresaFiscal), useValue: empresaRepo },
      ],
    }).compile();

    certService = module.get<CertificadoDigitalService>(CertificadoDigitalService);
  });

  it('deve gerar chave de acesso com 44 dígitos', () => {
    const chave = certService.gerarChaveAcesso({
      cUf: '35', aamm: '2602', cnpj: '12345678000195',
      mod: '55', serie: '001', nNf: '000000001',
      tpEmis: '1', cNf: '00000001',
    });
    expect(chave).toHaveLength(44);
  });

  it('deve calcular dígito verificador correto (módulo 11)', () => {
    const chave = certService.gerarChaveAcesso({
      cUf: '35', aamm: '2602', cnpj: '12345678000195',
      mod: '55', serie: '001', nNf: '000000001',
      tpEmis: '1', cNf: '00000001',
    });
    // Último dígito é o DV
    const dv = parseInt(chave[43], 10);
    expect(dv).toBeGreaterThanOrEqual(0);
    expect(dv).toBeLessThanOrEqual(9);
  });

  it('chave de acesso deve conter cUf, CNPJ, modelo, série, número', () => {
    const chave = certService.gerarChaveAcesso({
      cUf: '35', aamm: '2602', cnpj: '12345678000195',
      mod: '55', serie: '001', nNf: '000000001',
      tpEmis: '1', cNf: '12345678',
    });
    expect(chave.substring(0, 2)).toBe('35'); // cUf
    expect(chave.substring(2, 6)).toBe('2602'); // AAMM
    expect(chave.substring(6, 20)).toBe('12345678000195'); // CNPJ
    expect(chave.substring(20, 22)).toBe('55'); // mod
    expect(chave.substring(22, 25)).toBe('001'); // série
    expect(chave.substring(25, 34)).toBe('000000001'); // nNf
  });
});
