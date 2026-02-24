import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { EmpresaFiscal } from './entities/empresa-fiscal.entity';
import { NcmTabela } from './entities/ncm-tabela.entity';
import { CestTabela } from './entities/cest-tabela.entity';
import { CfopTabela } from './entities/cfop-tabela.entity';
import { CstIcms, CstIpi, CstPisCofins } from './entities/cst-tabelas.entity';
import { IcmsAliquotasUf, IcmsStMva } from './entities/icms-tabelas.entity';
import { MatrizTributaria } from './entities/matriz-tributaria.entity';

// Services
import { MotorTributarioService } from './services/motor-tributario.service';
import { CalculoSimplesNacionalService } from './services/calculo-simples-nacional.service';
import { ValidadorTributarioService } from './services/validador-tributario.service';
import { TabelasTributariasService } from './services/tabelas-tributarias.service';

// Controllers
import { FiscalController } from './controllers/fiscal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmpresaFiscal,
      NcmTabela,
      CestTabela,
      CfopTabela,
      CstIcms,
      CstIpi,
      CstPisCofins,
      IcmsAliquotasUf,
      IcmsStMva,
      MatrizTributaria,
    ]),
  ],
  controllers: [FiscalController],
  providers: [
    MotorTributarioService,
    CalculoSimplesNacionalService,
    ValidadorTributarioService,
    TabelasTributariasService,
  ],
  exports: [
    MotorTributarioService,
    CalculoSimplesNacionalService,
    ValidadorTributarioService,
    TabelasTributariasService,
  ],
})
export class FiscalModule {}
