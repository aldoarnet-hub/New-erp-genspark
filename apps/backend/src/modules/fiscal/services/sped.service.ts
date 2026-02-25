import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpedRegistro } from '../entities/fiscal-complementar.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import * as crypto from 'crypto';

/**
 * Geracao do SPED Fiscal (EFD ICMS/IPI) e SPED Contribuicoes (EFD PIS/COFINS)
 * Blocos: 0, C, D, E, G, H, K, 1, 9
 */
@Injectable()
export class SpedService {
  private readonly logger = new Logger(SpedService.name);
  private readonly VERSAO_FISCAL = '019';
  private readonly VERSAO_CONTRIBUICOES = '006';

  constructor(
    @InjectRepository(SpedRegistro)
    private readonly spedRepo: Repository<SpedRegistro>,
    @InjectRepository(EmpresaFiscal)
    private readonly empresaRepo: Repository<EmpresaFiscal>,
  ) {}

  /**
   * Gera arquivo SPED Fiscal (EFD ICMS/IPI)
   */
  async gerarSpedFiscal(
    tenantId: string, empresaId: string,
    periodoAno: number, periodoMes: number,
  ): Promise<SpedRegistro> {
    this.logger.log(`Gerando SPED Fiscal ${periodoAno}/${periodoMes} empresa=${empresaId}`);

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const dataInicio = new Date(periodoAno, periodoMes - 1, 1);
    const dataFim = new Date(periodoAno, periodoMes, 0);

    const linhas: string[] = [];

    // Bloco 0 - Abertura e Identificacao
    linhas.push(...this.gerarBloco0Fiscal(empresa, dataInicio, dataFim));

    // Bloco C - Documentos Fiscais I (NF-e, NFC-e)
    linhas.push(...this.gerarBlocoCFiscal(tenantId, empresaId, dataInicio, dataFim));

    // Bloco D - Documentos Fiscais II (Servicos)
    linhas.push(this.reg('D001', '1')); // Sem dados
    linhas.push(this.reg('D990', String(2)));

    // Bloco E - Apuracao ICMS/IPI
    linhas.push(...this.gerarBlocoEFiscal(tenantId, empresaId, dataInicio, dataFim));

    // Bloco G - CIAP
    linhas.push(this.reg('G001', '1'));
    linhas.push(this.reg('G990', String(2)));

    // Bloco H - Inventario
    linhas.push(this.reg('H001', '1'));
    linhas.push(this.reg('H990', String(2)));

    // Bloco K - Producao e Estoque
    linhas.push(this.reg('K001', '1'));
    linhas.push(this.reg('K990', String(2)));

    // Bloco 1 - Outras Informacoes
    linhas.push(this.reg('1001', '1'));
    linhas.push(this.reg('1990', String(2)));

    // Bloco 9 - Encerramento
    linhas.push(...this.gerarBloco9(linhas));

    const conteudo = linhas.join('\r\n');
    const hash = crypto.createHash('sha256').update(conteudo).digest('hex');

    // Salvar registro
    const sped = this.spedRepo.create({
      tenantId,
      empresaId,
      tipoSped: 'fiscal',
      periodoAno,
      periodoMes,
      nomeArquivo: `SPED_FISCAL_${periodoAno}${String(periodoMes).padStart(2, '0')}.txt`,
      conteudoArquivo: conteudo,
      hashArquivo: hash,
      status: 'gerado',
    });

    return this.spedRepo.save(sped);
  }

