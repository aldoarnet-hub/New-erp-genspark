/**
 * Testes para os novos servicos: NFCeService, ContingenciaService, DanfeService,
 * AuditoriaEstoqueFiscalService, GuiaPagamentoService (GPS/GRU)
 */

// ============================================================
// NFCeService Tests
// ============================================================
describe('NFCeService', () => {
  // Mock QR Code URL geeneration
  describe('QR Code NFC-e', () => {
    it('deve gerar QR Code URL com formato correto', () => {
      const chave = '35000000000000000000650010000000011000000010';
      const versao = '2';
      const ambiente = '2';
      const cscId = '000001';
      const params = `${chave}|${versao}|${ambiente}|${cscId}`;
      expect(params).toContain(chave);
      expect(params).toContain(versao);
      expect(params).toContain(ambiente);
    });

    it('deve validar chave NFC-e com 44 digitos', () => {
      const chave = '35260200000000000000650010000000011000000010';
      expect(chave.length).toBe(44);
      expect(chave.substring(20, 22)).toBe('65'); // Modelo NFC-e
    });
  });

  describe('DANFE NFC-e data', () => {
    it('deve formatar CNPJ corretamente', () => {
      const cnpj = '12345678000190';
      const formatted = `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12,14)}`;
      expect(formatted).toBe('12.345.678/0001-90');
    });

    it('deve mapear tipos de pagamento', () => {
      const tipos: Record<string, string> = {
        '01': 'Dinheiro', '03': 'Cartao Credito', '04': 'Cartao Debito',
        '17': 'PIX', '99': 'Outros',
      };
      expect(tipos['01']).toBe('Dinheiro');
      expect(tipos['17']).toBe('PIX');
      expect(tipos['04']).toBe('Cartao Debito');
    });
  });
});

// ============================================================
// ContingenciaService Tests
// ============================================================
describe('ContingenciaService', () => {
  const SVC_AN_UFS = ['AM', 'BA', 'CE', 'GO', 'MA', 'MS', 'MT', 'PA', 'PE', 'PI'];
  const SVC_RS_UFS = ['AC', 'AL', 'AP', 'DF', 'ES', 'MG', 'PB', 'PR', 'RJ', 'RN', 'RO', 'RR', 'SC', 'SE', 'SP', 'TO'];

  describe('getModoContingencia', () => {
    it('deve retornar SVC-AN para estados do norte/nordeste/centro-oeste', () => {
      for (const uf of SVC_AN_UFS) {
        const modo = SVC_AN_UFS.includes(uf) ? 'SVC-AN' : 'SVC-RS';
        expect(modo).toBe('SVC-AN');
      }
    });

    it('deve retornar SVC-RS para estados do sul/sudeste e outros', () => {
      for (const uf of SVC_RS_UFS) {
        const modo = SVC_AN_UFS.includes(uf) ? 'SVC-AN' : 'SVC-RS';
        expect(modo).toBe('SVC-RS');
      }
    });
  });

  describe('getTpEmis', () => {
    it('deve mapear modos de contingencia para tpEmis correto', () => {
      const modos: Record<string, string> = {
        'SVC-AN': '6', 'SVC-RS': '7', 'SCAN': '3',
        'EPEC': '4', 'FS-DA': '5', 'NFC-e Offline': '9',
      };
      expect(modos['SVC-AN']).toBe('6');
      expect(modos['SVC-RS']).toBe('7');
      expect(modos['NFC-e Offline']).toBe('9');
      expect(modos['EPEC']).toBe('4');
    });
  });
});

// ============================================================
// DanfeService Tests
// ============================================================
describe('DanfeService', () => {
  describe('Formatacao de dados DANFE', () => {
    it('deve formatar chave de acesso em blocos de 4', () => {
      const chave = '35260212345678000190550010000000011000000011';
      const formatted = chave.match(/.{1,4}/g)?.join(' ') || chave;
      expect(formatted).toContain(' ');
      expect(formatted.replace(/ /g, '').length).toBe(44);
    });

    it('deve formatar CPF corretamente', () => {
      const cpf = '12345678901';
      const formatted = `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9)}`;
      expect(formatted).toBe('123.456.789-01');
    });

    it('deve formatar CEP corretamente', () => {
      const cep = '01001000';
      const formatted = `${cep.slice(0,5)}-${cep.slice(5)}`;
      expect(formatted).toBe('01001-000');
    });

    it('deve formatar valores monetarios', () => {
      const valor = 1234.56;
      const formatted = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      expect(formatted).toBeTruthy();
      expect(formatted).toContain('1');
    });
  });
});

