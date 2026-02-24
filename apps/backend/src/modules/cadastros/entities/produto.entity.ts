import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// ============================================================
// Produto Principal
// ============================================================
@Entity('produtos')
@Index(['tenantId'])
@Index(['tenantId', 'codigoInterno'], { unique: true })
@Index(['tenantId', 'codigoBarras'], { unique: true, where: '"codigoBarras" IS NOT NULL' })
@Index(['categoriaId'])
@Index(['marcaId'])
@Index(['status'])
export class Produto {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;

  // Codigos
  @Column({ length: 20 }) codigoInterno: string;
  @Column({ nullable: true, length: 14 }) codigoBarras: string;
  @Column({ nullable: true, length: 14 }) codigoBarrasAlt: string;
  @Column({ nullable: true, length: 30 }) codigoFornecedor: string;
  @Column({ nullable: true, length: 30 }) codigoFabricante: string;

  // Descricoes
  @Column({ length: 120 }) descricao: string;
  @Column({ nullable: true, length: 30 }) descricaoReduzida: string;
  @Column({ nullable: true, type: 'text' }) descricaoComplementar: string;

  // Classificacao
  @Column({ nullable: true }) categoriaId: string;
  @Column({ nullable: true }) marcaId: string;
  @Column({ nullable: true }) fabricanteId: string;

  // Tipo
  @Column({ length: 20, default: 'SIMPLES' }) tipoProduto: string; // SIMPLES, KIT, SERVICO, MATERIA_PRIMA
  @Column({ default: false }) controlaSerie: boolean;
  @Column({ default: false }) controlaLote: boolean;

  // Unidades
  @Column({ nullable: true }) unidadeCompraId: string;
  @Column({ nullable: true }) unidadeVendaId: string;
  @Column({ nullable: true }) unidadeEstoqueId: string;
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1 }) fatorConversao: number;

  // Dimensoes
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true }) alturaCm: number;
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true }) larguraCm: number;
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true }) profundidadeCm: number;
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true }) pesoLiquidoKg: number;
  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true }) pesoBrutoKg: number;
  @Column({ type: 'decimal', precision: 12, scale: 4, nullable: true }) cubagemM3: number;

  // Caracteristicas
  @Column({ nullable: true, length: 50 }) material: string;
  @Column({ nullable: true, length: 30 }) cor: string;
  @Column({ nullable: true, length: 30 }) acabamento: string;
  @Column({ nullable: true, length: 10 }) voltagem: string;

  // Embalagem
  @Column({ type: 'int', default: 1 }) unidadesPorCaixa: number;
  @Column({ type: 'int', nullable: true }) caixasPorPallet: number;

  // Fiscal
  @Column({ nullable: true, length: 8 }) ncm: string;
  @Column({ nullable: true, length: 7 }) cest: string;
  @Column({ nullable: true, length: 4 }) cfopPadrao: string;
  @Column({ nullable: true, length: 3 }) cstIcms: string;
  @Column({ nullable: true, length: 2 }) cstPis: string;
  @Column({ nullable: true, length: 2 }) cstCofins: string;
  @Column({ nullable: true, length: 2 }) cstIpi: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) aliquotaIcms: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) aliquotaIpi: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) aliquotaPis: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) aliquotaCofins: number;
  @Column({ default: false }) substituicaoTributaria: boolean;
  @Column({ nullable: true, length: 6 }) origemMercadoria: string; // 0-Nacional, 1-Importada, etc.

  // Estoque
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) estoqueMinimo: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) estoqueMaximo: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) pontoPedido: number;
  @Column({ nullable: true, length: 20 }) localizacaoPadrao: string;
  @Column({ nullable: true, type: 'char', length: 1 }) curvaAbc: string;

  // Custos e Precos
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) custoUltimaCompra: number;
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) custoMedio: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) markupPadrao: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) margemMinima: number;

  // Status
  @Column({ length: 15, default: 'ATIVO' }) status: string;
  @Column({ default: false }) bloqueadoVenda: boolean;
  @Column({ default: false }) bloqueadoCompra: boolean;

  // Observacoes
  @Column({ nullable: true, type: 'text' }) observacoes: string;

  @CreateDateColumn() dataCadastro: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
  @Column({ nullable: true }) criadoPor: string;
  @Column({ nullable: true }) atualizadoPor: string;
}

