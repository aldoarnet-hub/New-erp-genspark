import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanoContas } from '../entities/contabil.entities';
import { TipoConta, NaturezaConta, ClasseConta } from '../enums/contabil.enums';
import { CreateContaDto, UpdateContaDto } from '../dto/contabil.dto';

interface ContaSeed {
  codigo: string;
  descricao: string;
  tipoConta: TipoConta;
  natureza: NaturezaConta;
  classe: ClasseConta;
  contaPaiCodigo: string | null;
  nivel: number;
  aceitaLancamento: boolean;
}

@Injectable()
export class PlanoContasService {
  private readonly logger = new Logger(PlanoContasService.name);

  constructor(
    @InjectRepository(PlanoContas)
    private readonly planoContasRepo: Repository<PlanoContas>,
  ) {}

  // ============================================================
  // PLANO DE CONTAS COMPLETO — MATERIAL DE CONSTRUCAO
  // ============================================================
  private readonly PLANO_CONTAS_SEED: ContaSeed[] = [
    // ============ 1 - ATIVO ============
    { codigo: '1', descricao: 'ATIVO', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: null, nivel: 1, aceitaLancamento: false },
    { codigo: '1.1', descricao: 'ATIVO CIRCULANTE', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1', nivel: 2, aceitaLancamento: false },

    // 1.1.01 - Caixa
    { codigo: '1.1.01', descricao: 'CAIXA E EQUIVALENTES', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.01.001', descricao: 'Caixa Geral', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.01.002', descricao: 'Caixa Pequeno (Fundo Fixo)', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.01', nivel: 4, aceitaLancamento: true },

    // 1.1.02 - Bancos
    { codigo: '1.1.02', descricao: 'BANCOS CONTA MOVIMENTO', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.02.001', descricao: 'Banco Conta Corrente - Principal', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.02.002', descricao: 'Banco Conta Corrente - Secundaria', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.02.003', descricao: 'Banco Conta Corrente - PIX', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.02', nivel: 4, aceitaLancamento: true },

    // 1.1.03 - Aplicacoes
    { codigo: '1.1.03', descricao: 'APLICACOES FINANCEIRAS', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.03.001', descricao: 'Aplicacoes de Liquidez Imediata', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.03', nivel: 4, aceitaLancamento: true },

    // 1.1.04 - Contas a Receber
    { codigo: '1.1.04', descricao: 'CONTAS A RECEBER', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.04.001', descricao: 'Clientes a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.002', descricao: 'Boletos a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.003', descricao: 'Cheques a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.004', descricao: 'Duplicatas a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.005', descricao: 'Adiantamento de Clientes', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.006', descricao: '(-) Provisao p/ Devedores Duvidosos', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.007', descricao: 'Crediario a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.008', descricao: 'Cartoes a Receber - Parcelados', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.009', descricao: 'Notas Promissorias a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.010', descricao: 'Antecipacao de Boletos', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.011', descricao: 'Juros e Multas a Receber', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.04.012', descricao: 'Boletos em Desconto na Carteira', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.04', nivel: 4, aceitaLancamento: true },

    // 1.1.05 - Impostos a Recuperar
    { codigo: '1.1.05', descricao: 'IMPOSTOS A RECUPERAR', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.05.001', descricao: 'ICMS a Recuperar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.05.002', descricao: 'PIS a Recuperar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.05.003', descricao: 'COFINS a Recuperar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.05.004', descricao: 'IPI a Recuperar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.05.005', descricao: 'IRRF a Recuperar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.05', nivel: 4, aceitaLancamento: true },

    // 1.1.06 - Estoques
    { codigo: '1.1.06', descricao: 'ESTOQUES', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.06.001', descricao: 'Estoque de Mercadorias', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.06', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.06.002', descricao: 'Estoque de Materiais de Embalagem', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.06', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.06.003', descricao: 'Estoque de Materiais de Uso e Consumo', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.06', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.06.004', descricao: '(-) Provisao p/ Perdas de Estoque', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.06', nivel: 4, aceitaLancamento: true },

    // 1.1.07 - Adiantamentos
    { codigo: '1.1.07', descricao: 'ADIANTAMENTOS E DESPESAS ANTECIPADAS', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.07.001', descricao: 'Adiantamento a Fornecedores', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.07', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.07.002', descricao: 'Adiantamento a Funcionarios', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.07', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.07.003', descricao: 'Seguros a Apropriar', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.07', nivel: 4, aceitaLancamento: true },

    // 1.1.09 - Aguardando Compensacao
    { codigo: '1.1.09', descricao: 'VALORES EM TRANSITO / COMPENSACAO', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.1', nivel: 3, aceitaLancamento: false },
    { codigo: '1.1.09.001', descricao: 'Aguardando Compensacao - Cartao Credito', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.09', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.09.002', descricao: 'Aguardando Compensacao - Cartao Debito', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.09', nivel: 4, aceitaLancamento: true },
    { codigo: '1.1.09.003', descricao: 'Depositos em Transito', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.1.09', nivel: 4, aceitaLancamento: true },

    // 1.2 - ATIVO NAO CIRCULANTE
    { codigo: '1.2', descricao: 'ATIVO NAO CIRCULANTE', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1', nivel: 2, aceitaLancamento: false },
    { codigo: '1.2.01', descricao: 'IMOBILIZADO', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '1.2', nivel: 3, aceitaLancamento: false },
    { codigo: '1.2.01.001', descricao: 'Imoveis', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.2.01.002', descricao: 'Veiculos', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.2.01.003', descricao: 'Maquinas e Equipamentos', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.2.01.004', descricao: 'Moveis e Utensilios', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.2.01.005', descricao: 'Equipamentos de Informatica', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '1.2.01.006', descricao: '(-) Depreciacao Acumulada', tipoConta: TipoConta.ATIVO, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '1.2.01', nivel: 4, aceitaLancamento: true },

    // ============ 2 - PASSIVO ============
    { codigo: '2', descricao: 'PASSIVO', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: null, nivel: 1, aceitaLancamento: false },
    { codigo: '2.1', descricao: 'PASSIVO CIRCULANTE', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2', nivel: 2, aceitaLancamento: false },

    // 2.1.01 - Fornecedores
    { codigo: '2.1.01', descricao: 'FORNECEDORES', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.01.001', descricao: 'Fornecedores Nacionais', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.01.002', descricao: 'Fornecedores - Frete e Transporte', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.01', nivel: 4, aceitaLancamento: true },

    // 2.1.02 - Emprestimos e Financiamentos
    { codigo: '2.1.02', descricao: 'EMPRESTIMOS E FINANCIAMENTOS', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.02.001', descricao: 'Emprestimos Bancarios CP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.02.002', descricao: 'Financiamentos CP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.02.003', descricao: 'Cheque Especial', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.02', nivel: 4, aceitaLancamento: true },

    // 2.1.03 - Obrigacoes Trabalhistas
    { codigo: '2.1.03', descricao: 'OBRIGACOES TRABALHISTAS', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.03.001', descricao: 'Salarios a Pagar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.03.002', descricao: 'FGTS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.03.003', descricao: 'INSS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.03.004', descricao: 'Ferias e 13o a Pagar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.03.005', descricao: 'IRRF s/ Folha a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.03.006', descricao: 'Vale Transporte a Descontar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.03', nivel: 4, aceitaLancamento: true },

    // 2.1.04 - Obrigacoes Tributarias
    { codigo: '2.1.04', descricao: 'OBRIGACOES TRIBUTARIAS', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.04.001', descricao: 'ICMS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.002', descricao: 'PIS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.003', descricao: 'COFINS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.004', descricao: 'IPI a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.005', descricao: 'ISS a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.006', descricao: 'IRPJ a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.007', descricao: 'CSLL a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.008', descricao: 'DAS Simples Nacional a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.009', descricao: 'ICMS-ST a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.04.010', descricao: 'DIFAL a Recolher', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.04', nivel: 4, aceitaLancamento: true },

    // 2.1.05 - Outras Obrigacoes
    { codigo: '2.1.05', descricao: 'OUTRAS OBRIGACOES CP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.05.001', descricao: 'Contas a Pagar Diversas', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.05.002', descricao: 'Adiantamento de Clientes', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.05', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.05.003', descricao: 'Alugueis a Pagar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.05', nivel: 4, aceitaLancamento: true },

    // 2.1.06 - Vales e Creditos Clientes
    { codigo: '2.1.06', descricao: 'VALES E CREDITOS A CLIENTES', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.06.001', descricao: 'Vales Emitidos - Troca/Devolucao', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.06', nivel: 4, aceitaLancamento: true },
    { codigo: '2.1.06.002', descricao: 'Vales a Utilizar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.06', nivel: 4, aceitaLancamento: true },

    // 2.1.07 - Boletos Devolvidos
    { codigo: '2.1.07', descricao: 'BOLETOS E TITULOS DEVOLVIDOS', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.1', nivel: 3, aceitaLancamento: false },
    { codigo: '2.1.07.001', descricao: 'Boletos Devolvidos a Tratar', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.1.07', nivel: 4, aceitaLancamento: true },

    // 2.2 - PASSIVO NAO CIRCULANTE
    { codigo: '2.2', descricao: 'PASSIVO NAO CIRCULANTE', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2', nivel: 2, aceitaLancamento: false },
    { codigo: '2.2.01', descricao: 'EMPRESTIMOS E FINANCIAMENTOS LP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.2', nivel: 3, aceitaLancamento: false },
    { codigo: '2.2.01.001', descricao: 'Emprestimos Bancarios LP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '2.2.01.002', descricao: 'Financiamentos LP', tipoConta: TipoConta.PASSIVO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.2.01', nivel: 4, aceitaLancamento: true },

    // 2.3 - PATRIMONIO LIQUIDO
    { codigo: '2.3', descricao: 'PATRIMONIO LIQUIDO', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2', nivel: 2, aceitaLancamento: false },
    { codigo: '2.3.01', descricao: 'CAPITAL SOCIAL', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.3', nivel: 3, aceitaLancamento: false },
    { codigo: '2.3.01.001', descricao: 'Capital Social Subscrito', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '2.3.01.002', descricao: '(-) Capital Social a Integralizar', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '2.3.02', descricao: 'RESERVAS E LUCROS', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '2.3', nivel: 3, aceitaLancamento: false },
    { codigo: '2.3.02.001', descricao: 'Lucros Acumulados', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.3.02', nivel: 4, aceitaLancamento: true },
    { codigo: '2.3.02.002', descricao: 'Prejuizos Acumulados', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.3.02', nivel: 4, aceitaLancamento: true },
    { codigo: '2.3.02.003', descricao: 'Reserva Legal', tipoConta: TipoConta.PATRIMONIO_LIQUIDO, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '2.3.02', nivel: 4, aceitaLancamento: true },

    // ============ 3 - RECEITAS ============
    { codigo: '3', descricao: 'RECEITAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: null, nivel: 1, aceitaLancamento: false },
    { codigo: '3.1', descricao: 'RECEITA OPERACIONAL', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3', nivel: 2, aceitaLancamento: false },

    // 3.1.01 - Receita de Vendas
    { codigo: '3.1.01', descricao: 'RECEITA BRUTA DE VENDAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.1', nivel: 3, aceitaLancamento: false },
    { codigo: '3.1.01.001', descricao: 'Vendas a Vista (Dinheiro)', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.002', descricao: 'Vendas a Prazo', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.003', descricao: 'Vendas Cartao de Credito', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.004', descricao: 'Vendas Cartao de Debito', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.005', descricao: 'Vendas PIX', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.006', descricao: 'Vendas Boleto', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.007', descricao: 'Vendas Cheque', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.008', descricao: 'Vendas Crediario', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.01.009', descricao: 'Vendas com Vale / Credito', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.01', nivel: 4, aceitaLancamento: true },

    // 3.1.02 - Deducoes de Vendas
    { codigo: '3.1.02', descricao: 'DEDUCOES DE VENDAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.1', nivel: 3, aceitaLancamento: false },
    { codigo: '3.1.02.001', descricao: '(-) Devolucoes de Vendas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.02.002', descricao: '(-) Abatimentos sobre Vendas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.02.003', descricao: '(-) Impostos sobre Vendas (ICMS)', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.02.004', descricao: '(-) PIS sobre Vendas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.1.02.005', descricao: '(-) COFINS sobre Vendas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.1.02', nivel: 4, aceitaLancamento: true },

    // 3.2 - CMV
    { codigo: '3.2', descricao: 'CUSTO DAS MERCADORIAS VENDIDAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3', nivel: 2, aceitaLancamento: false },
    { codigo: '3.2.01', descricao: 'CMV', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.2', nivel: 3, aceitaLancamento: false },
    { codigo: '3.2.01.001', descricao: 'CMV - Mercadorias', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.2.01', nivel: 4, aceitaLancamento: true },

    // 3.3 - Receitas de Servicos
    { codigo: '3.3', descricao: 'RECEITA DE SERVICOS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3', nivel: 2, aceitaLancamento: false },
    { codigo: '3.3.01', descricao: 'SERVICOS PRESTADOS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.3', nivel: 3, aceitaLancamento: false },
    { codigo: '3.3.01.001', descricao: 'Servico de Corte e Preparacao', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.3.01.002', descricao: 'Servico de Entrega/Frete', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.3.01', nivel: 4, aceitaLancamento: true },

    // 3.4 - Receitas Financeiras
    { codigo: '3.4', descricao: 'RECEITAS FINANCEIRAS E OUTRAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3', nivel: 2, aceitaLancamento: false },
    { codigo: '3.4.01', descricao: 'RECEITAS FINANCEIRAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.4', nivel: 3, aceitaLancamento: false },
    { codigo: '3.4.01.001', descricao: 'Juros Ativos', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.01.002', descricao: 'Descontos Obtidos', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.01.003', descricao: 'Rendimentos de Aplicacoes', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.01.004', descricao: 'Multas e Juros Recebidos', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.02', descricao: 'OUTRAS RECEITAS', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '3.4', nivel: 3, aceitaLancamento: false },
    { codigo: '3.4.02.001', descricao: 'Receitas Diversas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.02.002', descricao: 'Venda de Ativo Imobilizado', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.02.003', descricao: 'Bonificacoes Recebidas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.02.004', descricao: 'Recuperacao de Despesas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.02', nivel: 4, aceitaLancamento: true },
    { codigo: '3.4.02.005', descricao: 'Cobrancas Recuperadas', tipoConta: TipoConta.RECEITA, natureza: NaturezaConta.CREDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '3.4.02', nivel: 4, aceitaLancamento: true },

    // ============ 4 - CUSTOS ============
    { codigo: '4', descricao: 'CUSTOS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: null, nivel: 1, aceitaLancamento: false },
    { codigo: '4.1', descricao: 'CUSTO OPERACIONAL', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '4', nivel: 2, aceitaLancamento: false },
    { codigo: '4.1.01', descricao: 'CUSTOS DE MERCADORIAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '4.1', nivel: 3, aceitaLancamento: false },
    { codigo: '4.1.01.001', descricao: 'Custo de Aquisicao de Mercadorias', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '4.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '4.1.01.002', descricao: 'Frete sobre Compras', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '4.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '4.1.01.003', descricao: 'Seguro sobre Compras', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '4.1.01', nivel: 4, aceitaLancamento: true },

    // ============ 5 - DESPESAS ============
    { codigo: '5', descricao: 'DESPESAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: null, nivel: 1, aceitaLancamento: false },
    { codigo: '5.1', descricao: 'DESPESAS COM PESSOAL', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5', nivel: 2, aceitaLancamento: false },
    { codigo: '5.1.01', descricao: 'FOLHA DE PAGAMENTO', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.1', nivel: 3, aceitaLancamento: false },
    { codigo: '5.1.01.001', descricao: 'Salarios e Ordenados', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.002', descricao: 'Horas Extras', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.003', descricao: 'Comissoes sobre Vendas', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.004', descricao: 'FGTS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.005', descricao: 'INSS Patronal', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.006', descricao: 'Ferias e 13o Salario', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.007', descricao: 'Vale Transporte', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.008', descricao: 'Vale Alimentacao/Refeicao', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.1.01.009', descricao: 'Plano de Saude', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.1.01', nivel: 4, aceitaLancamento: true },

    // 5.2 - Despesas Operacionais
    { codigo: '5.2', descricao: 'DESPESAS OPERACIONAIS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5', nivel: 2, aceitaLancamento: false },
    { codigo: '5.2.01', descricao: 'DESPESAS ADMINISTRATIVAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.2', nivel: 3, aceitaLancamento: false },
    { codigo: '5.2.01.001', descricao: 'Aluguel', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.002', descricao: 'Energia Eletrica', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.003', descricao: 'Agua e Esgoto', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.004', descricao: 'Telefone e Internet', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.005', descricao: 'Material de Escritorio', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.006', descricao: 'Material de Limpeza', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.007', descricao: 'Manutencao e Reparos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.008', descricao: 'Seguro do Imovel', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.009', descricao: 'Sistemas e Software (SaaS)', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.010', descricao: 'Honorarios Contabeis', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.011', descricao: 'Honorarios Advocaticios', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.01.012', descricao: 'Depreciacao', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.01', nivel: 4, aceitaLancamento: true },

    // 5.2.02 - Despesas Comerciais
    { codigo: '5.2.02', descricao: 'DESPESAS COMERCIAIS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.2', nivel: 3, aceitaLancamento: false },
    { codigo: '5.2.02.001', descricao: 'Propaganda e Marketing', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.02', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.02.002', descricao: 'Frete sobre Vendas', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.02', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.02.003', descricao: 'Embalagens para Venda', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.02', nivel: 4, aceitaLancamento: true },

    // 5.2.03 - Perdas e Descontos
    { codigo: '5.2.03', descricao: 'PERDAS E DESCONTOS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.2', nivel: 3, aceitaLancamento: false },
    { codigo: '5.2.03.001', descricao: 'Perdas de Estoque', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.03.002', descricao: 'Descontos Concedidos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.03.003', descricao: 'Devolucoes de Vendas', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.2.03.004', descricao: 'Perdas em Cobrancas', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.2.03', nivel: 4, aceitaLancamento: true },

    // 5.3 - Despesas Financeiras
    { codigo: '5.3', descricao: 'DESPESAS FINANCEIRAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5', nivel: 2, aceitaLancamento: false },
    { codigo: '5.3.01', descricao: 'TARIFAS BANCARIAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.3', nivel: 3, aceitaLancamento: false },
    { codigo: '5.3.01.001', descricao: 'Tarifa de Manutencao de Conta', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.01.002', descricao: 'Tarifa DOC/TED/PIX', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.01.003', descricao: 'Tarifa de Boleto Bancario', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.01.004', descricao: 'Tarifa de Cobranca', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.01', nivel: 4, aceitaLancamento: true },

    // 5.3.02 - Taxas Operadoras
    { codigo: '5.3.02', descricao: 'TAXAS DE OPERADORAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.3', nivel: 3, aceitaLancamento: false },
    { codigo: '5.3.02.001', descricao: 'Taxa Operadora Cartao de Credito', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.02', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.02.002', descricao: 'Taxa Operadora Cartao de Debito', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.02', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.02.003', descricao: 'Taxa PIX Empresarial', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.02', nivel: 4, aceitaLancamento: true },

    // 5.3.03 - Juros
    { codigo: '5.3.03', descricao: 'JUROS E ENCARGOS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.3', nivel: 3, aceitaLancamento: false },
    { codigo: '5.3.03.001', descricao: 'Juros sobre Emprestimos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.03.002', descricao: 'Juros sobre Financiamentos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.03.003', descricao: 'Juros sobre Cheque Especial', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.03', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.03.004', descricao: 'Multas e Juros Pagos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.03', nivel: 4, aceitaLancamento: true },

    // 5.3.04 - Custos de Antecipacao
    { codigo: '5.3.04', descricao: 'CUSTOS DE ANTECIPACAO E DESCONTO', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.3', nivel: 3, aceitaLancamento: false },
    { codigo: '5.3.04.001', descricao: 'Custo Antecipacao de Cartao', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.04.002', descricao: 'Custo Antecipacao de Boleto', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.04.003', descricao: 'Custo Factoring/Cessao', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.04.004', descricao: 'Custo Desconto de Boleto', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.04.005', descricao: 'Despesas com Protestos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },
    { codigo: '5.3.04.006', descricao: 'IOF sobre Emprestimos', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.3.04', nivel: 4, aceitaLancamento: true },

    // 5.4 - Despesas Tributarias
    { codigo: '5.4', descricao: 'DESPESAS TRIBUTARIAS', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5', nivel: 2, aceitaLancamento: false },
    { codigo: '5.4.01', descricao: 'IMPOSTOS E CONTRIBUICOES', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.SINTETICA, contaPaiCodigo: '5.4', nivel: 3, aceitaLancamento: false },
    { codigo: '5.4.01.001', descricao: 'IPTU', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.4.01.002', descricao: 'IPVA', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.4.01.003', descricao: 'Taxa de Licenca/Funcionamento', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.4.01', nivel: 4, aceitaLancamento: true },
    { codigo: '5.4.01.004', descricao: 'Contribuicao Sindical', tipoConta: TipoConta.DESPESA, natureza: NaturezaConta.DEVEDORA, classe: ClasseConta.ANALITICA, contaPaiCodigo: '5.4.01', nivel: 4, aceitaLancamento: true },
  ];

  // ============================================================
  // METODOS PUBLICOS
  // ============================================================

  async inicializarPlanoContas(tenantId: string): Promise<{ criadas: number; existentes: number }> {
    this.logger.log(`Inicializando plano de contas para tenant ${tenantId}`);
    let criadas = 0;
    let existentes = 0;

    for (const seed of this.PLANO_CONTAS_SEED) {
      const existe = await this.planoContasRepo.findOne({
        where: { tenantId, codigo: seed.codigo },
      });

      if (existe) {
        existentes++;
        continue;
      }

      const conta = this.planoContasRepo.create({
        tenantId,
        ...seed,
      });
      await this.planoContasRepo.save(conta);
      criadas++;
    }

    this.logger.log(`Plano de contas: ${criadas} criadas, ${existentes} ja existentes`);
    return { criadas, existentes };
  }

  async listarContas(
    tenantId: string,
    filtros?: { tipoConta?: string; classe?: string; nivel?: number; ativo?: boolean },
  ): Promise<PlanoContas[]> {
    const qb = this.planoContasRepo
      .createQueryBuilder('c')
      .where('c.tenantId = :tenantId', { tenantId })
      .orderBy('c.codigo', 'ASC');

    if (filtros?.tipoConta) qb.andWhere('c.tipoConta = :tipo', { tipo: filtros.tipoConta });
    if (filtros?.classe) qb.andWhere('c.classe = :classe', { classe: filtros.classe });
    if (filtros?.nivel) qb.andWhere('c.nivel = :nivel', { nivel: filtros.nivel });
    if (filtros?.ativo !== undefined) qb.andWhere('c.ativo = :ativo', { ativo: filtros.ativo });

    return qb.getMany();
  }

  async buscarContaPorCodigo(tenantId: string, codigo: string): Promise<PlanoContas> {
    const conta = await this.planoContasRepo.findOne({ where: { tenantId, codigo } });
    if (!conta) {
      throw new NotFoundException(`Conta ${codigo} nao encontrada`);
    }
    return conta;
  }

  async criarConta(tenantId: string, dto: CreateContaDto): Promise<PlanoContas> {
    const existe = await this.planoContasRepo.findOne({
      where: { tenantId, codigo: dto.codigo },
    });
    if (existe) {
      throw new ConflictException(`Conta ${dto.codigo} ja existe`);
    }

    const conta = this.planoContasRepo.create({
      tenantId,
      codigo: dto.codigo,
      descricao: dto.descricao,
      tipoConta: dto.tipoConta as TipoConta,
      natureza: dto.natureza as NaturezaConta,
      classe: dto.classe as ClasseConta,
      contaPaiCodigo: dto.contaPaiCodigo || null,
      nivel: dto.nivel || this.calcularNivel(dto.codigo),
      aceitaLancamento: dto.classe === ClasseConta.ANALITICA,
      codigoSped: dto.codigoSped || null,
      codigoDre: dto.codigoDre || null,
    });

    return this.planoContasRepo.save(conta);
  }

  async atualizarConta(tenantId: string, codigo: string, dto: UpdateContaDto): Promise<PlanoContas> {
    const conta = await this.buscarContaPorCodigo(tenantId, codigo);
    Object.assign(conta, dto);
    return this.planoContasRepo.save(conta);
  }

  async obterArvoreContas(tenantId: string): Promise<any[]> {
    const contas = await this.listarContas(tenantId, { ativo: true });
    return this.montarArvore(contas);
  }

  async contarContas(tenantId: string): Promise<{ total: number; analiticas: number; sinteticas: number }> {
    const total = await this.planoContasRepo.count({ where: { tenantId, ativo: true } });
    const analiticas = await this.planoContasRepo.count({
      where: { tenantId, ativo: true, classe: ClasseConta.ANALITICA },
    });
    return { total, analiticas, sinteticas: total - analiticas };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private calcularNivel(codigo: string): number {
    return codigo.split('.').length;
  }

  private montarArvore(contas: PlanoContas[]): any[] {
    const mapa = new Map<string | null, any[]>();

    for (const conta of contas) {
      const pai = conta.contaPaiCodigo || '__root__';
      if (!mapa.has(pai)) mapa.set(pai, []);
      mapa.get(pai)!.push({
        ...conta,
        filhos: [],
      });
    }

    function adicionarFilhos(nodo: any) {
      const filhos = mapa.get(nodo.codigo) || [];
      nodo.filhos = filhos;
      filhos.forEach(adicionarFilhos);
    }

    const raizes = mapa.get('__root__') || [];
    raizes.forEach(adicionarFilhos);
    return raizes;
  }
}
