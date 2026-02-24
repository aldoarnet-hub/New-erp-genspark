import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from '../entities/auxiliares.entity';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(Auditoria) private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  async registrar(
    tenantId: string,
    tabela: string,
    registroId: string,
    operacao: 'INSERT' | 'UPDATE' | 'DELETE',
    dadosAnteriores: any,
    dadosNovos: any,
    usuarioId?: string,
    usuarioNome?: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      // Calcular campos alterados
      let camposAlterados: string[] | null = null;
      if (operacao === 'UPDATE' && dadosAnteriores && dadosNovos) {
        camposAlterados = [];
        const keys = new Set([...Object.keys(dadosAnteriores), ...Object.keys(dadosNovos)]);
        for (const key of keys) {
          if (['dataAtualizacao', 'atualizadoPor'].includes(key)) continue;
          const antes = JSON.stringify(dadosAnteriores[key]);
          const depois = JSON.stringify(dadosNovos[key]);
          if (antes !== depois) camposAlterados.push(key);
        }
      }

      const audit = this.auditoriaRepo.create({
        tenantId,
        tabela,
        registroId,
        operacao,
        dadosAnteriores: operacao !== 'INSERT' ? dadosAnteriores : undefined,
        dadosNovos: operacao !== 'DELETE' ? dadosNovos : undefined,
        camposAlterados: camposAlterados ?? undefined,
        usuarioId,
        usuarioNome,
        ipAddress,
      } as any);

      await this.auditoriaRepo.save(audit);
    } catch (error) {
      // Auditoria nao deve bloquear operacao principal
      this.logger.error(`Erro ao registrar auditoria: ${error.message}`, error.stack);
    }
  }

  async listarPorRegistro(tenantId: string, tabela: string, registroId: string) {
    return this.auditoriaRepo.find({
      where: { tenantId, tabela, registroId },
      order: { dataOperacao: 'DESC' },
      take: 50,
    });
  }

  async listarPorTabela(tenantId: string, tabela: string, page = 1, limit = 20) {
    const [data, total] = await this.auditoriaRepo.findAndCount({
      where: { tenantId, tabela },
      order: { dataOperacao: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async listarRecentes(tenantId: string, limit = 50) {
    return this.auditoriaRepo.find({
      where: { tenantId },
      order: { dataOperacao: 'DESC' },
      take: limit,
    });
  }

  async getEstatisticas(tenantId: string) {
    const total = await this.auditoriaRepo.count({ where: { tenantId } });
    const inserts = await this.auditoriaRepo.count({ where: { tenantId, operacao: 'INSERT' } });
    const updates = await this.auditoriaRepo.count({ where: { tenantId, operacao: 'UPDATE' } });
    const deletes = await this.auditoriaRepo.count({ where: { tenantId, operacao: 'DELETE' } });

    return { total, inserts, updates, deletes };
  }
}
