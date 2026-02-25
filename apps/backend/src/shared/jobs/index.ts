/**
 * Jobs do sistema ERP SaaS
 * Workers para processamento assincrono via fila RabbitMQ
 * Implementacao concreta sera feita conforme cada modulo crescer.
 */

export interface JobDefinition {
  name: string;
  queue: string;
  concurrency?: number;
  retries?: number;
}

// Jobs planejados para fases futuras
export const ERP_JOBS: Record<string, JobDefinition> = {
  GERAR_RELATORIO: {
    name: 'gerar-relatorio',
    queue: 'relatorios.gerar',
    concurrency: 2,
    retries: 3,
  },
  ENVIAR_EMAIL: {
    name: 'enviar-email',
    queue: 'emails.enviar',
    concurrency: 5,
    retries: 3,
  },
  PROCESSAR_NFE: {
    name: 'processar-nfe',
    queue: 'nfe.processar',
    concurrency: 1,
    retries: 5,
  },
  RECALCULAR_ESTOQUE: {
    name: 'recalcular-estoque',
    queue: 'estoque.recalcular',
    concurrency: 1,
    retries: 2,
  },
};
