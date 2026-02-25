import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoNfe, NfE } from '../entities/nfe.entity';
import { SefazService } from './sefaz.service';

/**
 * Servico de Manifestacao do Destinatario Eletronico (MD-e)
 *
 * Tipos de evento:
 * - 210200: Confirmacao da Operacao
 * - 210210: Ciencia da Operacao
 * - 210220: Desconhecimento da Operacao
 * - 210240: Operacao nao Realizada
 *
 * Fundamentacao: Ajuste SINIEF 05/2012
 */
@Injectable()
export class ManifestacaoDestinatarioService {
  private readonly logger = new Logger(ManifestacaoDestinatarioService.name);

  private readonly TIPOS_MANIFESTACAO: Record<string, { descricao: string; exigeJustificativa: boolean }> = {
    '210200': { descricao: 'Confirmacao da Operacao', exigeJustificativa: false },
    '210210': { descricao: 'Ciencia da Operacao', exigeJustificativa: false },
    '210220': { descricao: 'Desconhecimento da Operacao', exigeJustificativa: false },
    '210240': { descricao: 'Operacao nao Realizada', exigeJustificativa: true },
  };

  constructor(
    @InjectRepository(NfE)
    private readonly nfeRepo: Repository<NfE>,
    @InjectRepository(EventoNfe)
    private readonly eventoRepo: Repository<EventoNfe>,
    private readonly sefaz: SefazService,
  ) {}

  /**
   * Registra manifestacao do destinatario
   */
  async manifestar(
    tenantId: string,
    nfeId: string,
    tipoManifestacao: string,
    justificativa?: string,
  ): Promise<EventoNfe> {
    // Validar tipo
    const tipoConfig = this.TIPOS_MANIFESTACAO[tipoManifestacao];
    if (!tipoConfig) {
      throw new BadRequestException(
        `Tipo de manifestacao invalido: ${tipoManifestacao}. Validos: ${Object.keys(this.TIPOS_MANIFESTACAO).join(', ')}`,
      );
    }

    // Validar justificativa para 210240
    if (tipoConfig.exigeJustificativa && (!justificativa || justificativa.length < 15)) {
      throw new BadRequestException('Justificativa obrigatoria e deve ter no minimo 15 caracteres para "Operacao nao Realizada"');
    }

    // Buscar NF-e
    const nfe = await this.nfeRepo.findOne({ where: { id: nfeId, tenantId } });
    if (!nfe) throw new NotFoundException('NF-e nao encontrada');

    // Verificar sequencial
    const ultimoEvento = await this.eventoRepo.findOne({
      where: { nfeId: nfe.id, tipoEvento: tipoManifestacao },
      order: { sequencial: 'DESC' },
    });
    const sequencial = (ultimoEvento?.sequencial || 0) + 1;

    // Enviar para SEFAZ
    const resultado = await this.sefaz.manifestarDestinatario(
      nfe.chaveAcesso,
      tipoManifestacao,
      justificativa,
      nfe.emitenteUf,
    );

    // Registrar evento
    const evento = this.eventoRepo.create({
      tenantId,
      nfeId: nfe.id,
      tipoEvento: tipoManifestacao,
      sequencial,
      descricaoEvento: tipoConfig.descricao,
      protocolo: resultado.sucesso ? `${Date.now()}`.substring(0, 15) : undefined,
      dataEvento: new Date(),
      justificativa: justificativa || undefined,
      status: resultado.sucesso ? 'registrado' : 'rejeitado',
    });

    const eventoSalvo = await this.eventoRepo.save(evento);
    this.logger.log(`Manifestacao ${tipoConfig.descricao} registrada para NF-e ${nfe.chaveAcesso}`);

    return eventoSalvo;
  }

  /**
   * Consulta NF-e destinadas ao CNPJ da empresa
   * (busca documentos emitidos contra a empresa no ambiente nacional)
   */
  async consultarNfeDestinatario(
    tenantId: string,
    cnpj: string,
    ultimoNsu: string = '0',
    uf: string = 'SP',
    ambiente: string = '2',
  ): Promise<{
    ultimoNsu: string;
    maxNsu: string;
    documentos: Array<{
      chaveAcesso: string;
      nsu: string;
      tipoDocumento: string;
      dataEmissao: string;
      cnpjEmitente: string;
      nomeEmitente: string;
      valorTotal: number;
      situacao: string;
      manifestacao?: string;
    }>;
  }> {
    this.logger.log(`Consultando NF-e destinadas CNPJ=${cnpj} NSU=${ultimoNsu}`);

    // Em producao: chamar webservice nfeDistribuicaoDFe da SEFAZ Nacional
    // Stub: retornar resultado vazio
    return {
      ultimoNsu: ultimoNsu,
      maxNsu: ultimoNsu,
      documentos: [],
    };
  }

  /**
   * Download do XML completo de uma NF-e pelo NSU
   */
  async downloadNfe(
    tenantId: string,
    chaveAcesso: string,
    uf: string = 'SP',
    ambiente: string = '2',
  ): Promise<{
    sucesso: boolean;
    chaveAcesso: string;
    xml?: string;
    eventos?: string[];
  }> {
    this.logger.log(`Download NF-e chave=${chaveAcesso}`);

    // Em producao: chamar nfeDistribuicaoDFe com chaveAcesso
    // Stub:
    return {
      sucesso: true,
      chaveAcesso,
      xml: undefined,
      eventos: [],
    };
  }

  /**
   * Lista manifestacoes realizadas
   */
  async listarManifestacoes(
    tenantId: string,
    filtros: {
      nfeId?: string;
      tipoManifestacao?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: EventoNfe[]; total: number }> {
    const tiposManif = Object.keys(this.TIPOS_MANIFESTACAO);

    const qb = this.eventoRepo.createQueryBuilder('e')
      .where('e.tenantId = :tenantId', { tenantId })
      .andWhere('e.tipoEvento IN (:...tipos)', { tipos: tiposManif });

    if (filtros.nfeId) qb.andWhere('e.nfeId = :nfeId', { nfeId: filtros.nfeId });
    if (filtros.tipoManifestacao) qb.andWhere('e.tipoEvento = :tipo', { tipo: filtros.tipoManifestacao });

    qb.orderBy('e.criadoEm', 'DESC')
      .skip(((filtros.page || 1) - 1) * (filtros.limit || 20))
      .take(Math.min(filtros.limit || 20, 100));

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }
}
