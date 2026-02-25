import { registerAs } from '@nestjs/config';

export default registerAs('rabbitmq', () => ({
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
  user: process.env.RABBITMQ_USER || 'guest',
  pass: process.env.RABBITMQ_PASS || 'guest',
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',

  exchanges: {
    events: 'erp.events',
    commands: 'erp.commands',
  },

  queues: {
    vendasCriadas: 'vendas.criadas',
    estoqueMovimentado: 'estoque.movimentado',
    nfeEmitida: 'nfe.emitida',
    relatoriosGerar: 'relatorios.gerar',
  },
}));
