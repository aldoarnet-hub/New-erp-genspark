import { DataSource } from 'typeorm';

/**
 * Seed de dados fiscais - tabelas de referência tributária brasileira
 */
export async function seedFiscalData(dataSource: DataSource) {
  console.log('🏛️ Seeding dados fiscais...');

  const qr = dataSource.createQueryRunner();
  await qr.connect();

  try {
    // ============================================================
    // CST ICMS
    // ============================================================
    const cstIcmsCount = await qr.query(`SELECT COUNT(*) as c FROM cst_icms`);
    if (parseInt(cstIcmsCount[0].c) === 0) {
      console.log('  📋 Populando CST ICMS...');
      await qr.query(`
        INSERT INTO cst_icms ("cstCodigo", descricao, tipo, tributado, isento, "naoTributado", st, "exigeAliquota") VALUES
        ('000', 'Tributada integralmente', 'tributado', true, false, false, false, true),
        ('010', 'Tributada e com cobrança do ICMS por substituição tributária', 'tributado', true, false, false, true, true),
        ('020', 'Com redução da Base de Cálculo', 'tributado', true, false, false, false, true),
        ('030', 'Isenta ou não tributada e com cobrança do ICMS por ST', 'isento', false, true, false, true, false),
        ('040', 'Isenta', 'isento', false, true, false, false, false),
        ('041', 'Não tributada', 'nao_tributado', false, false, true, false, false),
        ('050', 'Suspensão', 'suspensao', false, false, false, false, false),
        ('051', 'Diferimento', 'diferimento', false, false, false, false, false),
        ('060', 'ICMS cobrado anteriormente por substituição tributária', 'tributado', true, false, false, true, false),
        ('070', 'Com redução da BC e cobrança do ICMS por ST', 'tributado', true, false, false, true, true),
        ('090', 'Outras', 'outros', false, false, false, false, false),
        ('101', 'Tributada pelo Simples Nacional com permissão de crédito', 'tributado', true, false, false, false, false),
        ('102', 'Tributada pelo Simples Nacional sem permissão de crédito', 'tributado', true, false, false, false, false),
        ('103', 'Isenção do ICMS no Simples Nacional', 'isento', false, true, false, false, false),
        ('201', 'Simples Nacional com crédito e ST', 'tributado', true, false, false, true, false),
        ('202', 'Simples Nacional sem crédito e com ST', 'tributado', true, false, false, true, false),
        ('203', 'Isenção Simples Nacional com ST', 'isento', false, true, false, true, false),
        ('300', 'Imune', 'isento', false, true, false, false, false),
        ('400', 'Não tributada pelo Simples Nacional', 'nao_tributado', false, false, true, false, false),
        ('500', 'ICMS cobrado anteriormente por ST ou por antecipação', 'tributado', true, false, false, false, false),
        ('900', 'Outros', 'outros', false, false, false, false, false)
      `);
    }

    // ============================================================
    // CST IPI
    // ============================================================
    const cstIpiCount = await qr.query(`SELECT COUNT(*) as c FROM cst_ipi`);
    if (parseInt(cstIpiCount[0].c) === 0) {
      console.log('  📋 Populando CST IPI...');
      await qr.query(`
        INSERT INTO cst_ipi ("cstCodigo", descricao, tipo, tributado, isento) VALUES
        ('00', 'Entrada com recuperação de crédito', 'entrada_credito', false, false),
        ('01', 'Entrada tributável com alíquota zero', 'entrada_zero', false, false),
        ('02', 'Entrada isenta', 'entrada_isenta', false, true),
        ('03', 'Entrada não-tributada', 'entrada_nao_trib', false, false),
        ('04', 'Entrada imune', 'entrada_imune', false, true),
        ('05', 'Entrada com suspensão', 'entrada_suspensao', false, false),
        ('49', 'Outras entradas', 'entrada_outras', false, false),
        ('50', 'Saída tributada', 'saida_tributada', true, false),
        ('51', 'Saída tributável com alíquota zero', 'saida_zero', false, false),
        ('52', 'Saída isenta', 'saida_isenta', false, true),
        ('53', 'Saída não-tributada', 'saida_nao_trib', false, false),
        ('54', 'Saída imune', 'saida_imune', false, true),
        ('55', 'Saída com suspensão', 'saida_suspensao', false, false),
        ('99', 'Outras saídas', 'saida_outras', false, false)
      `);
    }

    // ============================================================
    // CST PIS/COFINS
    // ============================================================
    const cstPisCofinsCount = await qr.query(`SELECT COUNT(*) as c FROM cst_pis_cofins`);
    if (parseInt(cstPisCofinsCount[0].c) === 0) {
      console.log('  📋 Populando CST PIS/COFINS...');
      await qr.query(`
        INSERT INTO cst_pis_cofins ("cstCodigo", descricao, "tipoOperacao", tributado, isento, "naoTributado") VALUES
        ('50', 'Operação com direito a crédito', 'entrada', false, false, false),
        ('51', 'Crédito vinculada a receitas isentas', 'entrada', false, true, false),
        ('52', 'Crédito vinculada a receitas não tributadas', 'entrada', false, false, true),
        ('60', 'Crédito presumido - aquisição produção rural', 'entrada', false, false, false),
        ('70', 'Aquisição sem direito a crédito', 'entrada', false, false, true),
        ('71', 'Aquisição com isenção', 'entrada', false, true, false),
        ('72', 'Aquisição com suspensão', 'entrada', false, false, false),
        ('73', 'Aquisição a alíquota zero', 'entrada', false, false, false),
        ('75', 'Aquisição por substituição tributária', 'entrada', false, false, false),
        ('98', 'Outras operações de entrada', 'entrada', false, false, false),
        ('01', 'Operação tributável com alíquota básica', 'saida', true, false, false),
        ('02', 'Operação tributável com alíquota diferenciada', 'saida', true, false, false),
        ('03', 'Operação tributável por unidade de medida', 'saida', true, false, false),
        ('04', 'Monofásica - revenda a alíquota zero', 'saida', false, false, false),
        ('05', 'Operação tributável por ST', 'saida', true, false, false),
        ('06', 'Operação tributável a alíquota zero', 'saida', false, false, false),
        ('07', 'Operação isenta da contribuição', 'saida', false, true, false),
        ('08', 'Operação sem incidência da contribuição', 'saida', false, false, true),
        ('09', 'Operação com suspensão da contribuição', 'saida', false, false, false),
        ('49', 'Outras operações de saída', 'saida', false, false, false)
      `);
    }

    // ============================================================
    // CFOP mais comuns
    // ============================================================
    const cfopCount = await qr.query(`SELECT COUNT(*) as c FROM cfop_tabela`);
    if (parseInt(cfopCount[0].c) === 0) {
      console.log('  📋 Populando CFOPs...');
      await qr.query(`
        INSERT INTO cfop_tabela ("cfopCodigo", descricao, "descricaoResumida", "tipoOperacao", grupo, venda, interno, interestadual, aquisicao, devolucao, remessa) VALUES
        ('5101', 'Venda de produção do estabelecimento', 'Venda Produção', 'S', '1', true, true, false, false, false, false),
        ('5102', 'Venda de mercadoria adquirida ou recebida de terceiros', 'Venda Mercadoria', 'S', '1', true, true, false, false, false, false),
        ('5405', 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária, na condição de contribuinte substituído', 'Venda ST Substituído', 'S', '1', true, true, false, false, false, false),
        ('6101', 'Venda de produção do estabelecimento', 'Venda Produção UF', 'S', '1', true, false, true, false, false, false),
        ('6102', 'Venda de mercadoria adquirida ou recebida de terceiros', 'Venda Mercadoria UF', 'S', '1', true, false, true, false, false, false),
        ('1101', 'Compra para industrialização', 'Compra Industrialização', 'E', '1', false, true, false, true, false, false),
        ('1102', 'Compra para comercialização', 'Compra Comercialização', 'E', '1', false, true, false, true, false, false),
        ('2101', 'Compra para industrialização', 'Compra Ind. UF', 'E', '1', false, false, true, true, false, false),
        ('2102', 'Compra para comercialização', 'Compra Com. UF', 'E', '1', false, false, true, true, false, false),
        ('5201', 'Devolução de compra para industrialização', 'Devolução Compra Ind.', 'S', '2', false, true, false, false, true, false),
        ('6201', 'Devolução de compra para industrialização', 'Devolução Compra Ind. UF', 'S', '2', false, false, true, false, true, false),
        ('1201', 'Devolução de venda de produção', 'Devolução Venda Prod.', 'E', '2', false, true, false, false, true, false),
        ('2201', 'Devolução de venda de produção', 'Devolução Venda Prod. UF', 'E', '2', false, false, true, false, true, false),
        ('5901', 'Remessa para industrialização por encomenda', 'Remessa Ind. Encomenda', 'S', '3', false, true, false, false, false, true),
        ('6901', 'Remessa para industrialização por encomenda', 'Remessa Ind. Encomenda UF', 'S', '3', false, false, true, false, false, true),
        ('5910', 'Remessa em bonificação, doação ou brinde', 'Bonificação/Doação', 'S', '4', false, true, false, false, false, true),
        ('6910', 'Remessa em bonificação, doação ou brinde', 'Bonificação/Doação UF', 'S', '4', false, false, true, false, false, true),
        ('5656', 'Venda de combustível adquirido de terceiros destinado a consumidor final', 'Venda Combustível', 'S', '1', true, true, false, false, false, false)
      `);
    }

    // ============================================================
    // Alíquotas ICMS por UF (SP para todos os estados)
    // ============================================================
    const icmsUfCount = await qr.query(`SELECT COUNT(*) as c FROM icms_aliquotas_uf`);
    if (parseInt(icmsUfCount[0].c) === 0) {
      console.log('  📋 Populando alíquotas ICMS por UF...');
      await qr.query(`
        INSERT INTO icms_aliquotas_uf ("ufOrigem", "ufDestino", "aliqInterna", "aliqInterestadual", "aliqFcp", "dataInicioVigencia") VALUES
        ('SP', 'SP', 18.00, 18.00, 0.00, '2024-01-01'),
        ('SP', 'RJ', 20.00, 12.00, 0.00, '2024-01-01'),
        ('SP', 'MG', 18.00, 12.00, 0.00, '2024-01-01'),
        ('SP', 'PR', 18.00, 12.00, 0.00, '2024-01-01'),
        ('SP', 'RS', 18.00, 12.00, 0.00, '2024-01-01'),
        ('SP', 'SC', 17.00, 12.00, 0.00, '2024-01-01'),
        ('SP', 'BA', 18.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'CE', 18.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'GO', 17.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'DF', 18.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'ES', 17.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'MS', 17.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'MT', 17.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'PE', 18.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'PA', 17.00, 7.00, 0.00, '2024-01-01'),
        ('SP', 'AM', 18.00, 7.00, 0.00, '2024-01-01'),
        ('RJ', 'SP', 18.00, 12.00, 0.00, '2024-01-01'),
        ('MG', 'SP', 18.00, 12.00, 0.00, '2024-01-01'),
        ('PR', 'SP', 18.00, 12.00, 0.00, '2024-01-01'),
        ('RS', 'SP', 18.00, 12.00, 0.00, '2024-01-01'),
        ('SC', 'SP', 18.00, 12.00, 0.00, '2024-01-01')
      `);
    }

    // ============================================================
    // NCM de materiais de construção (exemplos)
    // ============================================================
    const ncmCount = await qr.query(`SELECT COUNT(*) as c FROM ncm_tabela`);
    if (parseInt(ncmCount[0].c) === 0) {
      console.log('  📋 Populando NCMs (materiais de construção)...');
      await qr.query(`
        INSERT INTO ncm_tabela ("ncmCodigo", descricao, capitulo, posicao, "ipiAliqSaida", "dataInicioVigencia") VALUES
        ('25232900', 'Cimento Portland cinzento', '25', '2523', 0.00, '2024-01-01'),
        ('25232100', 'Cimento Portland branco', '25', '2523', 0.00, '2024-01-01'),
        ('72142000', 'Barras de ferro ou aço', '72', '7214', 5.00, '2024-01-01'),
        ('72131000', 'Vergalhões de ferro ou aço', '72', '7213', 5.00, '2024-01-01'),
        ('68071000', 'Produtos de asfalto - rolos', '68', '6807', 0.00, '2024-01-01'),
        ('69072100', 'Ladrilhos e placas cerâmicas', '69', '6907', 0.00, '2024-01-01'),
        ('73066100', 'Tubos de aço soldados', '73', '7306', 5.00, '2024-01-01'),
        ('32091000', 'Tintas e vernizes à base de polímeros acrílicos', '32', '3209', 5.00, '2024-01-01'),
        ('32091010', 'Tinta látex', '32', '3209', 5.00, '2024-01-01'),
        ('82055900', 'Ferramentas manuais', '82', '8205', 10.00, '2024-01-01'),
        ('39172100', 'Tubos rígidos de PVC', '39', '3917', 5.00, '2024-01-01'),
        ('39172900', 'Tubos plásticos diversos', '39', '3917', 5.00, '2024-01-01'),
        ('73071100', 'Acessórios de tubulação ferro fundido', '73', '7307', 5.00, '2024-01-01'),
        ('85361000', 'Fusíveis e corta-circuitos', '85', '8536', 15.00, '2024-01-01'),
        ('85362000', 'Disjuntores', '85', '8536', 15.00, '2024-01-01'),
        ('85366900', 'Plugues e tomadas', '85', '8536', 15.00, '2024-01-01'),
        ('85441100', 'Fios de cobre para enrolamentos', '85', '8544', 10.00, '2024-01-01'),
        ('85444900', 'Condutores elétricos diversos', '85', '8544', 10.00, '2024-01-01'),
        ('70052100', 'Vidro float incolor', '70', '7005', 5.00, '2024-01-01'),
        ('44189000', 'Obras de marcenaria para construções', '44', '4418', 5.00, '2024-01-01')
      `);
    }

    console.log('✅ Dados fiscais populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular dados fiscais:', error.message);
  } finally {
    await qr.release();
  }
}
