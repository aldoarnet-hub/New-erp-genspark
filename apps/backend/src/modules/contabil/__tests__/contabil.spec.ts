import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlanoContasService } from '../services/plano-contas.service';
import { MapeamentoContabilService } from '../services/mapeamento-contabil.service';
import { LancamentoContabilService } from '../services/lancamento-contabil.service';
import {
  PlanoContas,
  ContaBancaria,
  LancamentoContabil,
  MapeamentoOperacaoContabil,
  SaldoContabil,
} from '../entities/contabil.entities';
import { TipoOperacaoContabil } from '../enums/contabil.enums';

// ============================================================
// MOCKS
// ============================================================
const createMockRepository = () => ({
  create: jest.fn().mockImplementation((dto) => ({ id: 'test-id', ...dto })),
  save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'test-id', ...entity })),
  findOne: jest.fn().mockResolvedValue(null),
  find: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
    getMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  }),
});

describe('Modulo Contabil - Testes Completos', () => {
  let planoContasService: PlanoContasService;
  let mapeamentoService: MapeamentoContabilService;
  let lancamentoService: LancamentoContabilService;

  let planoContasRepo: any;
  let mapeamentoRepo: any;
  let lancamentoRepo: any;
  let saldoRepo: any;
  let contaBancariaRepo: any;

  beforeEach(async () => {
    planoContasRepo = createMockRepository();
    mapeamentoRepo = createMockRepository();
    lancamentoRepo = createMockRepository();
    saldoRepo = createMockRepository();
    contaBancariaRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanoContasService,
        MapeamentoContabilService,
        LancamentoContabilService,
        { provide: getRepositoryToken(PlanoContas), useValue: planoContasRepo },
        { provide: getRepositoryToken(MapeamentoOperacaoContabil), useValue: mapeamentoRepo },
        { provide: getRepositoryToken(LancamentoContabil), useValue: lancamentoRepo },
        { provide: getRepositoryToken(SaldoContabil), useValue: saldoRepo },
        { provide: getRepositoryToken(ContaBancaria), useValue: contaBancariaRepo },
      ],
    }).compile();

    planoContasService = module.get(PlanoContasService);
    mapeamentoService = module.get(MapeamentoContabilService);
    lancamentoService = module.get(LancamentoContabilService);
  });

  // ============================================================
  // PLANO DE CONTAS
  // ============================================================
  describe('PlanoContasService', () => {
    it('deve estar definido', () => {
      expect(planoContasService).toBeDefined();
    });

    it('deve inicializar plano de contas com todas as contas seed', async () => {
      planoContasRepo.findOne.mockResolvedValue(null); // nenhuma existe
      const result = await planoContasService.inicializarPlanoContas('tenant-1');
      expect(result.criadas).toBeGreaterThan(100);
      expect(result.existentes).toBe(0);
      expect(planoContasRepo.save).toHaveBeenCalled();
    });

    it('nao deve duplicar contas ja existentes', async () => {
      planoContasRepo.findOne.mockResolvedValue({ id: 'existing' });
      const result = await planoContasService.inicializarPlanoContas('tenant-1');
      expect(result.criadas).toBe(0);
      expect(result.existentes).toBeGreaterThan(100);
    });

    it('deve conter conta 1.1.01.001 - Caixa Geral', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const caixa = calls.find((c: any) => c[0].codigo === '1.1.01.001');
      expect(caixa).toBeDefined();
      expect(caixa[0].descricao).toBe('Caixa Geral');
      expect(caixa[0].tipoConta).toBe('ATIVO');
      expect(caixa[0].natureza).toBe('DEVEDORA');
      expect(caixa[0].aceitaLancamento).toBe(true);
    });

    it('deve conter contas de receita de vendas (3.1.01.001 a 3.1.01.009)', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const contasReceita = calls.filter((c: any) => c[0].codigo?.startsWith('3.1.01.'));
      expect(contasReceita.length).toBeGreaterThanOrEqual(9);
    });

    it('deve conter contas de despesa financeira (5.3.x)', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const despFin = calls.filter((c: any) => c[0].codigo?.startsWith('5.3.'));
      expect(despFin.length).toBeGreaterThan(10);
    });

    it('deve conter conta 1.1.09.001 - Aguardando Compensacao Cartao Credito', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const aguard = calls.find((c: any) => c[0].codigo === '1.1.09.001');
      expect(aguard).toBeDefined();
      expect(aguard[0].descricao).toContain('Cartao Credito');
    });

    it('deve conter conta 2.1.06.002 - Vales a Utilizar', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const vales = calls.find((c: any) => c[0].codigo === '2.1.06.002');
      expect(vales).toBeDefined();
      expect(vales[0].tipoConta).toBe('PASSIVO');
    });

    it('deve conter conta 2.1.07.001 - Boletos Devolvidos', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const bolDev = calls.find((c: any) => c[0].codigo === '2.1.07.001');
      expect(bolDev).toBeDefined();
    });

    it('deve conter conta 3.4.02.005 - Cobrancas Recuperadas', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const cobRec = calls.find((c: any) => c[0].codigo === '3.4.02.005');
      expect(cobRec).toBeDefined();
      expect(cobRec[0].tipoConta).toBe('RECEITA');
    });

    it('contas sinteticas nao devem aceitar lancamentos', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const sinteticas = calls.filter((c: any) => c[0].classe === 'SINTETICA');
      sinteticas.forEach((c: any) => {
        expect(c[0].aceitaLancamento).toBe(false);
      });
    });

    it('contas analiticas devem aceitar lancamentos', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await planoContasService.inicializarPlanoContas('tenant-1');
      const calls = planoContasRepo.create.mock.calls;
      const analiticas = calls.filter((c: any) => c[0].classe === 'ANALITICA');
      analiticas.forEach((c: any) => {
        expect(c[0].aceitaLancamento).toBe(true);
      });
    });

    it('deve buscar conta por codigo', async () => {
      planoContasRepo.findOne.mockResolvedValue({ codigo: '1.1.01.001', descricao: 'Caixa Geral' });
      const conta = await planoContasService.buscarContaPorCodigo('tenant-1', '1.1.01.001');
      expect(conta.descricao).toBe('Caixa Geral');
    });

    it('deve lancar erro ao buscar conta inexistente', async () => {
      planoContasRepo.findOne.mockResolvedValue(null);
      await expect(
        planoContasService.buscarContaPorCodigo('tenant-1', '9.9.99.999'),
      ).rejects.toThrow('nao encontrada');
    });
  });

  // ============================================================
  // MAPEAMENTO OPERACAO → CONTAS
  // ============================================================
  describe('MapeamentoContabilService', () => {
    it('deve estar definido', () => {
      expect(mapeamentoService).toBeDefined();
    });

    it('deve ter 32 operacoes mapeadas', () => {
      expect(mapeamentoService.getQuantidadeMapeamentos()).toBe(32);
    });

    it('deve inicializar todos os mapeamentos', async () => {
      mapeamentoRepo.findOne.mockResolvedValue(null);
      const result = await mapeamentoService.inicializarMapeamentos('tenant-1');
      expect(result.criados).toBe(32);
      expect(result.existentes).toBe(0);
    });

    it('deve listar todas as operacoes disponiveis', () => {
      const ops = mapeamentoService.getOperacoesDisponiveis();
      expect(ops.length).toBe(32);
      expect(ops.map((o) => o.operacao)).toContain(TipoOperacaoContabil.VENDA_DINHEIRO);
      expect(ops.map((o) => o.operacao)).toContain(TipoOperacaoContabil.VENDA_PIX);
      expect(ops.map((o) => o.operacao)).toContain(TipoOperacaoContabil.COMPENSACAO_CARTAO);
      expect(ops.map((o) => o.operacao)).toContain(TipoOperacaoContabil.EMPRESTIMO_LIBERACAO);
    });

    // === VALIDAR CADA MAPEAMENTO DA TABELA DO USUARIO ===

    it('VENDA_DINHEIRO: D 1.1.01.001 / C 3.1.01.001', () => {
      const ops = mapeamentoService.getOperacoesDisponiveis();
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_DINHEIRO);
      expect(m.contaDebitoCodigo).toBe('1.1.01.001');
      expect(m.contaCreditoCodigo).toBe('3.1.01.001');
    });

    it('VENDA_PIX: D 1.1.02.003 / C 3.1.01.005', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_PIX);
      expect(m.contaDebitoCodigo).toBe('1.1.02.003');
      expect(m.contaCreditoCodigo).toBe('3.1.01.005');
    });

    it('VENDA_CARTAO_CREDITO: D 1.1.09.001 / C 3.1.01.003', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_CARTAO_CREDITO);
      expect(m.contaDebitoCodigo).toBe('1.1.09.001');
      expect(m.contaCreditoCodigo).toBe('3.1.01.003');
    });

    it('VENDA_CARTAO_DEBITO: D 1.1.09.002 / C 3.1.01.004', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_CARTAO_DEBITO);
      expect(m.contaDebitoCodigo).toBe('1.1.09.002');
      expect(m.contaCreditoCodigo).toBe('3.1.01.004');
    });

    it('VENDA_BOLETO: D 1.1.04.002 / C 3.1.01.006', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_BOLETO);
      expect(m.contaDebitoCodigo).toBe('1.1.04.002');
      expect(m.contaCreditoCodigo).toBe('3.1.01.006');
    });

    it('VENDA_CREDIARIO: D 1.1.04.007 / C 3.1.01.008', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_CREDIARIO);
      expect(m.contaDebitoCodigo).toBe('1.1.04.007');
      expect(m.contaCreditoCodigo).toBe('3.1.01.008');
    });

    it('VENDA_VALE: D 2.1.06.002 / C 3.1.01.009', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.VENDA_VALE);
      expect(m.contaDebitoCodigo).toBe('2.1.06.002');
      expect(m.contaCreditoCodigo).toBe('3.1.01.009');
    });

    it('COMPENSACAO_CARTAO: D 1.1.02.001 / C 1.1.09.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.COMPENSACAO_CARTAO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.09.001');
    });

    it('TAXA_OPERADORA_CARTAO: D 5.3.02.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.TAXA_OPERADORA_CARTAO);
      expect(m.contaDebitoCodigo).toBe('5.3.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('RECEBIMENTO_BOLETO: D 1.1.02.001 / C 1.1.04.002', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.RECEBIMENTO_BOLETO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.04.002');
    });

    it('TARIFA_BOLETO: D 5.3.01.003 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.TARIFA_BOLETO);
      expect(m.contaDebitoCodigo).toBe('5.3.01.003');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('ANTECIPACAO_CARTAO: D 1.1.02.001 / C 1.1.09.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.ANTECIPACAO_CARTAO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.09.001');
    });

    it('CUSTO_ANTECIPACAO_CARTAO: D 5.3.04.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.CUSTO_ANTECIPACAO_CARTAO);
      expect(m.contaDebitoCodigo).toBe('5.3.04.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('ANTECIPACAO_BOLETO: D 1.1.02.001 / C 1.1.04.010', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.ANTECIPACAO_BOLETO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.04.010');
    });

    it('CUSTO_ANTECIPACAO_BOLETO: D 5.3.04.002 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.CUSTO_ANTECIPACAO_BOLETO);
      expect(m.contaDebitoCodigo).toBe('5.3.04.002');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('DESCONTO_BOLETO: D 1.1.02.001 / C 1.1.04.012', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.DESCONTO_BOLETO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.04.012');
    });

    it('CUSTO_DESCONTO_BOLETO: D 5.3.04.004 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.CUSTO_DESCONTO_BOLETO);
      expect(m.contaDebitoCodigo).toBe('5.3.04.004');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('BOLETO_DEVOLVIDO: D 2.1.07.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.BOLETO_DEVOLVIDO);
      expect(m.contaDebitoCodigo).toBe('2.1.07.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('RECUPERACAO_BOLETO_DEVOLVIDO: D 1.1.02.001 / C 3.4.02.005', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.RECUPERACAO_BOLETO_DEVOLVIDO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('3.4.02.005');
    });

    it('PREJUIZO_BOLETO_DEVOLVIDO: D 5.2.03.004 / C 2.1.07.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.PREJUIZO_BOLETO_DEVOLVIDO);
      expect(m.contaDebitoCodigo).toBe('5.2.03.004');
      expect(m.contaCreditoCodigo).toBe('2.1.07.001');
    });

    it('EMPRESTIMO_LIBERACAO: D 1.1.02.001 / C 2.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.EMPRESTIMO_LIBERACAO);
      expect(m.contaDebitoCodigo).toBe('1.1.02.001');
      expect(m.contaCreditoCodigo).toBe('2.1.02.001');
    });

    it('EMPRESTIMO_PAGAMENTO_PARCELA: D 2.1.02.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.EMPRESTIMO_PAGAMENTO_PARCELA);
      expect(m.contaDebitoCodigo).toBe('2.1.02.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('EMPRESTIMO_JUROS: D 5.3.03.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.EMPRESTIMO_JUROS);
      expect(m.contaDebitoCodigo).toBe('5.3.03.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('IOF_EMPRESTIMO: D 5.3.04.006 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.IOF_EMPRESTIMO);
      expect(m.contaDebitoCodigo).toBe('5.3.04.006');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('EMISSAO_VALE: D 5.2.03.002 / C 2.1.06.002', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.EMISSAO_VALE);
      expect(m.contaDebitoCodigo).toBe('5.2.03.002');
      expect(m.contaCreditoCodigo).toBe('2.1.06.002');
    });

    it('UTILIZACAO_VALE: D 2.1.06.002 / C 3.1.01.009', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.UTILIZACAO_VALE);
      expect(m.contaDebitoCodigo).toBe('2.1.06.002');
      expect(m.contaCreditoCodigo).toBe('3.1.01.009');
    });

    it('COMPRA_MERCADORIA: D 1.1.06.001 / C 2.1.01.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.COMPRA_MERCADORIA);
      expect(m.contaDebitoCodigo).toBe('1.1.06.001');
      expect(m.contaCreditoCodigo).toBe('2.1.01.001');
    });

    it('PAGAMENTO_FORNECEDOR: D 2.1.01.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.PAGAMENTO_FORNECEDOR);
      expect(m.contaDebitoCodigo).toBe('2.1.01.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('FOLHA_PAGAMENTO: D 5.1.01.001 / C 2.1.03.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.FOLHA_PAGAMENTO);
      expect(m.contaDebitoCodigo).toBe('5.1.01.001');
      expect(m.contaCreditoCodigo).toBe('2.1.03.001');
    });

    it('PAGAMENTO_SALARIOS: D 2.1.03.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.PAGAMENTO_SALARIOS);
      expect(m.contaDebitoCodigo).toBe('2.1.03.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('TAXA_BANCARIA_MANUTENCAO: D 5.3.01.001 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.TAXA_BANCARIA_MANUTENCAO);
      expect(m.contaDebitoCodigo).toBe('5.3.01.001');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('CHEQUE_ESPECIAL_JUROS: D 5.3.03.003 / C 1.1.02.001', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const m = mapeamentos.find((s: any) => s.tipoOperacao === TipoOperacaoContabil.CHEQUE_ESPECIAL_JUROS);
      expect(m.contaDebitoCodigo).toBe('5.3.03.003');
      expect(m.contaCreditoCodigo).toBe('1.1.02.001');
    });

    it('todos os mapeamentos devem pertencer a um grupo', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      const grupos = ['VENDAS', 'FINANCEIRO', 'COMPRAS', 'FOLHA'];
      mapeamentos.forEach((m: any) => {
        expect(grupos).toContain(m.grupo);
      });
    });

    it('todos os mapeamentos devem ter historico template', () => {
      const mapeamentos = (mapeamentoService as any).MAPEAMENTO_SEED;
      mapeamentos.forEach((m: any) => {
        expect(m.historicoTemplate.length).toBeGreaterThan(10);
        expect(m.historicoTemplate).toContain('{valor}');
      });
    });
  });

  // ============================================================
  // LANCAMENTO CONTABIL
  // ============================================================
  describe('LancamentoContabilService', () => {
    it('deve estar definido', () => {
      expect(lancamentoService).toBeDefined();
    });

    it('deve gerar lancamento automatico via mapeamento', async () => {
      mapeamentoRepo.findOne.mockResolvedValue({
        tipoOperacao: 'VENDA_DINHEIRO',
        contaDebitoCodigo: '1.1.01.001',
        contaDebitoDescricao: 'Caixa Geral',
        contaCreditoCodigo: '3.1.01.001',
        contaCreditoDescricao: 'Vendas a Vista (Dinheiro)',
        historicoTemplate: 'Venda a vista - Doc {documento} - R$ {valor}',
        ativo: true,
      });
      planoContasRepo.findOne.mockResolvedValue({ tipoConta: 'ATIVO', natureza: 'DEVEDORA' });
      saldoRepo.findOne.mockResolvedValue(null);

      const result = await lancamentoService.lancarAutomatico('tenant-1', {
        tipoOperacao: 'VENDA_DINHEIRO',
        valor: 1500.00,
        documentoOrigem: 'VENDA',
        numeroDocumentoExterno: 'NF-001234',
      });

      expect(result.contaDebitoCodigo).toBe('1.1.01.001');
      expect(result.contaCreditoCodigo).toBe('3.1.01.001');
      expect(result.valor).toBe(1500.00);
      expect(result.status).toBe('CONFIRMADO');
      expect(result.origem).toBe('AUTOMATICO');
    });

    it('deve substituir conta bancaria generica pela especifica', async () => {
      mapeamentoRepo.findOne.mockResolvedValue({
        tipoOperacao: 'RECEBIMENTO_BOLETO',
        contaDebitoCodigo: '1.1.02.001',
        contaDebitoDescricao: 'Banco Principal',
        contaCreditoCodigo: '1.1.04.002',
        contaCreditoDescricao: 'Boletos a Receber',
        historicoTemplate: 'Recebimento boleto - R$ {valor}',
        ativo: true,
      });
      contaBancariaRepo.findOne.mockResolvedValue({
        id: 'bank-1',
        contaContabilCodigo: '1.1.02.002',
        nome: 'Banco Itau - Conta 5678',
      });
      planoContasRepo.findOne.mockResolvedValue({ tipoConta: 'ATIVO', natureza: 'DEVEDORA' });
      saldoRepo.findOne.mockResolvedValue(null);

      const result = await lancamentoService.lancarAutomatico('tenant-1', {
        tipoOperacao: 'RECEBIMENTO_BOLETO',
        valor: 3000.00,
        contaBancariaId: 'bank-1',
      });

      expect(result.contaDebitoCodigo).toBe('1.1.02.002');
      expect(result.contaDebitoDescricao).toBe('Banco Itau - Conta 5678');
    });

    it('deve criar lancamento manual com validacao de conta', async () => {
      planoContasRepo.findOne
        .mockResolvedValueOnce({ codigo: '5.2.01.001', descricao: 'Aluguel', aceitaLancamento: true, ativo: true })
        .mockResolvedValueOnce({ codigo: '1.1.02.001', descricao: 'Banco Principal', aceitaLancamento: true, ativo: true })
        .mockResolvedValueOnce({ tipoConta: 'DESPESA', natureza: 'DEVEDORA' })
        .mockResolvedValueOnce({ tipoConta: 'ATIVO', natureza: 'DEVEDORA' });
      saldoRepo.findOne.mockResolvedValue(null);

      const result = await lancamentoService.lancarManual('tenant-1', {
        dataLancamento: '2026-02-25',
        tipoOperacao: 'MANUAL',
        contaDebitoCodigo: '5.2.01.001',
        contaCreditoCodigo: '1.1.02.001',
        valor: 5000.00,
        historico: 'Pagamento aluguel fev/2026',
      });

      expect(result.contaDebitoCodigo).toBe('5.2.01.001');
      expect(result.origem).toBe('MANUAL');
    });

    it('deve rejeitar lancamento com valor zero ou negativo', async () => {
      planoContasRepo.findOne
        .mockResolvedValueOnce({ codigo: '1.1.01.001', aceitaLancamento: true, ativo: true })
        .mockResolvedValueOnce({ codigo: '3.1.01.001', aceitaLancamento: true, ativo: true });

      await expect(
        lancamentoService.lancarManual('tenant-1', {
          dataLancamento: '2026-02-25',
          tipoOperacao: 'MANUAL',
          contaDebitoCodigo: '1.1.01.001',
          contaCreditoCodigo: '3.1.01.001',
          valor: 0,
          historico: 'Teste',
        }),
      ).rejects.toThrow('maior que zero');
    });

    it('deve rejeitar lancamento em conta sintetica', async () => {
      planoContasRepo.findOne.mockResolvedValueOnce({
        codigo: '1.1',
        descricao: 'ATIVO CIRCULANTE',
        aceitaLancamento: false,
        ativo: true,
      });

      await expect(
        lancamentoService.lancarManual('tenant-1', {
          dataLancamento: '2026-02-25',
          tipoOperacao: 'MANUAL',
          contaDebitoCodigo: '1.1',
          contaCreditoCodigo: '3.1.01.001',
          valor: 100,
          historico: 'Teste',
        }),
      ).rejects.toThrow('sintetica');
    });

    it('deve estornar lancamento existente (inverter debito/credito)', async () => {
      lancamentoRepo.findOne.mockResolvedValue({
        id: 'lanc-1',
        numero: 100,
        tenantId: 'tenant-1',
        contaDebitoCodigo: '1.1.01.001',
        contaDebitoDescricao: 'Caixa Geral',
        contaCreditoCodigo: '3.1.01.001',
        contaCreditoDescricao: 'Vendas a Vista',
        valor: 1500,
        tipoOperacao: 'VENDA_DINHEIRO',
        documentoOrigem: 'VENDA',
        status: 'CONFIRMADO',
      });
      planoContasRepo.findOne.mockResolvedValue({ tipoConta: 'ATIVO', natureza: 'DEVEDORA' });
      saldoRepo.findOne.mockResolvedValue(null);

      const result = await lancamentoService.estornarLancamento('tenant-1', 'lanc-1', {
        motivo: 'Erro no lancamento',
      });

      // Estorno inverte: Debito vira Credito e vice-versa
      expect(result.contaDebitoCodigo).toBe('3.1.01.001');
      expect(result.contaCreditoCodigo).toBe('1.1.01.001');
      expect(result.valor).toBe(1500);
      expect(result.historico).toContain('ESTORNO');
      expect(result.origem).toBe('ESTORNO');
    });

    it('nao deve estornar lancamento ja estornado', async () => {
      lancamentoRepo.findOne.mockResolvedValue({
        id: 'lanc-1',
        status: 'ESTORNADO',
        tenantId: 'tenant-1',
      });

      await expect(
        lancamentoService.estornarLancamento('tenant-1', 'lanc-1', { motivo: 'Teste' }),
      ).rejects.toThrow('ja foi estornado');
    });

    it('deve falhar quando mapeamento nao existe', async () => {
      mapeamentoRepo.findOne.mockResolvedValue(null);

      await expect(
        lancamentoService.lancarAutomatico('tenant-1', {
          tipoOperacao: 'OPERACAO_INEXISTENTE',
          valor: 100,
        }),
      ).rejects.toThrow('nao encontrado');
    });
  });

  // ============================================================
  // ENUMS
  // ============================================================
  describe('TipoOperacaoContabil Enum', () => {
    it('deve conter todas as 32 operacoes', () => {
      const ops = Object.values(TipoOperacaoContabil);
      expect(ops.length).toBe(32);
    });

    it('deve conter operacoes de venda', () => {
      expect(TipoOperacaoContabil.VENDA_DINHEIRO).toBe('VENDA_DINHEIRO');
      expect(TipoOperacaoContabil.VENDA_PIX).toBe('VENDA_PIX');
      expect(TipoOperacaoContabil.VENDA_CARTAO_CREDITO).toBe('VENDA_CARTAO_CREDITO');
      expect(TipoOperacaoContabil.VENDA_CARTAO_DEBITO).toBe('VENDA_CARTAO_DEBITO');
      expect(TipoOperacaoContabil.VENDA_BOLETO).toBe('VENDA_BOLETO');
      expect(TipoOperacaoContabil.VENDA_CREDIARIO).toBe('VENDA_CREDIARIO');
      expect(TipoOperacaoContabil.VENDA_VALE).toBe('VENDA_VALE');
    });

    it('deve conter operacoes financeiras', () => {
      expect(TipoOperacaoContabil.COMPENSACAO_CARTAO).toBe('COMPENSACAO_CARTAO');
      expect(TipoOperacaoContabil.TAXA_OPERADORA_CARTAO).toBe('TAXA_OPERADORA_CARTAO');
      expect(TipoOperacaoContabil.RECEBIMENTO_BOLETO).toBe('RECEBIMENTO_BOLETO');
      expect(TipoOperacaoContabil.TARIFA_BOLETO).toBe('TARIFA_BOLETO');
      expect(TipoOperacaoContabil.ANTECIPACAO_CARTAO).toBe('ANTECIPACAO_CARTAO');
      expect(TipoOperacaoContabil.ANTECIPACAO_BOLETO).toBe('ANTECIPACAO_BOLETO');
      expect(TipoOperacaoContabil.DESCONTO_BOLETO).toBe('DESCONTO_BOLETO');
      expect(TipoOperacaoContabil.BOLETO_DEVOLVIDO).toBe('BOLETO_DEVOLVIDO');
    });

    it('deve conter operacoes de emprestimo', () => {
      expect(TipoOperacaoContabil.EMPRESTIMO_LIBERACAO).toBe('EMPRESTIMO_LIBERACAO');
      expect(TipoOperacaoContabil.EMPRESTIMO_PAGAMENTO_PARCELA).toBe('EMPRESTIMO_PAGAMENTO_PARCELA');
      expect(TipoOperacaoContabil.EMPRESTIMO_JUROS).toBe('EMPRESTIMO_JUROS');
      expect(TipoOperacaoContabil.IOF_EMPRESTIMO).toBe('IOF_EMPRESTIMO');
    });

    it('deve conter operacoes de folha e compras', () => {
      expect(TipoOperacaoContabil.COMPRA_MERCADORIA).toBe('COMPRA_MERCADORIA');
      expect(TipoOperacaoContabil.PAGAMENTO_FORNECEDOR).toBe('PAGAMENTO_FORNECEDOR');
      expect(TipoOperacaoContabil.FOLHA_PAGAMENTO).toBe('FOLHA_PAGAMENTO');
      expect(TipoOperacaoContabil.PAGAMENTO_SALARIOS).toBe('PAGAMENTO_SALARIOS');
    });
  });
});