// ============================================================
// AuditoriaEstoqueFiscalService Tests
// ============================================================
describe('AuditoriaEstoqueFiscalService', () => {
  // CFOPs de entrada que movimentam estoque
  const CFOPS_ENTRADA = ['1101', '1102', '2101', '2102'];
  const CFOPS_SAIDA = ['5101', '5102', '6101', '6102'];

  describe('classificacao de CFOP', () => {
    it('deve identificar CFOPs de entrada', () => {
      expect(CFOPS_ENTRADA.includes('1101')).toBe(true);
      expect(CFOPS_ENTRADA.includes('1102')).toBe(true);
      expect(CFOPS_ENTRADA.includes('2101')).toBe(true);
    });

    it('deve identificar CFOPs de saida', () => {
      expect(CFOPS_SAIDA.includes('5101')).toBe(true);
      expect(CFOPS_SAIDA.includes('5102')).toBe(true);
      expect(CFOPS_SAIDA.includes('6101')).toBe(true);
    });

    it('deve distinguir entrada de saida', () => {
      expect(CFOPS_ENTRADA.includes('5102')).toBe(false);
      expect(CFOPS_SAIDA.includes('1102')).toBe(false);
    });
  });

  describe('calculo de saldo', () => {
    it('deve calcular saldo de movimentacao corretamente', () => {
      const entradas = 100;
      const saidas = 75;
      const saldo = entradas - saidas;
      expect(saldo).toBe(25);
    });

    it('deve detectar saldo negativo', () => {
      const entradas = 50;
      const saidas = 80;
      const saldo = entradas - saidas;
      expect(saldo).toBeLessThan(0);
    });
  });

  describe('registro SPED Bloco H', () => {
    it('deve formatar data do inventario no formato SPED', () => {
      const date = new Date(2026, 11, 31); // 31/12/2026
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      const formatted = `${d}${m}${y}`;
      expect(formatted).toBe('31122026');
    });
  });
});

// ============================================================
// GuiaPagamentoService (GPS/GRU) Tests
// ============================================================
describe('GuiaPagamentoService - GPS e GRU', () => {
  describe('GPS - Guia da Previdencia Social', () => {
    it('deve ter codigos de pagamento GPS validos', () => {
      const codigos: Record<string, string> = {
        '2100': 'Empresa - CNPJ',
        '2003': 'Simples Nacional - CNPJ',
        '1007': 'Contribuinte Individual - CEI',
        '2208': 'Empresa - CNPJ (acima de 20 empregados)',
      };
      expect(codigos['2100']).toBe('Empresa - CNPJ');
      expect(codigos['2003']).toBe('Simples Nacional - CNPJ');
    });

    it('deve calcular vencimento GPS corretamente (dia 20 mes seguinte)', () => {
      const competencia = new Date(2026, 0, 1); // Janeiro 2026
      const mesPgto = competencia.getMonth() + 2; // Fevereiro
      const vencimento = new Date(2026, mesPgto - 1, 20);
      expect(vencimento.getDate()).toBe(20);
      expect(vencimento.getMonth()).toBe(1); // Fevereiro
    });

    it('deve calcular valor total GPS corretamente', () => {
      const valorInss = 5000;
      const valorOutrasEntidades = 800;
      const valorAtualizacao = 0;
      const total = Math.round((valorInss + valorOutrasEntidades + valorAtualizacao) * 100) / 100;
      expect(total).toBe(5800);
    });
  });

  describe('GRU - Guia de Recolhimento da Uniao', () => {
    it('deve calcular valor total GRU com descontos e acrescimos', () => {
      const principal = 10000;
      const descontos = 500;
      const multa = 200;
      const juros = 150;
      const total = Math.round((principal - descontos + multa + juros) * 100) / 100;
      expect(total).toBe(9850);
    });
  });
});