// ============================================================
// Precos por Filial/Tabela
// ============================================================
@Entity('produtos_precos')
@Index(['tenantId', 'produtoId', 'filialId', 'tabelaPrecoId'], { unique: true })
export class ProdutoPreco {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoId: string;
  @Column() filialId: string;
  @Column() tabelaPrecoId: string;
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) precoCusto: number;
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) precoVenda: number;
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true }) precoPromocional: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true }) margemLucro: number;
  @Column({ type: 'date', nullable: true }) dataInicioPromocao: Date;
  @Column({ type: 'date', nullable: true }) dataFimPromocao: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
}

// ============================================================
// Estoque por Filial
// ============================================================
@Entity('produtos_filiais')
@Index(['tenantId', 'produtoId', 'filialId'], { unique: true })
export class ProdutoFilial {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoId: string;
  @Column() filialId: string;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) saldoAtual: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) saldoReservado: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) saldoDisponivel: number;
  @Column({ type: 'decimal', precision: 12, scale: 3, default: 0 }) saldoBloqueado: number;
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) custoMedio: number;
  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0 }) custoUltimaEntrada: number;
  @Column({ nullable: true, length: 20 }) localizacao: string;
  @Column({ nullable: true, type: 'char', length: 1 }) curvaAbc: string;
}

// ============================================================
// Composicao (Kits)
// ============================================================
@Entity('produtos_composicao')
@Index(['tenantId', 'produtoPaiId', 'produtoFilhoId'], { unique: true })
export class ProdutoComposicao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoPaiId: string;
  @Column() produtoFilhoId: string;
  @Column({ type: 'decimal', precision: 10, scale: 3, default: 1 }) quantidade: number;
  @Column({ nullable: true }) unidadeMedidaId: string;
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true }) custoUnitario: number;
  @Column({ type: 'int', default: 0 }) ordem: number;
  @Column({ default: true }) obrigatorio: boolean;
}

// ============================================================
// Similares
// ============================================================
@Entity('produtos_similares')
@Index(['tenantId', 'produtoId', 'produtoSimilarId'], { unique: true })
export class ProdutoSimilar {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoId: string;
  @Column() produtoSimilarId: string;
  @Column({ length: 20 }) tipoSimilaridade: string; // SIMILAR, SUBSTITUTO, COMPLEMENTAR
  @Column({ type: 'int', default: 1 }) prioridade: number;
  @Column({ nullable: true, type: 'text' }) observacao: string;
}

// ============================================================
// Aplicacoes do Produto
// ============================================================
@Entity('produtos_aplicacoes')
@Index(['tenantId', 'produtoId'])
export class ProdutoAplicacao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoId: string;
  @Column({ length: 100 }) descricao: string;
  @Column({ nullable: true, type: 'text' }) detalhes: string;
  @Column({ type: 'int', default: 0 }) ordem: number;
}

// ============================================================
// Midia do Produto (imagens, fichas tecnicas, etc.)
// ============================================================
@Entity('produtos_midia')
@Index(['tenantId', 'produtoId'])
export class ProdutoMidia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() produtoId: string;
  @Column({ length: 500 }) url: string;
  @Column({ length: 20, default: 'IMAGEM' }) tipo: string; // IMAGEM, FICHA_TECNICA, VIDEO, MANUAL
  @Column({ nullable: true, length: 100 }) mimeType: string;
  @Column({ nullable: true, type: 'bigint' }) tamanhoBytes: number;
  @Column({ nullable: true, length: 200 }) nomeOriginal: string;
  @Column({ default: false }) principal: boolean;
  @Column({ type: 'int', default: 0 }) ordem: number;
  @CreateDateColumn() dataCadastro: Date;
}