  /**
   * Gera arquivo SPED Contribuicoes (EFD PIS/COFINS)
   */
  async gerarSpedContribuicoes(
    tenantId: string, empresaId: string,
    periodoAno: number, periodoMes: number,
  ): Promise<SpedRegistro> {
    this.logger.log(`Gerando SPED Contribuicoes ${periodoAno}/${periodoMes}`);

    const empresa = await this.empresaRepo.findOne({ where: { tenantId, empresaId } });
    if (!empresa) throw new Error('Empresa fiscal nao encontrada');

    const dataInicio = new Date(periodoAno, periodoMes - 1, 1);
    const dataFim = new Date(periodoAno, periodoMes, 0);

    const linhas: string[] = [];

    // Bloco 0
    linhas.push(this.reg('0000', this.VERSAO_CONTRIBUICOES, '0',
      this.formatDate(dataInicio), this.formatDate(dataFim),
      empresa.razaoSocial, empresa.cnpj, '',
      empresa.enderecoUf, empresa.inscricaoEstadual || '',
      empresa.enderecoCodigoMunicipio, empresa.inscricaoMunicipal || '',
      '', '1', // ind_nat_pj, ind_ativ
    ));
    linhas.push(this.reg('0001', '0'));
    linhas.push(this.reg('0990', String(3)));

    // Bloco A - Servicos (ISS)
    linhas.push(this.reg('A001', '1'));
    linhas.push(this.reg('A990', String(2)));

    // Bloco C - Mercadorias (simplificado)
    linhas.push(this.reg('C001', '0'));
    linhas.push(this.reg('C990', String(2)));

    // Bloco D - Servicos ICMS
    linhas.push(this.reg('D001', '1'));
    linhas.push(this.reg('D990', String(2)));

    // Bloco F - Demais Documentos
    linhas.push(this.reg('F001', '1'));
    linhas.push(this.reg('F990', String(2)));

    // Bloco M - Apuracao PIS/COFINS
    linhas.push(...this.gerarBlocoMContribuicoes(tenantId, empresaId, dataInicio, dataFim));

    // Bloco 1
    linhas.push(this.reg('1001', '1'));
    linhas.push(this.reg('1990', String(2)));

    // Bloco 9
    linhas.push(...this.gerarBloco9(linhas));

    const conteudo = linhas.join('\r\n');
    const hash = crypto.createHash('sha256').update(conteudo).digest('hex');

    const sped = this.spedRepo.create({
      tenantId,
      empresaId,
      tipoSped: 'contribuicoes',
      periodoAno,
      periodoMes,
      nomeArquivo: `SPED_CONTRIB_${periodoAno}${String(periodoMes).padStart(2, '0')}.txt`,
      conteudoArquivo: conteudo,
      hashArquivo: hash,
      status: 'gerado',
    });

    return this.spedRepo.save(sped);
  }

