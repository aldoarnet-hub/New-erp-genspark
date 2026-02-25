import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MapeamentoOperacaoContabil } from '../entities/contabil.entities';
import { TipoOperacaoContabil } from '../enums/contabil.enums';
import { UpdateMapeamentoDto } from '../dto/contabil.dto';

interface MapeamentoSeed {
  tipoOperacao: TipoOperacaoContabil;
  descricaoOperacao: string;
  contaDebitoCodigo: string;
  contaDebitoDescricao: string;
  contaCreditoCodigo: string;
  contaCreditoDescricao: string;
  historicoTemplate: string;
  grupo: string;
}

@Injectable()
export class MapeamentoContabilService {
  private readonly logger = new Logger(MapeamentoContabilService.name);

  constructor(
    @InjectRepository(MapeamentoOperacaoContabil)
    private readonly mapeamentoRepo: Repository<MapeamentoOperacaoContabil>,
  ) {}

  // ============================================================
  // MAPEAMENTO COMPLETO: OPERACAO DO SISTEMA → CONTAS
  // Conforme tabela fornecida pelo usuario
  // ============================================================
  private readonly MAPEAMENTO_SEED: MapeamentoSeed[] = [
    // ===== VENDAS =====
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_DINHEIRO,
      descricaoOperacao: 'Venda a Vista (Dinheiro)',
      contaDebitoCodigo: '1.1.01.001',
      contaDebitoDescricao: 'Caixa Geral',
      contaCreditoCodigo: '3.1.01.001',
      contaCreditoDescricao: 'Vendas a Vista (Dinheiro)',
      historicoTemplate: 'Venda a vista em dinheiro - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_PIX,
      descricaoOperacao: 'Venda PIX',
      contaDebitoCodigo: '1.1.02.003',
      contaDebitoDescricao: 'Banco Conta Corrente - PIX',
      contaCreditoCodigo: '3.1.01.005',
      contaCreditoDescricao: 'Vendas PIX',
      historicoTemplate: 'Venda via PIX - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_CARTAO_CREDITO,
      descricaoOperacao: 'Venda Cartao de Credito',
      contaDebitoCodigo: '1.1.09.001',
      contaDebitoDescricao: 'Aguardando Compensacao - Cartao Credito',
      contaCreditoCodigo: '3.1.01.003',
      contaCreditoDescricao: 'Vendas Cartao de Credito',
      historicoTemplate: 'Venda cartao credito - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_CARTAO_DEBITO,
      descricaoOperacao: 'Venda Cartao de Debito',
      contaDebitoCodigo: '1.1.09.002',
      contaDebitoDescricao: 'Aguardando Compensacao - Cartao Debito',
      contaCreditoCodigo: '3.1.01.004',
      contaCreditoDescricao: 'Vendas Cartao de Debito',
      historicoTemplate: 'Venda cartao debito - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_BOLETO,
      descricaoOperacao: 'Venda Boleto',
      contaDebitoCodigo: '1.1.04.002',
      contaDebitoDescricao: 'Boletos a Receber',
      contaCreditoCodigo: '3.1.01.006',
      contaCreditoDescricao: 'Vendas Boleto',
      historicoTemplate: 'Venda via boleto - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_CREDIARIO,
      descricaoOperacao: 'Venda Crediario',
      contaDebitoCodigo: '1.1.04.007',
      contaDebitoDescricao: 'Crediario a Receber',
      contaCreditoCodigo: '3.1.01.008',
      contaCreditoDescricao: 'Vendas Crediario',
      historicoTemplate: 'Venda via crediario - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.VENDA_VALE,
      descricaoOperacao: 'Venda com Vale / Credito',
      contaDebitoCodigo: '2.1.06.002',
      contaDebitoDescricao: 'Vales a Utilizar',
      contaCreditoCodigo: '3.1.01.009',
      contaCreditoDescricao: 'Vendas com Vale / Credito',
      historicoTemplate: 'Venda com vale/credito - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },

    // ===== COMPENSACAO CARTAO =====
    {
      tipoOperacao: TipoOperacaoContabil.COMPENSACAO_CARTAO,
      descricaoOperacao: 'Compensacao Cartao (float bancario)',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '1.1.09.001',
      contaCreditoDescricao: 'Aguardando Compensacao - Cartao Credito',
      historicoTemplate: 'Compensacao cartao creditado em conta - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.TAXA_OPERADORA_CARTAO,
      descricaoOperacao: 'Taxa Operadora Cartao',
      contaDebitoCodigo: '5.3.02.001',
      contaDebitoDescricao: 'Taxa Operadora Cartao de Credito',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Taxa operadora cartao - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== BOLETOS =====
    {
      tipoOperacao: TipoOperacaoContabil.RECEBIMENTO_BOLETO,
      descricaoOperacao: 'Recebimento de Boleto',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '1.1.04.002',
      contaCreditoDescricao: 'Boletos a Receber',
      historicoTemplate: 'Recebimento boleto - Doc {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.TARIFA_BOLETO,
      descricaoOperacao: 'Tarifa Boleto Bancario',
      contaDebitoCodigo: '5.3.01.003',
      contaDebitoDescricao: 'Tarifa de Boleto Bancario',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Tarifa boleto bancario - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== ANTECIPACAO CARTAO =====
    {
      tipoOperacao: TipoOperacaoContabil.ANTECIPACAO_CARTAO,
      descricaoOperacao: 'Antecipacao de Cartao',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '1.1.09.001',
      contaCreditoDescricao: 'Aguardando Compensacao - Cartao Credito',
      historicoTemplate: 'Antecipacao recebiveis cartao - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.CUSTO_ANTECIPACAO_CARTAO,
      descricaoOperacao: 'Custo Antecipacao de Cartao',
      contaDebitoCodigo: '5.3.04.001',
      contaDebitoDescricao: 'Custo Antecipacao de Cartao',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Custo antecipacao cartao - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== ANTECIPACAO BOLETO =====
    {
      tipoOperacao: TipoOperacaoContabil.ANTECIPACAO_BOLETO,
      descricaoOperacao: 'Antecipacao de Boleto',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '1.1.04.010',
      contaCreditoDescricao: 'Antecipacao de Boletos',
      historicoTemplate: 'Antecipacao de boletos - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.CUSTO_ANTECIPACAO_BOLETO,
      descricaoOperacao: 'Custo Antecipacao de Boleto',
      contaDebitoCodigo: '5.3.04.002',
      contaDebitoDescricao: 'Custo Antecipacao de Boleto',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Custo antecipacao boleto - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== DESCONTO BOLETO =====
    {
      tipoOperacao: TipoOperacaoContabil.DESCONTO_BOLETO,
      descricaoOperacao: 'Desconto de Boleto',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '1.1.04.012',
      contaCreditoDescricao: 'Boletos em Desconto na Carteira',
      historicoTemplate: 'Desconto de boleto bancario - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.CUSTO_DESCONTO_BOLETO,
      descricaoOperacao: 'Custo Desconto de Boleto',
      contaDebitoCodigo: '5.3.04.004',
      contaDebitoDescricao: 'Custo Desconto de Boleto',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Custo desconto boleto - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== BOLETO DEVOLVIDO =====
    {
      tipoOperacao: TipoOperacaoContabil.BOLETO_DEVOLVIDO,
      descricaoOperacao: 'Boleto Devolvido (debitado em conta)',
      contaDebitoCodigo: '2.1.07.001',
      contaDebitoDescricao: 'Boletos Devolvidos a Tratar',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Boleto devolvido debitado em conta - Doc {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.RECUPERACAO_BOLETO_DEVOLVIDO,
      descricaoOperacao: 'Recuperacao de Boleto Devolvido',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '3.4.02.005',
      contaCreditoDescricao: 'Cobrancas Recuperadas',
      historicoTemplate: 'Recuperacao boleto devolvido - Doc {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.PREJUIZO_BOLETO_DEVOLVIDO,
      descricaoOperacao: 'Prejuizo por Boleto Devolvido',
      contaDebitoCodigo: '5.2.03.004',
      contaDebitoDescricao: 'Perdas em Cobrancas',
      contaCreditoCodigo: '2.1.07.001',
      contaCreditoDescricao: 'Boletos Devolvidos a Tratar',
      historicoTemplate: 'Baixa prejuizo boleto devolvido - Doc {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== EMPRESTIMO =====
    {
      tipoOperacao: TipoOperacaoContabil.EMPRESTIMO_LIBERACAO,
      descricaoOperacao: 'Emprestimo - Liberacao',
      contaDebitoCodigo: '1.1.02.001',
      contaDebitoDescricao: 'Banco Conta Corrente - Principal',
      contaCreditoCodigo: '2.1.02.001',
      contaCreditoDescricao: 'Emprestimos Bancarios CP',
      historicoTemplate: 'Liberacao emprestimo bancario - Contrato {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.EMPRESTIMO_PAGAMENTO_PARCELA,
      descricaoOperacao: 'Emprestimo - Pagamento de Parcela',
      contaDebitoCodigo: '2.1.02.001',
      contaDebitoDescricao: 'Emprestimos Bancarios CP',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Pagamento parcela emprestimo - Contrato {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.EMPRESTIMO_JUROS,
      descricaoOperacao: 'Emprestimo - Juros',
      contaDebitoCodigo: '5.3.03.001',
      contaDebitoDescricao: 'Juros sobre Emprestimos',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Juros emprestimo - Contrato {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.IOF_EMPRESTIMO,
      descricaoOperacao: 'IOF sobre Emprestimo',
      contaDebitoCodigo: '5.3.04.006',
      contaDebitoDescricao: 'IOF sobre Emprestimos',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'IOF emprestimo - Contrato {documento} - R$ {valor}',
      grupo: 'FINANCEIRO',
    },

    // ===== VALES / CREDITOS =====
    {
      tipoOperacao: TipoOperacaoContabil.EMISSAO_VALE,
      descricaoOperacao: 'Emissao de Vale / Credito para Cliente',
      contaDebitoCodigo: '5.2.03.002',
      contaDebitoDescricao: 'Descontos Concedidos',
      contaCreditoCodigo: '2.1.06.002',
      contaCreditoDescricao: 'Vales a Utilizar',
      historicoTemplate: 'Emissao vale/credito cliente - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.UTILIZACAO_VALE,
      descricaoOperacao: 'Utilizacao de Vale pelo Cliente',
      contaDebitoCodigo: '2.1.06.002',
      contaDebitoDescricao: 'Vales a Utilizar',
      contaCreditoCodigo: '3.1.01.009',
      contaCreditoDescricao: 'Vendas com Vale / Credito',
      historicoTemplate: 'Utilizacao vale pelo cliente - Doc {documento} - R$ {valor}',
      grupo: 'VENDAS',
    },

    // ===== COMPRAS =====
    {
      tipoOperacao: TipoOperacaoContabil.COMPRA_MERCADORIA,
      descricaoOperacao: 'Compra de Mercadoria',
      contaDebitoCodigo: '1.1.06.001',
      contaDebitoDescricao: 'Estoque de Mercadorias',
      contaCreditoCodigo: '2.1.01.001',
      contaCreditoDescricao: 'Fornecedores Nacionais',
      historicoTemplate: 'Compra mercadoria - NF {documento} - R$ {valor}',
      grupo: 'COMPRAS',
    },
    {
      tipoOperacao: TipoOperacaoContabil.PAGAMENTO_FORNECEDOR,
      descricaoOperacao: 'Pagamento a Fornecedor',
      contaDebitoCodigo: '2.1.01.001',
      contaDebitoDescricao: 'Fornecedores Nacionais',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Pagamento fornecedor - NF {documento} - R$ {valor}',
      grupo: 'COMPRAS',
    },

    // ===== FOLHA =====
    {
      tipoOperacao: TipoOperacaoContabil.FOLHA_PAGAMENTO,
      descricaoOperacao: 'Folha de Pagamento (provisao)',
      contaDebitoCodigo: '5.1.01.001',
      contaDebitoDescricao: 'Salarios e Ordenados',
      contaCreditoCodigo: '2.1.03.001',
      contaCreditoDescricao: 'Salarios a Pagar',
      historicoTemplate: 'Provisao folha pagamento {documento} - R$ {valor}',
      grupo: 'FOLHA',
    },
    {
      tipoOperacao: TipoOperacaoContabil.PAGAMENTO_SALARIOS,
      descricaoOperacao: 'Pagamento de Salarios',
      contaDebitoCodigo: '2.1.03.001',
      contaDebitoDescricao: 'Salarios a Pagar',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Pagamento salarios {documento} - R$ {valor}',
      grupo: 'FOLHA',
    },

    // ===== TAXAS BANCARIAS =====
    {
      tipoOperacao: TipoOperacaoContabil.TAXA_BANCARIA_MANUTENCAO,
      descricaoOperacao: 'Taxa Bancaria de Manutencao',
      contaDebitoCodigo: '5.3.01.001',
      contaDebitoDescricao: 'Tarifa de Manutencao de Conta',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Taxa manutencao conta bancaria - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
    {
      tipoOperacao: TipoOperacaoContabil.CHEQUE_ESPECIAL_JUROS,
      descricaoOperacao: 'Cheque Especial - Juros',
      contaDebitoCodigo: '5.3.03.003',
      contaDebitoDescricao: 'Juros sobre Cheque Especial',
      contaCreditoCodigo: '1.1.02.001',
      contaCreditoDescricao: 'Banco Conta Corrente - Principal',
      historicoTemplate: 'Juros cheque especial - R$ {valor}',
      grupo: 'FINANCEIRO',
    },
  ];

  // ============================================================
  // METODOS PUBLICOS
  // ============================================================

  async inicializarMapeamentos(tenantId: string): Promise<{ criados: number; existentes: number }> {
    this.logger.log(`Inicializando mapeamentos contabeis para tenant ${tenantId}`);
    let criados = 0;
    let existentes = 0;

    for (const seed of this.MAPEAMENTO_SEED) {
      const existe = await this.mapeamentoRepo.findOne({
        where: { tenantId, tipoOperacao: seed.tipoOperacao },
      });

      if (existe) {
        existentes++;
        continue;
      }

      const mapeamento = this.mapeamentoRepo.create({
        tenantId,
        ...seed,
      });
      await this.mapeamentoRepo.save(mapeamento);
      criados++;
    }

    this.logger.log(`Mapeamentos: ${criados} criados, ${existentes} ja existentes`);
    return { criados, existentes };
  }

  async listarMapeamentos(
    tenantId: string,
    filtros?: { grupo?: string; ativo?: boolean },
  ): Promise<MapeamentoOperacaoContabil[]> {
    const qb = this.mapeamentoRepo
      .createQueryBuilder('m')
      .where('m.tenantId = :tenantId', { tenantId })
      .orderBy('m.grupo', 'ASC')
      .addOrderBy('m.tipoOperacao', 'ASC');

    if (filtros?.grupo) qb.andWhere('m.grupo = :grupo', { grupo: filtros.grupo });
    if (filtros?.ativo !== undefined) qb.andWhere('m.ativo = :ativo', { ativo: filtros.ativo });

    return qb.getMany();
  }

  async buscarMapeamento(tenantId: string, tipoOperacao: string): Promise<MapeamentoOperacaoContabil> {
    const mapeamento = await this.mapeamentoRepo.findOne({
      where: { tenantId, tipoOperacao, ativo: true },
    });
    if (!mapeamento) {
      throw new NotFoundException(`Mapeamento para operacao ${tipoOperacao} nao encontrado`);
    }
    return mapeamento;
  }

  async atualizarMapeamento(
    tenantId: string,
    tipoOperacao: string,
    dto: UpdateMapeamentoDto,
  ): Promise<MapeamentoOperacaoContabil> {
    const mapeamento = await this.buscarMapeamento(tenantId, tipoOperacao);
    Object.assign(mapeamento, dto);
    return this.mapeamentoRepo.save(mapeamento);
  }

  async obterMapeamentosPorGrupo(tenantId: string): Promise<Record<string, MapeamentoOperacaoContabil[]>> {
    const todos = await this.listarMapeamentos(tenantId, { ativo: true });
    const porGrupo: Record<string, MapeamentoOperacaoContabil[]> = {};

    for (const m of todos) {
      if (!porGrupo[m.grupo]) porGrupo[m.grupo] = [];
      porGrupo[m.grupo].push(m);
    }

    return porGrupo;
  }

  getOperacoesDisponiveis(): { operacao: string; descricao: string; grupo: string }[] {
    return this.MAPEAMENTO_SEED.map((s) => ({
      operacao: s.tipoOperacao,
      descricao: s.descricaoOperacao,
      grupo: s.grupo,
    }));
  }

  getQuantidadeMapeamentos(): number {
    return this.MAPEAMENTO_SEED.length;
  }
}
