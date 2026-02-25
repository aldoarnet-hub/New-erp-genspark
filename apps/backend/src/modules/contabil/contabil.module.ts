import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import {
  PlanoContas,
  ContaBancaria,
  LancamentoContabil,
  MapeamentoOperacaoContabil,
  SaldoContabil,
} from './entities/contabil.entities';

// Services
import { PlanoContasService } from './services/plano-contas.service';
import { MapeamentoContabilService } from './services/mapeamento-contabil.service';
import { LancamentoContabilService } from './services/lancamento-contabil.service';

// Controllers
import { ContabilController } from './controllers/contabil.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlanoContas,
      ContaBancaria,
      LancamentoContabil,
      MapeamentoOperacaoContabil,
      SaldoContabil,
    ]),
  ],
  controllers: [ContabilController],
  providers: [
    PlanoContasService,
    MapeamentoContabilService,
    LancamentoContabilService,
  ],
  exports: [
    PlanoContasService,
    MapeamentoContabilService,
    LancamentoContabilService,
  ],
})
export class ContabilModule {}
