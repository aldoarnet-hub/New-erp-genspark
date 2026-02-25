import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NfE, NfItem } from '../entities/nfe.entity';
import { AuditoriaFiscal } from '../entities/fiscal-complementar.entity';

/**
 * Servico de Auditoria Fiscal de Estoque
 *
 * Funcionalidades:
 * - Conciliacao estoque fisico x fiscal (entradas/saidas por NF-e)
 * - Validacao de CFOP vs movimentacao de estoque
 * - Deteccao de divergencias de quantidade e valor
 * - Geracao de alertas de auditoria para inconsistencias
 * - Suporte a inventario SPED (Bloco H)
 *
 * Legislacao: RICMS, SPED Fiscal (Bloco H), Art. 611 RIR/2018
 */
@Injectable()
export class AuditoriaEstoqueFiscalService {
  private readonly logger = new Logger(AuditoriaEstoqueFiscalService.name);

  // CFOPs de entrada que movimentam estoque
  private readonly CFOPS_ENTRADA_ESTOQUE = [
    '1101', '1102', '1111', '1113', '1116', '1117', '1118', '1120', '1121', '1122',
    '1124', '1125', '1126', '1151', '1152', '1201', '1202', '1203', '1204', '1206',
    '1207', '1208', '1209', '1251', '1252', '1253', '1254', '1255',
    '2101', '2102', '2111', '2113', '2116', '2117', '2118', '2120', '2121', '2122',
    '2124', '2125', '2126', '2151', '2152', '2201', '2202', '2203', '2204', '2206',
    '2207', '2208', '2209', '2251', '2252', '2253', '2254', '2255',
  ];

  // CFOPs de saida que movimentam estoque
  private readonly CFOPS_SAIDA_ESTOQUE = [
    '5101', '5102', '5103', '5104', '5105', '5106', '5109', '5110', '5111', '5112',
    '5113', '5114', '5115', '5116', '5117', '5118', '5119', '5120', '5122', '5123',
    '5124', '5125', '5151', '5152', '5153', '5155', '5156', '5201', '5202', '5205',
    '5206', '5207', '5208', '5209', '5210', '5251', '5252', '5253', '5254', '5255',
    '6101', '6102', '6103', '6104', '6105', '6106', '6109', '6110', '6111', '6112',
    '6113', '6114', '6115', '6116', '6117', '6118', '6119', '6120', '6122', '6123',
    '6124', '6125', '6151', '6152', '6153', '6155', '6156', '6201', '6202', '6205',
    '6206', '6207', '6208', '6209', '6210', '6251', '6252', '6253', '6254', '6255',
  ];

  constructor(
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
    @InjectRepository(NfItem)
    private readonly nfItemRepo: Repository<NfItem>,
    @InjectRepository(AuditoriaFiscal)
    private readonly auditoriaRepo: Repository<AuditoriaFiscal>,
  ) {}