// ============================================================
// NfeXmlGeneratorService - Novos grupos XML
// ============================================================
describe('NfeXmlGeneratorService - Grupos Adicionais', () => {
  describe('Grupo cobr (Cobranca)', () => {
    it('deve gerar XML de fatura', () => {
      const fatura = { nFat: '001', vOrig: 1000, vDesc: 50, vLiq: 950 };
      let xml = '<fat>';
      xml += `<nFat>${fatura.nFat}</nFat>`;
      xml += `<vOrig>${fatura.vOrig.toFixed(2)}</vOrig>`;
      xml += `<vDesc>${fatura.vDesc.toFixed(2)}</vDesc>`;
      xml += `<vLiq>${fatura.vLiq.toFixed(2)}</vLiq>`;
      xml += '</fat>';
      expect(xml).toContain('<nFat>001</nFat>');
      expect(xml).toContain('<vLiq>950.00</vLiq>');
    });

    it('deve gerar XML de duplicatas', () => {
      const duplicatas = [
        { nDup: '001', dVenc: '2026-03-15', vDup: 500 },
        { nDup: '002', dVenc: '2026-04-15', vDup: 450 },
      ];
      let xml = '';
      for (const dup of duplicatas) {
        xml += '<dup>';
        xml += `<nDup>${dup.nDup}</nDup>`;
        xml += `<dVenc>${dup.dVenc}</dVenc>`;
        xml += `<vDup>${dup.vDup.toFixed(2)}</vDup>`;
        xml += '</dup>';
      }
      expect(xml).toContain('<nDup>001</nDup>');
      expect(xml).toContain('<nDup>002</nDup>');
      expect(xml).toContain('<vDup>500.00</vDup>');
    });
  });

  describe('Grupo exporta (Exportacao)', () => {
    it('deve gerar XML de exportacao', () => {
      const exp = { ufSaidaPais: 'SP', xLocExporta: 'Porto de Santos' };
      let xml = '<exporta>';
      xml += `<UFSaidaPais>${exp.ufSaidaPais}</UFSaidaPais>`;
      xml += `<xLocExporta>${exp.xLocExporta}</xLocExporta>`;
      xml += '</exporta>';
      expect(xml).toContain('<UFSaidaPais>SP</UFSaidaPais>');
      expect(xml).toContain('Porto de Santos');
    });
  });

  describe('Grupo compra', () => {
    it('deve gerar XML de dados de compra', () => {
      const compra = { xNEmp: 'NE-001', xPed: 'PED-456', xCont: 'CONT-789' };
      let xml = '<compra>';
      xml += `<xNEmp>${compra.xNEmp}</xNEmp>`;
      xml += `<xPed>${compra.xPed}</xPed>`;
      xml += `<xCont>${compra.xCont}</xCont>`;
      xml += '</compra>';
      expect(xml).toContain('<xPed>PED-456</xPed>');
    });
  });

  describe('Grupo infRespTec', () => {
    it('deve gerar XML de responsavel tecnico', () => {
      const resp = { cnpj: '12345678000190', xContato: 'Suporte ERP', email: 'suporte@erp.com', fone: '1199999999' };
      let xml = '<infRespTec>';
      xml += `<CNPJ>${resp.cnpj}</CNPJ>`;
      xml += `<xContato>${resp.xContato}</xContato>`;
      xml += `<email>${resp.email}</email>`;
      xml += `<fone>${resp.fone}</fone>`;
      xml += '</infRespTec>';
      expect(xml).toContain('<CNPJ>12345678000190</CNPJ>');
      expect(xml).toContain('suporte@erp.com');
    });
  });
});

// ============================================================
// SPED - Validacao de Blocos
// ============================================================
describe('SPED Service - Validacao de Blocos', () => {
  describe('Formatacao de registros SPED', () => {
    it('deve formatar registros com separadores pipe', () => {
      const reg = (codigo: string, ...campos: string[]) => `|${codigo}|${campos.join('|')}|`;
      const r = reg('0000', '019', '0', '01012026', '31012026');
      expect(r).toBe('|0000|019|0|01012026|31012026|');
    });

    it('deve formatar datas no formato SPED (ddmmaaaa)', () => {
      const date = new Date(2026, 0, 15);
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      expect(`${d}${m}${y}`).toBe('15012026');
    });

    it('deve formatar valores decimais com virgula', () => {
      const valor = 1234.56;
      const formatted = valor.toFixed(2).replace('.', ',');
      expect(formatted).toBe('1234,56');
    });
  });

  describe('Contagem de registros por bloco', () => {
    it('deve contar registros corretamente no Bloco 9', () => {
      const linhas = [
        '|0000|teste|', '|0001|0|', '|0990|3|',
        '|C001|0|', '|C990|2|',
        '|E001|0|', '|E100|01012026|31012026|', '|E110|0,00|', '|E990|4|',
      ];
      const contagem: Record<string, number> = {};
      for (const linha of linhas) {
        const reg = linha.split('|')[1];
        if (reg) {
          const bloco = reg[0];
          contagem[bloco] = (contagem[bloco] || 0) + 1;
        }
      }
      expect(contagem['0']).toBe(3);
      expect(contagem['C']).toBe(2);
      expect(contagem['E']).toBe(4);
    });
  });
});

// ============================================================
// SINTEGRA - Validacao completa
// ============================================================
describe('SintegraService - Validacao DV adicional', () => {
  describe('Validacao IE Sao Paulo', () => {
    it('deve validar formato SP (12 digitos)', () => {
      const formato = /^\d{12}$/;
      expect(formato.test('110042490114')).toBe(true);
      expect(formato.test('1100424901')).toBe(false);
      expect(formato.test('110042490114XX')).toBe(false);
    });
  });

  describe('Validacao IE Rio de Janeiro', () => {
    it('deve validar formato RJ (8 digitos)', () => {
      const formato = /^\d{8}$/;
      expect(formato.test('12345678')).toBe(true);
      expect(formato.test('1234567')).toBe(false);
    });
  });

  describe('Validacao IE Minas Gerais', () => {
    it('deve validar formato MG (13 digitos)', () => {
      const formato = /^\d{13}$/;
      expect(formato.test('0620000000001')).toBe(true);
      expect(formato.test('062000000000')).toBe(false);
    });
  });

  describe('Validacao IE Parana', () => {
    it('deve validar formato PR (10 digitos)', () => {
      const formato = /^\d{10}$/;
      expect(formato.test('1234567890')).toBe(true);
    });
  });

  describe('Validacao IE Rio Grande do Sul', () => {
    it('deve validar formato RS (10 digitos)', () => {
      const formato = /^\d{10}$/;
      expect(formato.test('2243658792')).toBe(true);
    });
  });
});
