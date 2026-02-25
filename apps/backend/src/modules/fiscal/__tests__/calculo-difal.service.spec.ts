import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CalculoDifalService } from '../services/calculo-difal.service';
import { IcmsAliquotasUf } from '../entities/icms-tabelas.entity';

describe('CalculoDifalService', () => {
  let service: CalculoDifalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculoDifalService,
        {
          provide: getRepositoryToken(IcmsAliquotasUf),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<CalculoDifalService>(CalculoDifalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularDifal', () => {
    it('should not apply DIFAL for internal operation (same UF)', async () => {
      const resultado = await service.calcularDifal({
        valorBase: 100,
        ufOrigem: 'SP',
        ufDestino: 'SP',
        consumidorFinal: true,
        contribuinteIcms: false,
      });

      expect(resultado.aplicaDifal).toBe(false);
      expect(resultado.valorDifal).toBe(0);
    });

    it('should not apply DIFAL when not consumer final', async () => {
      const resultado = await service.calcularDifal({
        valorBase: 100,
        ufOrigem: 'SP',
        ufDestino: 'RJ',
        consumidorFinal: false,
        contribuinteIcms: false,
      });

      expect(resultado.aplicaDifal).toBe(false);
    });

    it('should calculate DIFAL for SP -> RJ (consumer final, non-taxpayer)', async () => {
      const resultado = await service.calcularDifal({
        valorBase: 1000,
        ufOrigem: 'SP',
        ufDestino: 'RJ',
        consumidorFinal: true,
        contribuinteIcms: false,
      });

      expect(resultado.aplicaDifal).toBe(true);
      expect(resultado.aliquotaInterestadual).toBe(12);
      expect(resultado.aliquotaInternaDestino).toBeGreaterThan(0);
      expect(resultado.valorDifal).toBeGreaterThan(0);
      expect(resultado.partilhaDestinoPercent).toBe(100); // 100% destino since 2019
      expect(resultado.valorDifalDestino).toBe(resultado.valorDifal);
      expect(resultado.valorDifalOrigem).toBe(0);
    });

    it('should calculate FCP for applicable UFs', async () => {
      const resultado = await service.calcularDifal({
        valorBase: 1000,
        ufOrigem: 'SP',
        ufDestino: 'RJ',
        consumidorFinal: true,
        contribuinteIcms: false,
      });

      expect(resultado.aliquotaFcp).toBe(2); // RJ has 2% FCP
      expect(resultado.valorFcp).toBe(20); // 2% of 1000
    });

    it('should handle SC with no FCP', async () => {
      const resultado = await service.calcularDifal({
        valorBase: 1000,
        ufOrigem: 'SP',
        ufDestino: 'SC',
        consumidorFinal: true,
        contribuinteIcms: false,
      });

      expect(resultado.aliquotaFcp).toBe(0); // SC has 0% FCP
      expect(resultado.valorFcp).toBe(0);
    });
  });

  describe('getAliquotaInterestadual', () => {
    it('should return 12% for Sul/Sudeste -> Sul/Sudeste', () => {
      expect(service.getAliquotaInterestadual('SP', 'RJ')).toBe(12);
      expect(service.getAliquotaInterestadual('MG', 'PR')).toBe(12);
    });

    it('should return 7% for Sul/Sudeste -> Others', () => {
      expect(service.getAliquotaInterestadual('SP', 'BA')).toBe(7);
      expect(service.getAliquotaInterestadual('RJ', 'PE')).toBe(7);
    });

    it('should return 12% for Others -> Any', () => {
      expect(service.getAliquotaInterestadual('BA', 'SP')).toBe(12);
      expect(service.getAliquotaInterestadual('CE', 'MA')).toBe(12);
    });

    it('should return 0 for same UF', () => {
      expect(service.getAliquotaInterestadual('SP', 'SP')).toBe(0);
    });
  });

  describe('getAliquotaFcp', () => {
    it('should return FCP rate per UF', () => {
      expect(service.getAliquotaFcp('RJ')).toBe(2);
      expect(service.getAliquotaFcp('SP')).toBe(2);
      expect(service.getAliquotaFcp('SC')).toBe(0);
    });
  });
});
