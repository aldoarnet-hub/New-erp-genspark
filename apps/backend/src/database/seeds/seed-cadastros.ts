import { DataSource } from 'typeorm';

export async function seedCadastrosData(dataSource: DataSource, tenantId: string) {
  console.log('Populando cadastros auxiliares (Fase 3)...');

  // ======================== Unidades de Medida ========================
  await dataSource.query(`
    INSERT INTO unidades_medida ("tenantId", "codigo", "descricao", "sigla") VALUES
    ('${tenantId}', 'UN', 'Unidade', 'UN'),
    ('${tenantId}', 'PC', 'Peca', 'PC'),
    ('${tenantId}', 'KG', 'Quilograma', 'KG'),
    ('${tenantId}', 'MT', 'Metro', 'MT'),
    ('${tenantId}', 'M2', 'Metro Quadrado', 'M2'),
    ('${tenantId}', 'M3', 'Metro Cubico', 'M3'),
    ('${tenantId}', 'LT', 'Litro', 'LT'),
    ('${tenantId}', 'CX', 'Caixa', 'CX'),
    ('${tenantId}', 'SC', 'Saco', 'SC'),
    ('${tenantId}', 'RL', 'Rolo', 'RL'),
    ('${tenantId}', 'TB', 'Tubo', 'TB'),
    ('${tenantId}', 'BR', 'Barra', 'BR'),
    ('${tenantId}', 'FD', 'Fardo', 'FD'),
    ('${tenantId}', 'GL', 'Galao', 'GL'),
    ('${tenantId}', 'PT', 'Pacote', 'PT')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Unidades de medida: 15 registros');

  // ======================== Categorias ========================
  await dataSource.query(`
    INSERT INTO categorias ("tenantId", "codigo", "descricao") VALUES
    ('${tenantId}', 'CIMENTOS', 'Cimentos e Argamassas'),
    ('${tenantId}', 'TINTAS', 'Tintas e Acessorios'),
    ('${tenantId}', 'ELETRICA', 'Material Eletrico'),
    ('${tenantId}', 'HIDRAULICA', 'Material Hidraulico'),
    ('${tenantId}', 'FERRAGENS', 'Ferragens e Fixadores'),
    ('${tenantId}', 'PISOS', 'Pisos e Revestimentos'),
    ('${tenantId}', 'MADEIRAS', 'Madeiras e Compensados'),
    ('${tenantId}', 'FERRAMENTAS', 'Ferramentas Manuais e Eletricas'),
    ('${tenantId}', 'TUBOS', 'Tubos e Conexoes'),
    ('${tenantId}', 'LOUCSANIT', 'Loucas Sanitarias'),
    ('${tenantId}', 'IMPERMEAB', 'Impermeabilizantes'),
    ('${tenantId}', 'ACOS', 'Acos e Arames'),
    ('${tenantId}', 'SEGURANCA', 'Equipamentos de Seguranca')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Categorias: 13 registros');

  // ======================== Marcas ========================
  await dataSource.query(`
    INSERT INTO marcas ("tenantId", "nome") VALUES
    ('${tenantId}', 'Votorantim'),
    ('${tenantId}', 'Tigre'),
    ('${tenantId}', 'Suvinil'),
    ('${tenantId}', 'Tramontina'),
    ('${tenantId}', 'Schneider'),
    ('${tenantId}', 'Docol'),
    ('${tenantId}', 'Deca'),
    ('${tenantId}', 'Quartzolit'),
    ('${tenantId}', 'Gerdau'),
    ('${tenantId}', 'Amanco'),
    ('${tenantId}', 'Makita'),
    ('${tenantId}', 'Bosch'),
    ('${tenantId}', 'Lorenzetti')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Marcas: 13 registros');

  // ======================== Fabricantes ========================
  await dataSource.query(`
    INSERT INTO fabricantes ("tenantId", "nome", "cnpj") VALUES
    ('${tenantId}', 'Votorantim Cimentos S.A.', '01.637.895/0001-32'),
    ('${tenantId}', 'Tigre S.A.', '84.684.455/0001-90'),
    ('${tenantId}', 'BASF S.A. - Suvinil', '48.539.407/0001-18'),
    ('${tenantId}', 'Gerdau S.A.', '33.611.500/0001-19'),
    ('${tenantId}', 'Schneider Electric', '82.641.325/0001-18')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Fabricantes: 5 registros');

  // ======================== Formas de Pagamento (7 default) ========================
  await dataSource.query(`
    INSERT INTO formas_pagamento ("tenantId", "codigo", "descricao", "tipo", "geraTitulo", "baixaAutomatica", "permiteParcelamento", "codigoNfe") VALUES
    ('${tenantId}', '01', 'DINHEIRO', 'DINHEIRO', false, true, false, '01'),
    ('${tenantId}', '02', 'CHEQUE', 'CHEQUE', true, false, false, '02'),
    ('${tenantId}', '03', 'CARTAO CREDITO', 'CARTAO', true, false, true, '03'),
    ('${tenantId}', '04', 'CARTAO DEBITO', 'CARTAO', false, true, false, '04'),
    ('${tenantId}', '05', 'BOLETO', 'BOLETO', true, false, true, '15'),
    ('${tenantId}', '06', 'PIX', 'PIX', false, true, false, '17'),
    ('${tenantId}', '07', 'TRANSFERENCIA', 'TRANSFERENCIA', true, false, false, '03')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Formas pagamento: 7 registros');

  // ======================== Condicoes de Pagamento ========================
  await dataSource.query(`
    INSERT INTO condicoes_pagamento ("tenantId", "codigo", "descricao", "numeroParcelas", "intervaloDias", "percentualDesconto") VALUES
    ('${tenantId}', 'AVISTA', 'A Vista', 1, 0, 5.00),
    ('${tenantId}', '30DD', '30 Dias', 1, 30, 0),
    ('${tenantId}', '30-60', '30/60 Dias', 2, 30, 0),
    ('${tenantId}', '30-60-90', '30/60/90 Dias', 3, 30, 0),
    ('${tenantId}', '28DD', '28 Dias', 1, 28, 0),
    ('${tenantId}', '28-56', '28/56 Dias', 2, 28, 0),
    ('${tenantId}', '30-60-90-120', '30/60/90/120 Dias', 4, 30, 0)
    ON CONFLICT DO NOTHING
  `);
  console.log('  Condicoes pagamento: 7 registros');

  // ======================== Tabelas de Preco ========================
  await dataSource.query(`
    INSERT INTO tabelas_preco ("tenantId", "codigo", "descricao", "tipo", "tabelaPadrao", "percentualAcrescimo") VALUES
    ('${tenantId}', 'VAREJO', 'Varejo', 'VAREJO', true, 0),
    ('${tenantId}', 'ATACADO', 'Atacado', 'ATACADO', false, 0),
    ('${tenantId}', 'PROMO', 'Promocional', 'PROMOCIONAL', false, 0),
    ('${tenantId}', 'OBRA', 'Obras e Construtoras', 'OBRA', false, 0)
    ON CONFLICT DO NOTHING
  `);
  console.log('  Tabelas preco: 4 registros');

  // ======================== Bancos ========================
  await dataSource.query(`
    INSERT INTO bancos ("tenantId", "codigoFebraban", "nome", "nomeReduzido") VALUES
    ('${tenantId}', '001', 'Banco do Brasil S.A.', 'BB'),
    ('${tenantId}', '033', 'Banco Santander', 'Santander'),
    ('${tenantId}', '104', 'Caixa Economica Federal', 'CEF'),
    ('${tenantId}', '237', 'Banco Bradesco S.A.', 'Bradesco'),
    ('${tenantId}', '341', 'Banco Itau S.A.', 'Itau'),
    ('${tenantId}', '422', 'Banco Safra S.A.', 'Safra'),
    ('${tenantId}', '756', 'Sicoob', 'Sicoob'),
    ('${tenantId}', '260', 'Nu Pagamentos S.A.', 'Nubank'),
    ('${tenantId}', '077', 'Banco Inter', 'Inter'),
    ('${tenantId}', '336', 'C6 Bank', 'C6')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Bancos: 10 registros');

  // ======================== Centros de Custo ========================
  await dataSource.query(`
    INSERT INTO centros_custo ("tenantId", "codigo", "descricao") VALUES
    ('${tenantId}', 'ADM', 'Administrativo'),
    ('${tenantId}', 'COM', 'Comercial/Vendas'),
    ('${tenantId}', 'EST', 'Estoque/Logistica'),
    ('${tenantId}', 'FIN', 'Financeiro'),
    ('${tenantId}', 'MKT', 'Marketing'),
    ('${tenantId}', 'TI', 'Tecnologia da Informacao')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Centros custo: 6 registros');

  // ======================== Plano de Contas ========================
  await dataSource.query(`
    INSERT INTO plano_contas ("tenantId", "codigo", "descricao", "tipo", "natureza", "contaSintetica") VALUES
    ('${tenantId}', '1', 'ATIVO', 'ATIVO', 'DEVEDORA', true),
    ('${tenantId}', '1.1', 'Ativo Circulante', 'ATIVO', 'DEVEDORA', true),
    ('${tenantId}', '1.1.1', 'Caixa e Bancos', 'ATIVO', 'DEVEDORA', false),
    ('${tenantId}', '1.1.2', 'Contas a Receber', 'ATIVO', 'DEVEDORA', false),
    ('${tenantId}', '1.1.3', 'Estoques', 'ATIVO', 'DEVEDORA', false),
    ('${tenantId}', '2', 'PASSIVO', 'PASSIVO', 'CREDORA', true),
    ('${tenantId}', '2.1', 'Passivo Circulante', 'PASSIVO', 'CREDORA', true),
    ('${tenantId}', '2.1.1', 'Fornecedores', 'PASSIVO', 'CREDORA', false),
    ('${tenantId}', '2.1.2', 'Impostos a Pagar', 'PASSIVO', 'CREDORA', false),
    ('${tenantId}', '3', 'RECEITAS', 'RECEITA', 'CREDORA', true),
    ('${tenantId}', '3.1', 'Receita de Vendas', 'RECEITA', 'CREDORA', false),
    ('${tenantId}', '3.2', 'Receitas Financeiras', 'RECEITA', 'CREDORA', false),
    ('${tenantId}', '4', 'DESPESAS', 'DESPESA', 'DEVEDORA', true),
    ('${tenantId}', '4.1', 'Custo das Mercadorias Vendidas', 'DESPESA', 'DEVEDORA', false),
    ('${tenantId}', '4.2', 'Despesas Administrativas', 'DESPESA', 'DEVEDORA', false),
    ('${tenantId}', '4.3', 'Despesas Comerciais', 'DESPESA', 'DEVEDORA', false)
    ON CONFLICT DO NOTHING
  `);
  console.log('  Plano de contas: 16 registros');

  // ======================== Produtos de demonstracao ========================
  const unidades = await dataSource.query(`SELECT id FROM unidades_medida WHERE "tenantId"='${tenantId}' AND codigo='UN' LIMIT 1`);
  const categorias = await dataSource.query(`SELECT id, codigo FROM categorias WHERE "tenantId"='${tenantId}'`);
  const marcas = await dataSource.query(`SELECT id, nome FROM marcas WHERE "tenantId"='${tenantId}'`);

  if (unidades.length > 0 && categorias.length > 0 && marcas.length > 0) {
    const unId = unidades[0].id;
    const catCimento = categorias.find((c: any) => c.codigo === 'CIMENTOS')?.id;
    const catTinta = categorias.find((c: any) => c.codigo === 'TINTAS')?.id;
    const catEletrica = categorias.find((c: any) => c.codigo === 'ELETRICA')?.id;
    const catHidra = categorias.find((c: any) => c.codigo === 'HIDRAULICA')?.id;
    const catFerr = categorias.find((c: any) => c.codigo === 'FERRAGENS')?.id;
    const mrcVoto = marcas.find((m: any) => m.nome === 'Votorantim')?.id;
    const mrcSuv = marcas.find((m: any) => m.nome === 'Suvinil')?.id;
    const mrcTigre = marcas.find((m: any) => m.nome === 'Tigre')?.id;
    const mrcSchn = marcas.find((m: any) => m.nome === 'Schneider')?.id;
    const mrcTram = marcas.find((m: any) => m.nome === 'Tramontina')?.id;

    await dataSource.query(`
      INSERT INTO produtos ("tenantId", "codigoInterno", "descricao", "tipoProduto", "categoriaId", "marcaId", "unidadeVendaId", "unidadeEstoqueId", "ncm", "custoMedio", "markupPadrao", "estoqueMinimo", "pesoBrutoKg") VALUES
      ('${tenantId}', 'CIM001', 'Cimento CP-II 50kg Votorantim', 'SIMPLES', '${catCimento}', '${mrcVoto}', '${unId}', '${unId}', '25232900', 28.50, 35, 50, 50.000),
      ('${tenantId}', 'CIM002', 'Cimento CP-V ARI 50kg', 'SIMPLES', '${catCimento}', '${mrcVoto}', '${unId}', '${unId}', '25232100', 32.00, 30, 30, 50.000),
      ('${tenantId}', 'TIN001', 'Tinta Acrilica Branca 18L Suvinil', 'SIMPLES', '${catTinta}', '${mrcSuv}', '${unId}', '${unId}', '32091010', 189.90, 40, 20, 25.000),
      ('${tenantId}', 'TIN002', 'Tinta Latex PVA Branca 18L', 'SIMPLES', '${catTinta}', '${mrcSuv}', '${unId}', '${unId}', '32091010', 125.00, 45, 15, 25.000),
      ('${tenantId}', 'ELE001', 'Disjuntor Din 20A Schneider', 'SIMPLES', '${catEletrica}', '${mrcSchn}', '${unId}', '${unId}', '85362000', 12.50, 60, 100, 0.150),
      ('${tenantId}', 'ELE002', 'Fio Rigido 2.5mm 100m Azul', 'SIMPLES', '${catEletrica}', '${mrcSchn}', '${unId}', '${unId}', '85441100', 165.00, 35, 30, 3.500),
      ('${tenantId}', 'HID001', 'Tubo PVC Soldavel 25mm 6m Tigre', 'SIMPLES', '${catHidra}', '${mrcTigre}', '${unId}', '${unId}', '39172100', 8.90, 50, 200, 0.800),
      ('${tenantId}', 'HID002', 'Joelho 90 PVC 25mm Tigre', 'SIMPLES', '${catHidra}', '${mrcTigre}', '${unId}', '${unId}', '39174000', 1.20, 80, 500, 0.030),
      ('${tenantId}', 'CIM003', 'Argamassa AC-III 20kg Quartzolit', 'SIMPLES', '${catCimento}', '${mrcVoto}', '${unId}', '${unId}', '38160090', 22.50, 40, 40, 20.000),
      ('${tenantId}', 'TIN003', 'Massa Corrida PVA 25kg', 'SIMPLES', '${catTinta}', '${mrcSuv}', '${unId}', '${unId}', '32141000', 35.00, 50, 25, 25.000),
      ('${tenantId}', 'FER001', 'Parafuso Sextavado 5/16x1" (100un)', 'SIMPLES', '${catFerr}', '${mrcTram}', '${unId}', '${unId}', '73181500', 18.00, 70, 50, 1.200),
      ('${tenantId}', 'FER002', 'Fechadura Interna Cromada Tramontina', 'SIMPLES', '${catFerr}', '${mrcTram}', '${unId}', '${unId}', '83014000', 45.00, 55, 30, 0.500)
      ON CONFLICT DO NOTHING
    `);
    console.log('  Produtos demo: 12 registros');
  }

  // ======================== Clientes de demonstracao ========================
  await dataSource.query(`
    INSERT INTO clientes ("tenantId", "codigoInterno", "tipoPessoa", "cpfCnpj", "cpfCnpjLimpo", "razaoSocial", "nomeFantasia", "email", "telefone", "cep", "endereco", "numero", "bairro", "cidade", "uf", "tipoCliente", "segmento", "limiteCredito", "limiteDisponivel") VALUES
    ('${tenantId}', 'CLI001', 'PJ', '12.345.678/0001-95', '12345678000195', 'Construtora Alpha Ltda', 'Alpha Construcoes', 'contato@alpha.com', '(11) 3456-7890', '01310-100', 'Av Paulista', '1000', 'Bela Vista', 'Sao Paulo', 'SP', 'CONSTRUTORA', 'CONSTRUCAO_CIVIL', 50000, 50000),
    ('${tenantId}', 'CLI002', 'PJ', '98.765.432/0001-10', '98765432000110', 'Materiais Beta EIRELI', 'Beta Materiais', 'beta@email.com', '(11) 2345-6789', '04543-011', 'Rua Funchal', '500', 'Vila Olimpia', 'Sao Paulo', 'SP', 'REVENDEDOR', 'COMERCIO', 30000, 30000),
    ('${tenantId}', 'CLI003', 'PF', '123.456.789-09', '12345678909', NULL, NULL, 'joao@email.com', '(11) 98765-4321', '01001-000', 'Praca da Se', '10', 'Se', 'Sao Paulo', 'SP', 'CONSUMIDOR', 'RESIDENCIAL', 5000, 5000),
    ('${tenantId}', 'CLI004', 'PJ', '11.222.333/0001-81', '11222333000181', 'Obra Facil S.A.', 'Obra Facil', 'financeiro@obrafacil.com', '(21) 3344-5566', '20040-020', 'Av Rio Branco', '100', 'Centro', 'Rio de Janeiro', 'RJ', 'CONSTRUTORA', 'CONSTRUCAO_CIVIL', 80000, 80000),
    ('${tenantId}', 'CLI005', 'PF', '987.654.321-00', '98765432100', NULL, NULL, 'maria@email.com', '(31) 99876-5432', '30130-110', 'Av Afonso Pena', '200', 'Centro', 'Belo Horizonte', 'MG', 'CONSUMIDOR', 'RESIDENCIAL', 3000, 3000)
    ON CONFLICT DO NOTHING
  `);
  await dataSource.query(`UPDATE clientes SET "nomeCompleto"='Joao da Silva' WHERE "cpfCnpjLimpo"='12345678909' AND "tenantId"='${tenantId}'`);
  await dataSource.query(`UPDATE clientes SET "nomeCompleto"='Maria Oliveira' WHERE "cpfCnpjLimpo"='98765432100' AND "tenantId"='${tenantId}'`);
  console.log('  Clientes demo: 5 registros');

  // ======================== Fornecedores de demonstracao ========================
  await dataSource.query(`
    INSERT INTO fornecedores ("tenantId", "codigoInterno", "tipoPessoa", "cpfCnpj", "cpfCnpjLimpo", "razaoSocial", "nomeFantasia", "email", "telefone", "cidade", "uf", "prazoEntregaDias", "fornecedorAprovado", "tipoFrete", "rating") VALUES
    ('${tenantId}', 'FOR001', 'PJ', '01.234.567/0001-89', '01234567000189', 'Votorantim Cimentos S.A.', 'Votorantim', 'vendas@votorantim.com', '(11) 3511-0000', 'Sao Paulo', 'SP', 7, true, 'CIF', 4.50),
    ('${tenantId}', 'FOR002', 'PJ', '02.345.678/0001-90', '02345678000190', 'Tigre S.A.', 'Tigre', 'comercial@tigre.com', '(47) 3441-5000', 'Joinville', 'SC', 10, true, 'FOB', 4.20),
    ('${tenantId}', 'FOR003', 'PJ', '03.456.789/0001-01', '03456789000101', 'BASF S.A. (Suvinil)', 'Suvinil', 'vendas@suvinil.com', '(11) 2131-2000', 'Sao Bernardo do Campo', 'SP', 5, true, 'CIF', 4.80),
    ('${tenantId}', 'FOR004', 'PJ', '04.567.890/0001-12', '04567890000112', 'Gerdau S.A.', 'Gerdau', 'vendas@gerdau.com', '(51) 3323-2000', 'Porto Alegre', 'RS', 15, true, 'FOB', 4.00)
    ON CONFLICT DO NOTHING
  `);
  console.log('  Fornecedores demo: 4 registros');

  // ======================== Transportadoras de demonstracao ========================
  await dataSource.query(`
    INSERT INTO transportadoras ("tenantId", "codigoInterno", "razaoSocial", "nomeFantasia", "cnpj", "tipoFrete", "modal") VALUES
    ('${tenantId}', 'TRA001', 'Expresso Rapido Ltda', 'Expresso Rapido', '05.678.901/0001-23', 'CIF', 'RODOVIARIO'),
    ('${tenantId}', 'TRA002', 'Log Brasil Transportes', 'Log Brasil', '06.789.012/0001-34', 'FOB', 'RODOVIARIO')
    ON CONFLICT DO NOTHING
  `);
  console.log('  Transportadoras demo: 2 registros');

  // ======================== Vendedores de demonstracao ========================
  await dataSource.query(`
    INSERT INTO vendedores ("tenantId", "codigoInterno", "nomeCompleto", "email", "tipoComissao", "percentualComissao", "metaMensal") VALUES
    ('${tenantId}', 'VEN001', 'Carlos Vendedor', 'carlos@erp.com', 'PERCENTUAL', 3.00, 50000),
    ('${tenantId}', 'VEN002', 'Ana Comercial', 'ana@erp.com', 'PERCENTUAL', 2.50, 60000),
    ('${tenantId}', 'VEN003', 'Roberto Silva', 'roberto@erp.com', 'PERCENTUAL', 3.50, 45000)
    ON CONFLICT DO NOTHING
  `);
  console.log('  Vendedores demo: 3 registros');

  console.log('Cadastros auxiliares (Fase 3) populados com sucesso!');
}
