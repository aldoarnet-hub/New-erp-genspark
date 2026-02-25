import {
  validarCPF,
  validarCNPJ,
  validarCpfCnpj,
  limparDocumento,
  formatarCPF,
  formatarCNPJ,
  validarEmail,
  validarTelefone,
  formatarTelefone,
  validarCEP,
  validarIE,
  calcularCubagem,
} from '../validadores';

describe('Validadores Brasileiros', () => {
  // ========================================
  // CPF
  // ========================================
  describe('validarCPF', () => {
    it('deve aceitar CPFs validos', () => {
      expect(validarCPF('529.982.247-25')).toBe(true);
      expect(validarCPF('52998224725')).toBe(true);
      expect(validarCPF('111.444.777-35')).toBe(true);
    });

    it('deve rejeitar CPFs invalidos', () => {
      expect(validarCPF('000.000.000-00')).toBe(false);
      expect(validarCPF('111.111.111-11')).toBe(false);
      expect(validarCPF('123.456.789-00')).toBe(false);
      expect(validarCPF('529.982.247-26')).toBe(false); // digito errado
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validarCPF('123')).toBe(false);
      expect(validarCPF('1234567890')).toBe(false);
      expect(validarCPF('123456789012')).toBe(false);
    });

    it('deve rejeitar CPF vazio', () => {
      expect(validarCPF('')).toBe(false);
    });
  });

  // ========================================
  // CNPJ
  // ========================================
  describe('validarCNPJ', () => {
    it('deve aceitar CNPJs validos', () => {
      expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validarCNPJ('11222333000181')).toBe(true);
    });

    it('deve rejeitar CNPJs invalidos', () => {
      expect(validarCNPJ('00.000.000/0000-00')).toBe(false);
      expect(validarCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validarCNPJ('11.222.333/0001-82')).toBe(false); // digito errado
    });

    it('deve rejeitar CNPJ com tamanho incorreto', () => {
      expect(validarCNPJ('123')).toBe(false);
      expect(validarCNPJ('1234567890123')).toBe(false);
    });
  });

  // ========================================
  // CPF/CNPJ combinado
  // ========================================
  describe('validarCpfCnpj', () => {
    it('deve validar CPF quando <= 11 digitos', () => {
      expect(validarCpfCnpj('52998224725')).toBe(true);
      expect(validarCpfCnpj('529.982.247-25')).toBe(true);
    });

    it('deve validar CNPJ quando > 11 digitos', () => {
      expect(validarCpfCnpj('11222333000181')).toBe(true);
      expect(validarCpfCnpj('11.222.333/0001-81')).toBe(true);
    });

    it('deve rejeitar documentos invalidos', () => {
      expect(validarCpfCnpj('12345678900')).toBe(false);
      expect(validarCpfCnpj('12345678000100')).toBe(false);
    });
  });

  // ========================================
  // Limpar Documento
  // ========================================
  describe('limparDocumento', () => {
    it('deve remover caracteres nao numericos', () => {
      expect(limparDocumento('529.982.247-25')).toBe('52998224725');
      expect(limparDocumento('11.222.333/0001-81')).toBe('11222333000181');
      expect(limparDocumento('123abc456')).toBe('123456');
    });
  });

  // ========================================
  // Formatar CPF
  // ========================================
  describe('formatarCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatarCPF('52998224725')).toBe('529.982.247-25');
    });

    it('deve funcionar com CPF ja formatado', () => {
      expect(formatarCPF('529.982.247-25')).toBe('529.982.247-25');
    });
  });

  // ========================================
  // Formatar CNPJ
  // ========================================
  describe('formatarCNPJ', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(formatarCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });
  });

  // ========================================
  // Email
  // ========================================
  describe('validarEmail', () => {
    it('deve aceitar emails validos', () => {
      expect(validarEmail('user@example.com')).toBe(true);
      expect(validarEmail('test.user@domain.com.br')).toBe(true);
      expect(validarEmail('user+tag@gmail.com')).toBe(true);
    });

    it('deve rejeitar emails invalidos', () => {
      expect(validarEmail('invalid')).toBe(false);
      expect(validarEmail('user@')).toBe(false);
      expect(validarEmail('@domain.com')).toBe(false);
      expect(validarEmail('user@domain')).toBe(false);
      expect(validarEmail('')).toBe(false);
    });
  });

  // ========================================
  // Telefone
  // ========================================
  describe('validarTelefone', () => {
    it('deve aceitar telefones validos (10 ou 11 digitos)', () => {
      expect(validarTelefone('11987654321')).toBe(true);  // celular
      expect(validarTelefone('1133334444')).toBe(true);    // fixo
      expect(validarTelefone('(11) 98765-4321')).toBe(true);
      expect(validarTelefone('(11) 3333-4444')).toBe(true);
    });

    it('deve rejeitar telefones invalidos', () => {
      expect(validarTelefone('123')).toBe(false);
      expect(validarTelefone('123456789')).toBe(false); // 9 digitos
      expect(validarTelefone('123456789012')).toBe(false); // 12 digitos
    });
  });

  // ========================================
  // Formatar Telefone
  // ========================================
  describe('formatarTelefone', () => {
    it('deve formatar celular (11 digitos)', () => {
      expect(formatarTelefone('11987654321')).toBe('(11) 98765-4321');
    });

    it('deve formatar fixo (10 digitos)', () => {
      expect(formatarTelefone('1133334444')).toBe('(11) 3333-4444');
    });

    it('deve retornar original se nao casar', () => {
      expect(formatarTelefone('123')).toBe('123');
    });
  });

  // ========================================
  // CEP
  // ========================================
  describe('validarCEP', () => {
    it('deve aceitar CEPs validos', () => {
      expect(validarCEP('01001-000')).toBe(true);
      expect(validarCEP('01001000')).toBe(true);
      expect(validarCEP('12345-678')).toBe(true);
    });

    it('deve rejeitar CEPs invalidos', () => {
      expect(validarCEP('123')).toBe(false);
      expect(validarCEP('123456789')).toBe(false); // 9 digitos
      expect(validarCEP('abcde-fgh')).toBe(false);
    });
  });

  // ========================================
  // IE (Inscricao Estadual)
  // ========================================
  describe('validarIE', () => {
    it('deve aceitar ISENTO', () => {
      expect(validarIE('ISENTO', 'SP')).toBe(true);
      expect(validarIE('isento', 'RJ')).toBe(true);
    });

    it('deve aceitar IE vazia', () => {
      expect(validarIE('', 'SP')).toBe(true);
    });

    it('deve validar comprimento por UF', () => {
      expect(validarIE('123456789012', 'SP')).toBe(true); // SP = 12 digitos
      expect(validarIE('12345678', 'RJ')).toBe(true);      // RJ = 8 digitos
    });

    it('deve rejeitar IE com comprimento incorreto', () => {
      expect(validarIE('123', 'SP')).toBe(false);
      expect(validarIE('1234567890', 'SP')).toBe(false);
    });

    it('deve rejeitar UF invalida', () => {
      expect(validarIE('123456789', 'XX')).toBe(false);
    });
  });

  // ========================================
  // Cubagem
  // ========================================
  describe('calcularCubagem', () => {
    it('deve calcular cubagem em m3 corretamente', () => {
      // 100cm x 100cm x 100cm = 1m3
      expect(calcularCubagem(100, 100, 100)).toBe(1);
    });

    it('deve calcular cubagem fracionaria', () => {
      // 50cm x 30cm x 20cm = 0.03m3
      expect(calcularCubagem(50, 30, 20)).toBe(0.03);
    });

    it('deve retornar 0 para dimensao zero', () => {
      expect(calcularCubagem(0, 100, 100)).toBe(0);
    });
  });
});
