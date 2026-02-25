import { encrypt, decrypt } from '../crypto.util';

describe('Crypto Utility', () => {
  describe('encrypt', () => {
    it('deve criptografar uma string', () => {
      const texto = 'dados sensíveis';
      const resultado = encrypt(texto);

      expect(resultado).toBeDefined();
      expect(typeof resultado).toBe('string');
      expect(resultado).not.toBe(texto);
    });

    it('deve retornar formato iv:authTag:encrypted', () => {
      const resultado = encrypt('teste');
      const partes = resultado.split(':');

      expect(partes).toHaveLength(3);
      // IV = 16 bytes = 32 hex chars
      expect(partes[0]).toHaveLength(32);
      // AuthTag = 16 bytes = 32 hex chars
      expect(partes[1]).toHaveLength(32);
      // Encrypted data should be non-empty
      expect(partes[2].length).toBeGreaterThan(0);
    });

    it('deve gerar resultados diferentes para mesma entrada (IV aleatorio)', () => {
      const texto = 'mesmo texto';
      const resultado1 = encrypt(texto);
      const resultado2 = encrypt(texto);

      expect(resultado1).not.toBe(resultado2);
    });
  });

  describe('decrypt', () => {
    it('deve descriptografar dados criptografados', () => {
      const textoOriginal = 'dados sensíveis do ERP';
      const criptografado = encrypt(textoOriginal);
      const descriptografado = decrypt(criptografado);

      expect(descriptografado).toBe(textoOriginal);
    });

    it('deve funcionar com strings vazias', () => {
      const criptografado = encrypt('');
      const descriptografado = decrypt(criptografado);

      expect(descriptografado).toBe('');
    });

    it('deve funcionar com caracteres especiais', () => {
      const texto = 'CNPJ: 11.222.333/0001-81 - Senha: @#$%&*()!';
      const criptografado = encrypt(texto);
      const descriptografado = decrypt(criptografado);

      expect(descriptografado).toBe(texto);
    });

    it('deve funcionar com texto longo', () => {
      const texto = 'A'.repeat(10000);
      const criptografado = encrypt(texto);
      const descriptografado = decrypt(criptografado);

      expect(descriptografado).toBe(texto);
    });

    it('deve lancar erro com dados invalidos', () => {
      expect(() => decrypt('dados:invalidos:xyz')).toThrow();
    });
  });

  describe('encrypt e decrypt integrados', () => {
    it('deve criptografar e descriptografar JSON', () => {
      const dados = JSON.stringify({
        cpf: '529.982.247-25',
        senha: 'minha-senha-secreta',
        cartao: '4111111111111111',
      });

      const criptografado = encrypt(dados);
      const descriptografado = decrypt(criptografado);
      const resultado = JSON.parse(descriptografado);

      expect(resultado.cpf).toBe('529.982.247-25');
      expect(resultado.senha).toBe('minha-senha-secreta');
      expect(resultado.cartao).toBe('4111111111111111');
    });
  });
});
