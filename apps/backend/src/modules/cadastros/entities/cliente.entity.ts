import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

// ============================================================
// Cliente Principal
// ============================================================
@Entity('clientes')
@Index(['tenantId'])
@Index(['tenantId', 'codigoInterno'], { unique: true })
@Index(['tenantId', 'cpfCnpjLimpo'], { unique: true })
@Index(['status'])
export class Cliente {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column({ length: 20 }) codigoInterno: string;

  // Documentos
  @Column({ length: 2 }) tipoPessoa: string; // PF ou PJ
  @Column({ length: 18 }) cpfCnpj: string;
  @Column({ length: 14 }) cpfCnpjLimpo: string;
  @Column({ nullable: true, length: 20 }) rgIe: string;
  @Column({ nullable: true, length: 20 }) im: string;

  // Nomes
  @Column({ nullable: true, length: 150 }) razaoSocial: string;
  @Column({ nullable: true, length: 100 }) nomeFantasia: string;
  @Column({ nullable: true, length: 150 }) nomeCompleto: string;
  @Column({ nullable: true, length: 50 }) apelido: string;

  // PF
  @Column({ type: 'date', nullable: true }) dataNascimento: Date;
  @Column({ nullable: true, type: 'char', length: 1 }) sexo: string;
  @Column({ nullable: true, length: 15 }) estadoCivil: string;
  @Column({ nullable: true, length: 50 }) profissao: string;

  // PJ
  @Column({ type: 'date', nullable: true }) dataFundacao: Date;
  @Column({ nullable: true, length: 10 }) cnae: string;
  @Column({ nullable: true, length: 200 }) cnaeDescricao: string;
  @Column({ nullable: true, length: 20 }) regimeTributario: string;
  @Column({ nullable: true, length: 100 }) responsavelLegal: string;

  // Contato principal
  @Column({ nullable: true, length: 150 }) email: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ nullable: true, length: 20 }) celular: string;
  @Column({ nullable: true, length: 200 }) site: string;

  // Endereco principal
  @Column({ nullable: true, length: 9 }) cep: string;
  @Column({ nullable: true, length: 150 }) endereco: string;
  @Column({ nullable: true, length: 20 }) numero: string;
  @Column({ nullable: true, length: 50 }) complemento: string;
  @Column({ nullable: true, length: 50 }) bairro: string;
  @Column({ nullable: true, length: 50 }) cidade: string;
  @Column({ nullable: true, type: 'char', length: 2 }) uf: string;
  @Column({ nullable: true, length: 7 }) codigoIbge: string;

  // Classificacao comercial
  @Column({ nullable: true, length: 30 }) tipoCliente: string; // CONSUMIDOR, CONSTRUTORA, REVENDEDOR, etc.
  @Column({ nullable: true, length: 30 }) segmento: string;
  @Column({ nullable: true, length: 15 }) porte: string; // MICRO, PEQUENO, MEDIO, GRANDE
  @Column({ nullable: true, type: 'char', length: 1 }) curvaAbc: string;

  // Condicoes comerciais
  @Column({ nullable: true }) tabelaPrecoId: string;
  @Column({ nullable: true }) formaPagamentoId: string;
  @Column({ nullable: true }) condicaoPagamentoId: string;
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 }) descontoMaximo: number;

  // Credito
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) limiteCredito: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) limiteUtilizado: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) limiteDisponivel: number;
  @Column({ nullable: true, type: 'int' }) scoreInterno: number;
  @Column({ nullable: true, length: 10 }) risco: string; // BAIXO, MEDIO, ALTO, CRITICO

  // Historico
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) ticketMedio: number;
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 }) totalCompras: number;
  @Column({ type: 'int', default: 0 }) quantidadeCompras: number;
  @Column({ type: 'date', nullable: true }) ultimaCompraData: Date;
  @Column({ type: 'int', default: 0 }) titulosEmAberto: number;
  @Column({ type: 'int', default: 0 }) titulosVencidos: number;

  // Vendedor
  @Column({ nullable: true }) vendedorId: string;

  // Status
  @Column({ length: 15, default: 'ATIVO' }) status: string;
  @Column({ default: false }) bloqueado: boolean;
  @Column({ nullable: true, type: 'text' }) motivoBloqueio: string;

  // Observacoes
  @Column({ nullable: true, type: 'text' }) observacoes: string;
  @Column({ nullable: true, type: 'text' }) observacoesInternas: string;

  @CreateDateColumn() dataCadastro: Date;
  @UpdateDateColumn() dataAtualizacao: Date;
  @Column({ nullable: true }) criadoPor: string;
  @Column({ nullable: true }) atualizadoPor: string;
}

// ============================================================
// Enderecos do Cliente
// ============================================================
@Entity('clientes_enderecos')
@Index(['tenantId', 'clienteId'])
export class ClienteEndereco {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() clienteId: string;
  @Column({ length: 20 }) tipoEndereco: string; // ENTREGA, COBRANCA, CORRESPONDENCIA, OBRA
  @Column({ default: false }) enderecoPrincipal: boolean;
  @Column({ length: 9 }) cep: string;
  @Column({ length: 150 }) endereco: string;
  @Column({ length: 20 }) numero: string;
  @Column({ nullable: true, length: 50 }) complemento: string;
  @Column({ length: 50 }) bairro: string;
  @Column({ length: 50 }) cidade: string;
  @Column({ type: 'char', length: 2 }) uf: string;
  @Column({ nullable: true, length: 7 }) codigoIbge: string;
  @Column({ nullable: true, length: 100 }) pontoReferencia: string;
  @Column({ nullable: true, length: 100 }) nomeContato: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Contatos do Cliente
// ============================================================
@Entity('clientes_contatos')
@Index(['tenantId', 'clienteId'])
export class ClienteContato {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() clienteId: string;
  @Column({ length: 100 }) nome: string;
  @Column({ nullable: true, length: 50 }) cargo: string;
  @Column({ nullable: true, length: 50 }) departamento: string;
  @Column({ nullable: true, length: 150 }) email: string;
  @Column({ nullable: true, length: 20 }) telefone: string;
  @Column({ nullable: true, length: 20 }) celular: string;
  @Column({ default: false }) contatoPrincipal: boolean;
  @Column({ default: true }) recebeNfe: boolean;
  @Column({ default: false }) recebeCobranca: boolean;
  @Column({ default: true }) ativo: boolean;
}

// ============================================================
// Limites de Credito / Analise
// ============================================================
@Entity('clientes_limites')
@Index(['tenantId', 'clienteId'])
export class ClienteLimite {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() tenantId: string;
  @Column() clienteId: string;
  @CreateDateColumn() dataAnalise: Date;
  @Column({ length: 30 }) tipoAnalise: string; // ABERTURA, REVISAO, AUMENTO, REDUCAO
  @Column({ type: 'decimal', precision: 15, scale: 2 }) limiteAnterior: number;
  @Column({ type: 'decimal', precision: 15, scale: 2 }) limiteAprovado: number;
  @Column({ nullable: true, type: 'int' }) scoreSpc: number;
  @Column({ nullable: true, type: 'int' }) scoreSerasa: number;
  @Column({ nullable: true, length: 10 }) statusSpc: string; // LIMPO, RESTRITO
  @Column({ nullable: true, length: 10 }) statusSerasa: string;
  @Column({ nullable: true, type: 'text' }) parecer: string;
  @Column({ nullable: true }) aprovadoPor: string;
  @Column({ nullable: true, type: 'date' }) validadeAnalise: Date;
}