  /**
   * Audita movimentacao de estoque fiscal de um periodo
   */
  async auditarEstoqueFiscal(tenantId: string, empresaId: string, params: {
    periodoInicio: Date;
    periodoFim: Date;
    produtoId?: string;
  }): Promise<{
    periodo: { inicio: Date; fim: Date };
    totalEntradas: number;
    totalSaidas: number;
    saldoMovimentacao: number;
    valorEntradas: number;
    valorSaidas: number;
    alertas: Array<{ tipo: string; severidade: string; mensagem: string; detalhes: Record<string, any> }>;
    movimentacoes: Array<{
      nfeId: string;
      chaveAcesso: string;
      cfop: string;
      tipo: string;
      dataEmissao: Date;
      produto: string;
      quantidade: number;
      valorTotal: number;
    }>;
  }> {
    this.logger.log(`Auditando estoque fiscal ${empresaId} de ${params.periodoInicio} a ${params.periodoFim}`);

    const alertas: Array<{ tipo: string; severidade: string; mensagem: string; detalhes: Record<string, any> }> = [];
    const movimentacoes: Array<any> = [];

    // 1. Buscar NF-e do periodo
    const qb = this.nfeRepo.createQueryBuilder('nfe')
      .where('nfe.tenantId = :tenantId', { tenantId })
      .andWhere('nfe.empresaId = :empresaId', { empresaId })
      .andWhere('nfe.status = :status', { status: 'autorizada' })
      .andWhere('nfe.dataEmissao BETWEEN :inicio AND :fim', {
        inicio: params.periodoInicio,
        fim: params.periodoFim,
      });

    const nfes = await qb.getMany();

    let totalEntradas = 0;
    let totalSaidas = 0;
    let valorEntradas = 0;
    let valorSaidas = 0;

    // 2. Para cada NF-e, analisar itens
    for (const nfe of nfes) {
      const itens = await this.nfItemRepo.find({ where: { tenantId, nfeId: nfe.id } });

      for (const item of itens) {
        if (params.produtoId && item.codigoProduto !== params.produtoId) continue;

        const cfop = item.cfop || '';
        const isEntrada = this.CFOPS_ENTRADA_ESTOQUE.includes(cfop);
        const isSaida = this.CFOPS_SAIDA_ESTOQUE.includes(cfop);

        if (isEntrada) {
          totalEntradas += Number(item.quantidadeComercial) || 0;
          valorEntradas += Number(item.valorTotal) || 0;
          movimentacoes.push({
            nfeId: nfe.id,
            chaveAcesso: nfe.chaveAcesso,
            cfop: item.cfop,
            tipo: 'ENTRADA',
            dataEmissao: nfe.dataEmissao,
            produto: item.descricaoProduto,
            quantidade: Number(item.quantidadeComercial),
            valorTotal: Number(item.valorTotal),
          });
        } else if (isSaida) {
          totalSaidas += Number(item.quantidadeComercial) || 0;
          valorSaidas += Number(item.valorTotal) || 0;
          movimentacoes.push({
            nfeId: nfe.id,
            chaveAcesso: nfe.chaveAcesso,
            cfop: item.cfop,
            tipo: 'SAIDA',
            dataEmissao: nfe.dataEmissao,
            produto: item.descricaoProduto,
            quantidade: Number(item.quantidadeComercial),
            valorTotal: Number(item.valorTotal),
          });
        }

        // Validacao: CFOP de entrada com tipo de operacao de saida
        if (nfe.tipoOperacao === 'S' && isEntrada) {
          alertas.push({
            tipo: 'CFOP_TIPO_DIVERGENTE',
            severidade: 'ALTA',
            mensagem: `NF-e ${nfe.numero}: CFOP ${cfop} (entrada) com tipo operacao Saida`,
            detalhes: { nfeId: nfe.id, cfop, produto: item.descricaoProduto },
          });
        }

        if (nfe.tipoOperacao === 'E' && isSaida) {
          alertas.push({
            tipo: 'CFOP_TIPO_DIVERGENTE',
            severidade: 'ALTA',
            mensagem: `NF-e ${nfe.numero}: CFOP ${cfop} (saida) com tipo operacao Entrada`,
            detalhes: { nfeId: nfe.id, cfop, produto: item.descricaoProduto },
          });
        }

        // Validacao: Quantidade zerada
        if ((Number(item.quantidadeComercial) || 0) === 0) {
          alertas.push({
            tipo: 'QUANTIDADE_ZERADA',
            severidade: 'MEDIA',
            mensagem: `Item "${item.descricaoProduto}" com quantidade zerada na NF-e ${nfe.numero}`,
            detalhes: { nfeId: nfe.id, produto: item.codigoProduto },
          });
        }

        // Validacao: Valor negativo
        if ((Number(item.valorTotal) || 0) < 0) {
          alertas.push({
            tipo: 'VALOR_NEGATIVO',
            severidade: 'CRITICA',
            mensagem: `Item "${item.descricaoProduto}" com valor negativo na NF-e ${nfe.numero}`,
            detalhes: { nfeId: nfe.id, valor: item.valorTotal },
          });
        }
      }
    }

    // 3. Verificar saldo de estoque
    const saldo = totalEntradas - totalSaidas;
    if (saldo < 0 && !params.produtoId) {
      alertas.push({
        tipo: 'SALDO_NEGATIVO',
        severidade: 'ALTA',
        mensagem: `Saldo de movimentacao negativo no periodo: ${saldo.toFixed(4)} unidades`,
        detalhes: { entradas: totalEntradas, saidas: totalSaidas, saldo },
      });
    }

    // 4. Salvar alertas no banco
    for (const alerta of alertas) {
      await this.auditoriaRepo.save(this.auditoriaRepo.create({
        tenantId,
        tipoDocumento: 'ESTOQUE',
        documentoId: empresaId,
        tipoAlerta: alerta.tipo,
        severidade: alerta.severidade,
        mensagem: alerta.mensagem,
        detalhes: alerta.detalhes,
        status: 'aberto',
      }));
    }

    return {
      periodo: { inicio: params.periodoInicio, fim: params.periodoFim },
      totalEntradas: Math.round(totalEntradas * 10000) / 10000,
      totalSaidas: Math.round(totalSaidas * 10000) / 10000,
      saldoMovimentacao: Math.round(saldo * 10000) / 10000,
      valorEntradas: Math.round(valorEntradas * 100) / 100,
      valorSaidas: Math.round(valorSaidas * 100) / 100,
      alertas,
      movimentacoes: movimentacoes.sort((a: any, b: any) =>
        new Date(a.dataEmissao).getTime() - new Date(b.dataEmissao).getTime(),
      ),
    };
  }

  /**
   * Gera dados para Bloco H do SPED Fiscal (Inventario)
   */
  async gerarInventarioSped(tenantId: string, empresaId: string, params: {
    dataInventario: Date;
    motivoInventario: string; // '01'=Final do periodo, '02'=Mudanca regime, '05'=Outros
  }): Promise<{
    registroH005: string;
    registrosH010: string[];
    registroH990: string;
  }> {
    // H005 - Totais do inventario
    const dataStr = this.formatDateSped(params.dataInventario);
    const registroH005 = `|H005|${dataStr}|0,00|${params.motivoInventario}|`;

    // H010 - Itens do inventario (placeholder - em producao, integrar com modulo de estoque)
    const registrosH010: string[] = [];

    // H990 - Encerramento do bloco H
    const totalLinhas = 2 + registrosH010.length;
    const registroH990 = `|H990|${totalLinhas}|`;

    return { registroH005, registrosH010, registroH990 };
  }

  private formatDateSped(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}${m}${y}`;
  }
}
