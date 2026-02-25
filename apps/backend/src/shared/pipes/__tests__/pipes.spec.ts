import { ParseUuidPipe, ParseDocumentPipe } from '../index';
import { BadRequestException } from '@nestjs/common';

describe('Custom Pipes', () => {
  describe('ParseUuidPipe', () => {
    const pipe = new ParseUuidPipe();

    it('deve aceitar UUID v4 valido', () => {
      const uuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
      expect(pipe.transform(uuid)).toBe(uuid);
    });

    it('deve rejeitar UUID invalido', () => {
      expect(() => pipe.transform('nao-e-uuid')).toThrow(BadRequestException);
      expect(() => pipe.transform('123')).toThrow(BadRequestException);
      expect(() => pipe.transform('')).toThrow(BadRequestException);
    });
  });

  describe('ParseDocumentPipe', () => {
    const pipe = new ParseDocumentPipe();

    it('deve aceitar e limpar CPF', () => {
      expect(pipe.transform('529.982.247-25')).toBe('52998224725');
    });

    it('deve aceitar e limpar CNPJ', () => {
      expect(pipe.transform('11.222.333/0001-81')).toBe('11222333000181');
    });

    it('deve rejeitar documento com tamanho invalido', () => {
      expect(() => pipe.transform('123')).toThrow(BadRequestException);
      expect(() => pipe.transform('123456789')).toThrow(BadRequestException);
    });
  });
});
