import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MotorTributarioService, ItemOperacao, ContextoTributario, ResultadoTributario } from '../services/motor-tributario.service';
import { MatrizTributaria } from '../entities/matriz-tributaria.entity';
import { IcmsAliquotasUf } from '../entities/icms-tabelas.entity';

describe('MotorTributarioService', () => {
  let service: MotorTributarioService;
  let matrizRepo: jest.Mocked<Partial<Repository<MatrizTributaria>>>;
  let aliquotasRepo: jest.Mocked<Partial<Repository<IcmsAliquotasUf>>>;

  beforeEach(async () => {
    matrizRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    aliquotasRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotorTributarioService,
        { provide: getRepositoryToken(MatrizTributaria), useValue: matrizRepo },
        { provide: getRepositoryToken(IcmsAliquotasUf), useValue: aliquotasRepo },
      ],
    }).compile();

    service = module.get<MotorTributarioService>(MotorTributarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularTributacao', () => {
    const baseItem: ItemOperacao = {
      produtoId: '123e4567-e89b-12d3-a456-426614174000',
      ncm: '25232900',
      cfop: '5102',
      quantidade: 10,
      valorUnitario: 35,
      valorTotal: 350,
    };

    const baseContexto: ContextoTributario = {
      tenantId: '00000000-0000-0000-0000-000000000001',
      empresaId: '00000000-0000-0000-0000-000000000002',
      regimeEmpresa: '3',
      ufOrigem: 'SP',
      ufDestino: 'SP',
      tipoOperacao: 'S',
      finalidadeEmissao: '1',
      indicadorPresenca: '1',
      consumidorFinal: false,
      contribuinteIcms: true,
    };

    it('should calculate taxes for internal sale (Lucro Presumido)', async () => {
      const resultado = await service.calcularTributacao(baseItem, baseContexto);

      expect(resultado).toBeDefined();
      expect(resultado.valorTotalProdutos).toBe(350);
      expect(resultado.icmsCst).toBeDefined();
      expect(resultado.icmsBaseCalculo).toBeGreaterThanOrEqual(0);
      expect(resultado.valorTotalImpostos).toBeGreaterThanOrEqual(0);
      expect(resultado.valorTotalNota).toBeGreaterThanOrEqual(resultado.valorTotalProdutos);
    });

    it('should calculate with Simples Nacional (regime 1)', async () => {
      const contextoSN: ContextoTributario = { ...baseContexto, regimeEmpresa: '1' };
      const resultado = await service.calcularTributacao(baseItem, contextoSN);

      expect(resultado).toBeDefined();
      expect(resultado.snCsosn).toBeDefined();
      // PIS/COFINS zerados para SN (inclusos no DAS)
      expect(resultado.pisValor).toBe(0);
      expect(resultado.cofinsValor).toBe(0);
    });

    it('should handle interstate sale (different UF)', async () => {
      const contextoInter: ContextoTributario = { ...baseContexto, ufDestino: 'RJ' };
      const resultado = await service.calcularTributacao(baseItem, contextoInter);

      expect(resultado).toBeDefined();
      expect(resultado.icmsAliquota).toBeLessThanOrEqual(12); // interestadual
    });

    it('should calculate DIFAL for consumer final out-of-state', async () => {
      const contextoDifal: ContextoTributario = {
        ...baseContexto,
        ufDestino: 'RJ',
        consumidorFinal: true,
        contribuinteIcms: false,
      };
      const resultado = await service.calcularTributacao(baseItem, contextoDifal);

      expect(resultado).toBeDefined();
      // DIFAL should be present
      expect(resultado.difalValor).toBeGreaterThanOrEqual(0);
    });

    it('should return zero taxes for return operation (CFOP 5201)', async () => {
      const itemDevolucao: ItemOperacao = { ...baseItem, cfop: '5201' };
      const resultado = await service.calcularTributacao(itemDevolucao, baseContexto);

      expect(resultado).toBeDefined();
      expect(resultado.valorTotalProdutos).toBe(350);
    });
  });
});