  /**
   * Lista registros SPED
   */
  async listarSped(tenantId: string, filtros: {
    empresaId?: string; tipoSped?: string;
    periodoAno?: number; periodoMes?: number;
    page?: number; limit?: number;
  }): Promise<{ data: SpedRegistro[]; total: number }> {
    const qb = this.spedRepo.createQueryBuilder('s')
      .where('s.tenantId = :tenantId', { tenantId });

    if (filtros.empresaId) qb.andWhere('s.empresaId = :empresaId', { empresaId: filtros.empresaId });
    if (filtros.tipoSped) qb.andWhere('s.tipoSped = :tipoSped', { tipoSped: filtros.tipoSped });
    if (filtros.periodoAno) qb.andWhere('s.periodoAno = :periodoAno', { periodoAno: filtros.periodoAno });
    if (filtros.periodoMes) qb.andWhere('s.periodoMes = :periodoMes', { periodoMes: filtros.periodoMes });

    qb.orderBy('s.criadoEm', 'DESC')
      .skip(((filtros.page || 1) - 1) * (filtros.limit || 20))
      .take(Math.min(filtros.limit || 20, 100));

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Valida arquivo SPED (verificacao basica de estrutura)
   */
  async validarSped(spedId: string): Promise<{ valido: boolean; erros: string[] }> {
    const sped = await this.spedRepo.findOne({ where: { id: spedId } });
    if (!sped || !sped.conteudoArquivo) {
      return { valido: false, erros: ['Registro SPED nao encontrado ou sem conteudo'] };
    }

    const erros: string[] = [];
    const linhas = sped.conteudoArquivo.split('\r\n').filter(l => l.trim());

    if (linhas.length < 4) {
      erros.push('Arquivo com menos de 4 linhas (minimo: 0000, 0001, 0990, 9999)');
    }

    // Verificar registro 0000 (abertura)
    if (!linhas[0]?.startsWith('|0000|')) {
      erros.push('Primeiro registro deve ser 0000 (Abertura)');
    }

    // Verificar registro 9999 (encerramento)
    if (!linhas[linhas.length - 1]?.startsWith('|9999|')) {
      erros.push('Ultimo registro deve ser 9999 (Encerramento)');
    }

    const valido = erros.length === 0;
    sped.status = valido ? 'validado' : 'rejeitado';
    sped.errosValidacao = erros.length > 0 ? erros.join('; ') : undefined;
    await this.spedRepo.save(sped);

    return { valido, erros };
  }

  // ============================================================
  // Geradores de blocos
  // ============================================================

  private gerarBloco0Fiscal(empresa: EmpresaFiscal, dataInicio: Date, dataFim: Date): string[] {
    const linhas: string[] = [];

    // 0000 - Abertura
    linhas.push(this.reg('0000', this.VERSAO_FISCAL, '0',
      this.formatDate(dataInicio), this.formatDate(dataFim),
      empresa.razaoSocial, empresa.cnpj, '',
      empresa.enderecoUf, empresa.inscricaoEstadual || '',
      empresa.enderecoCodigoMunicipio, empresa.inscricaoMunicipal || '',
      empresa.inscricaoSuframa || '',
      empresa.spedCodigoPerfil || 'A',
      empresa.spedIndAtividade || '1',
    ));

    // 0001 - Abertura do bloco 0
    linhas.push(this.reg('0001', '0'));

    // 0005 - Dados complementares
    linhas.push(this.reg('0005',
      (empresa.nomeFantasia || empresa.razaoSocial).substring(0, 60),
      empresa.enderecoCep, empresa.enderecoLogradouro,
      empresa.enderecoNumero, empresa.enderecoComplemento || '',
      empresa.enderecoBairro,
      (empresa.telefoneDdd || '') + (empresa.telefoneNumero || ''),
      '', empresa.email || '',
    ));

    // 0990 - Encerramento do bloco 0
    linhas.push(this.reg('0990', String(linhas.length + 1)));

    return linhas;
  }

  private gerarBlocoCFiscal(
    _tenantId: string, _empresaId: string, _dataInicio: Date, _dataFim: Date,
  ): string[] {
    const linhas: string[] = [];
    linhas.push(this.reg('C001', '0')); // Bloco com dados
    // Em producao: buscar NF-e do periodo e gerar registros C100, C170, C190
    linhas.push(this.reg('C990', String(linhas.length + 1)));
    return linhas;
  }

  private gerarBlocoEFiscal(
    _tenantId: string, _empresaId: string, dataInicio: Date, dataFim: Date,
  ): string[] {
    const linhas: string[] = [];
    linhas.push(this.reg('E001', '0'));

    // E100 - Periodo
    linhas.push(this.reg('E100', this.formatDate(dataInicio), this.formatDate(dataFim)));

    // E110 - Apuracao ICMS (zerado)
    linhas.push(this.reg('E110',
      '0,00', '0,00', '0,00', '0,00', // debitos
      '0,00', '0,00', '0,00', '0,00', // creditos
      '0,00', '0,00', '0,00', '0,00', '0,00', '0,00',
    ));

    linhas.push(this.reg('E990', String(linhas.length + 1)));
    return linhas;
  }

  private gerarBlocoMContribuicoes(
    _tenantId: string, _empresaId: string, _dataInicio: Date, _dataFim: Date,
  ): string[] {
    const linhas: string[] = [];
    linhas.push(this.reg('M001', '0'));

    // M200 - Apuracao PIS (zerado)
    linhas.push(this.reg('M200',
      '0,00', '0,00', '0,00', '0,00',
      '0,00', '0,00', '0,00', '0,00',
      '0,00', '0,00', '0,00', '0,00',
    ));

    // M600 - Apuracao COFINS (zerado)
    linhas.push(this.reg('M600',
      '0,00', '0,00', '0,00', '0,00',
      '0,00', '0,00', '0,00', '0,00',
      '0,00', '0,00', '0,00', '0,00',
    ));

    linhas.push(this.reg('M990', String(linhas.length + 1)));
    return linhas;
  }

  private gerarBloco9(todasLinhas: string[]): string[] {
    const linhas: string[] = [];
    linhas.push(this.reg('9001', '0'));

    // Contar registros por bloco
    const contagem: Record<string, number> = {};
    for (const linha of todasLinhas) {
      const reg = linha.split('|')[1];
      if (reg) {
        const bloco = reg[0];
        contagem[bloco] = (contagem[bloco] || 0) + 1;
      }
    }

    for (const [bloco, qtd] of Object.entries(contagem).sort()) {
      linhas.push(this.reg('9900', bloco, String(qtd)));
    }

    linhas.push(this.reg('9990', String(linhas.length + 2)));
    linhas.push(this.reg('9999', String(todasLinhas.length + linhas.length + 1)));

    return linhas;
  }

  // ============================================================
  // Helpers
  // ============================================================

  private reg(codigo: string, ...campos: string[]): string {
    return `|${codigo}|${campos.join('|')}|`;
  }

  private formatDate(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}${m}${y}`;
  }
}
