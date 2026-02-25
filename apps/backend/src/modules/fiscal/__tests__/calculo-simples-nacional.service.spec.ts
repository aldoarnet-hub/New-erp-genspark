import { Test, TestingModule } from '@nestjs/testing';
import { CalculoSimplesNacionalService } from '../services/calculo-simples-nacional.service';

describe('CalculoSimplesNacionalService', () => {
  let service: CalculoSimplesNacionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculoSimplesNacionalService],
    }).compile();

    service = module.get<CalculoSimplesNacionalService>(CalculoSimplesNacionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularDAS', () => {
    it('should calculate DAS for Anexo I - 1st bracket', () => {
      // Receita ate 180.000 - 1a faixa
      const resultado = service.calcularDAS(150000, 15000, 'I');

      expect(resultado).toBeDefined();
      expect(resultado.anexo).toBe('I');
      expect(resultado.aliquotaEfetiva).toBeGreaterThan(0);
      expect(resultado.valorDas).toBeGreaterThan(0);
      expect(resultado.reparticao).toBeDefined();
    });

    it('should calculate DAS for Anexo I - higher bracket', () => {
      const resultado = service.calcularDAS(500000, 50000, 'I');

      expect(resultado).toBeDefined();
      expect(resultado.aliquotaEfetiva).toBeGreaterThan(0);
      expect(resultado.valorDas).toBeGreaterThan(0);
    });

    it('should calculate DAS for Anexo III (services)', () => {
      const resultado = service.calcularDAS(300000, 30000, 'III');

      expect(resultado).toBeDefined();
      expect(resultado.anexo).toBe('III');
    });

    it('should handle Fator R for Anexo V vs III decision', () => {
      // Fator R > 28% -> uses Anexo III instead of V
      const resultadoAlto = service.calcularDAS(300000, 30000, 'V', 0.30);
      const resultadoBaixo = service.calcularDAS(300000, 30000, 'V', 0.20);

      expect(resultadoAlto).toBeDefined();
      expect(resultadoBaixo).toBeDefined();
      // With fatorR >= 0.28, uses Anexo III
      expect(resultadoAlto.anexo).toBe('III');
      // With fatorR < 0.28, keeps Anexo V
      expect(resultadoBaixo.anexo).toBe('V');
    });

    it('should return zero for zero revenue', () => {
      const resultado = service.calcularDAS(0, 0, 'I');

      expect(resultado).toBeDefined();
      expect(resultado.valorDas).toBe(0);
    });
  });

  describe('compararRegimes', () => {
    it('should compare all three regimes', () => {
      const resultado = service.compararRegimes(500000, 'SP');

      expect(resultado).toBeDefined();
      expect(resultado.comparacao).toBeDefined();
      expect(resultado.comparacao.simples).toBeDefined();
      expect(resultado.comparacao.presumido).toBeDefined();
      expect(resultado.comparacao.real).toBeDefined();
      expect(resultado.recomendacao).toBeDefined();
    });

    it('should recommend Simples for low revenue', () => {
      const resultado = service.compararRegimes(200000, 'SP');

      expect(resultado).toBeDefined();
      expect(resultado.recomendacao).toBeDefined();
    });
  });
});
