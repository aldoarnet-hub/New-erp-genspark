import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// ============================================================
// Fornecedor
// ============================================================
@Entity('fornecedores')
@Index(['tenantId'])
@Index(['tenantId', 'codigoInterno'], { unique: true })
@Index(['tenantId', 'cpfCnpjLimpo'], { unique: true })
export class Fornecedor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigoInterno: string;

  @Column({ length: 2 }) tipoPessoa: string;
  @Column({ length: 18 }) cpfCnpj: string;
  @Column({ length: 14 }) cpfCnpjLimpo: string;
  @Column({ nullable: true, length: 20 }) rgIe: string;
  @Column({ nullable: true, length: 20 }) im: string;

  @Column({ nullable: true, length: 150 }) razaoSocial: string;
  @Column({ nullable: true, length: 100 }) nomeFantasia: string;

  @Column({ nullable: true, length: 150 }) email: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ nullable: true, length: 20 }) celular: string;
  @Column({ nullable: true, length: 200 }) site: string;
  @Column({ nullable: true, length: 100 }) contatoPrincipal: string;

  @Column({ nullable: true, length: 9 }) cep: string;
  @Column({ nullable: true, length: 150 }) endereco: string;
  @Column({ nullable: true, length: 20 }) numero: string;
  @Column({ nullable: true, length: 50 }) complemento: string;
  @Column({ nullable: true, length: 50 }) bairro: string;
  @Column({ nullable: true, length: 50 }) cidade: string;
  @Column({ nullable: true, type: 'char', length: 2 }) uf: string;
  @Column({ nullable: true, length: 7 }) codigoIbge: string;

  // Certificacoes
  @Column({ default: false }) certificadoIso: boolean;
  @Column({ nullable: true, length: 20 }) certificadoIsoTipo: string;
  @Column({ nullable: true, type: 'date' }) certificadoIsoValidade: Date;

  // Condicoes Comerciais
  @Column({ type: 'int', default: 0 }) prazoEntregaDias: number;
  @Column({ nullable: true }) formaPagamentoId: string;
  @Column({ nullable: true }) condicaoPagamentoId: string;
  @Column({ nullable: true, length: 10 }) tipoFrete: string; // CIF, FOB
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) valorMinimoCompra: number;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) descontoNegociado: number;

  // Rating
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) rating: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) qualidadeNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) prazoNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) precoNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) atendimentoNota: number;

  // Historico Compras
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) totalCompras: number;
  @Column({ type: 'int', default: 0 }) quantidadeCompras: number;
  @Column({ type: 'date', nullable: true }) ultimaCompraData: Date;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) ticketMedioCompra: number;

  // Categorias de Produto fornecidas
  @Column({ nullable: true, type: 'text' }) categoriasAtendidas: string; // JSON array of category IDs

  @Column({ length: 15, default: 'ATIVO' }) status: string;
  @Column({ default: false }) fornecedorAprovado: boolean;
  @Column({ nullable: true, type: 'text' }) observacoes: string;

  @CreateDateColumn() dataCadastro: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
  @Column({ nullable: true }) criadoPor: string;
  @Column({ nullable: true }) atualizadoPor: string;
}

// ============================================================
// Avaliacoes de Fornecedor
// ============================================================
@Entity('fornecedores_avaliacoes')
@Index(['tenantId', 'fornecedorId'])
export class FornecedorAvaliacao {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() fornecedorId: string;
  @CreateDateColumn() dataAvaliacao: Date;
  @Column({ type: 'date', nullable: true }) periodoInicio: Date;
  @Column({ type: 'date', nullable: true }) periodoFim: Date;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) qualidadeNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) prazoNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) precoNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) atendimentoNota: number;
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true }) notaGeral: number;
  @Column({ nullable: true, type: 'text' }) observacoes: string;
  @Column({ nullable: true }) avaliadoPor: string;
}

// ============================================================
// Transportadoras
// ============================================================
@Entity('transportadoras')
@Index(['tenantId', 'codigoInterno'], { unique: true })
export class Transportadora {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigoInterno: string;
  @Column({ length: 150 }) razaoSocial: string;
  @Column({ nullable: true, length: 100 }) nomeFantasia: string;
  @Column({ length: 18 }) cnpj: string;
  @Column({ nullable: true, length: 20 }) ie: string;
  @Column({ nullable: true, length: 100 }) rntrc: string; // Registro transportador
  @Column({ nullable: true, length: 150 }) email: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ nullable: true, length: 9 }) cep: string;
  @Column({ nullable: true, length: 150 }) endereco: string;
  @Column({ nullable: true, length: 50 }) cidade: string;
  @Column({ nullable: true, type: 'char', length: 2 }) uf: string;
  @Column({ nullable: true, length: 10 }) tipoFrete: string; // CIF, FOB
  @Column({ nullable: true, length: 15 }) modal: string; // RODOVIARIO, AEREO, MARITIMO
  @Column({ nullable: true, type: 'text' }) regioesAtendidas: string;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
  @CreateDateColumn() dataCadastro: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
}

// ============================================================
// Vendedores
// ============================================================
@Entity('vendedores')
@Index(['tenantId', 'codigoInterno'], { unique: true })
export class Vendedor {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigoInterno: string;
  @Column({ length: 150 }) nomeCompleto: string;
  @Column({ nullable: true, length: 14 }) cpf: string;
  @Column({ nullable: true, length: 150 }) email: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ nullable: true, length: 20 }) celular: string;
  @Column({ nullable: true, length: 10 }) tipoComissao: string; // PERCENTUAL, VALOR_FIXO
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) percentualComissao: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) metaMensal: number;
  @Column({ nullable: true }) filialId: string;
  @Column({ nullable: true }) supervisorId: string;
  @Column({ nullable: true }) usuarioId: string;
  @Column({ length: 15, default: 'ATIVO' }) status: string;
  @CreateDateColumn() dataCadastro: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
}

// ============================================================
// Carteira de Clientes do Vendedor
// ============================================================
@Entity('vendedores_carteira')
@Index(['tenantId', 'vendedorId', 'clienteId'], { unique: true })
export class VendedorCarteira {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() vendedorId: string;
  @Column() clienteId: string;
  @Column({ default: true }) ativo: boolean;
  @CreateDateColumn() dataVinculo: Date;
}
