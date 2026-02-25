import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ============================================================
// Entities
// ============================================================
import { EmpresaFiscal } from './entities/empresa-fiscal.entity';
import { FilialFiscal } from './entities/filial-fiscal.entity';
import { NcmTabela } from './entities/ncm-tabela.entity';
import { CestTabela } from './entities/cest-tabela.entity';
import { CfopTabela } from './entities/cfop-tabela.entity';
import { CstIcms, CstIpi, CstPisCofins } from './entities/cst-tabelas.entity';
import { IcmsAliquotasUf, IcmsStMva } from './entities/icms-tabelas.entity';
import { MatrizTributaria } from './entities/matriz-tributaria.entity';
import { NfE, NfItem, EventoNfe } from './entities/nfe.entity';
import {
  SpedRegistro,
  ObrigacaoFiscal,
  CalendarioFiscal,
  DocumentoFiscalArquivado,
  AuditoriaFiscal,
  NcmCestRelacionamento,
} from './entities/fiscal-complementar.entity';

// ============================================================
// Services
// ============================================================
import { MotorTributarioService } from './services/motor-tributario.service';
import { CalculoSimplesNacionalService } from './services/calculo-simples-nacional.service';
import { ValidadorTributarioService } from './services/validador-tributario.service';
import { TabelasTributariasService } from './services/tabelas-tributarias.service';
import { CertificadoDigitalService } from './services/certificado-digital.service';
import { NfeXmlGeneratorService } from './services/nfe-xml-generator.service';
import { SefazService } from './services/sefaz.service';
import { NfeService } from './services/nfe.service';
import { NFCeService } from './services/nfce.service';
import { SpedService } from './services/sped.service';
import { ObrigacaoFiscalService, AuditoriaFiscalService, SimuladorTributarioService } from './services/obrigacoes-auditoria.service';
import { CalculoDifalService } from './services/calculo-difal.service';
import { GuiaPagamentoService } from './services/guia-pagamento.service';
import { ManifestacaoDestinatarioService } from './services/manifestacao-destinatario.service';
import { ReceitaFederalService } from './services/receita-federal.service';
import { SintegraService } from './services/sintegra.service';
import { ContingenciaService } from './services/contingencia.service';
import { DanfeService } from './services/danfe.service';
import { AuditoriaEstoqueFiscalService } from './services/auditoria-estoque.service';

// ============================================================
// Controllers
// ============================================================
import { FiscalController } from './controllers/fiscal.controller';
import { NfeController } from './controllers/nfe.controller';
import { SpedController } from './controllers/sped.controller';
import { ObrigacoesController } from './controllers/obrigacoes.controller';
import { AuditoriaController } from './controllers/auditoria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Cadastro e configuracao fiscal
      EmpresaFiscal,
      FilialFiscal,

      // Tabelas tributarias
      NcmTabela,
      CestTabela,
      CfopTabela,
      CstIcms,
      CstIpi,
      CstPisCofins,
      IcmsAliquotasUf,
      IcmsStMva,
      NcmCestRelacionamento,

      // Matriz tributaria
      MatrizTributaria,

      // NF-e / NFC-e
      NfE,
      NfItem,
      EventoNfe,

      // SPED
      SpedRegistro,

      // Obrigacoes fiscais
      ObrigacaoFiscal,
      CalendarioFiscal,

      // Arquivo e auditoria
      DocumentoFiscalArquivado,
      AuditoriaFiscal,
    ]),
  ],
  controllers: [
    FiscalController,
    NfeController,
    SpedController,
    ObrigacoesController,
    AuditoriaController,
  ],
  providers: [
    // Motor tributario e calculo
    MotorTributarioService,
    CalculoSimplesNacionalService,
    CalculoDifalService,
    ValidadorTributarioService,
    SimuladorTributarioService,

    // Tabelas
    TabelasTributariasService,

    // Certificado e assinatura
    CertificadoDigitalService,

    // NF-e / NFC-e
    NfeXmlGeneratorService,
    SefazService,
    NfeService,
    NFCeService,
    ContingenciaService,
    DanfeService,

    // SPED
    SpedService,

    // Obrigacoes e guias
    ObrigacaoFiscalService,
    GuiaPagamentoService,

    // Auditoria
    AuditoriaFiscalService,
    AuditoriaEstoqueFiscalService,

    // Manifestacao do destinatario
    ManifestacaoDestinatarioService,

    // Integracoes externas
    ReceitaFederalService,
    SintegraService,
  ],
  exports: [
    MotorTributarioService,
    CalculoSimplesNacionalService,
    CalculoDifalService,
    ValidadorTributarioService,
    SimuladorTributarioService,
    TabelasTributariasService,
    CertificadoDigitalService,
    NfeXmlGeneratorService,
    SefazService,
    NfeService,
    NFCeService,
    ContingenciaService,
    DanfeService,
    SpedService,
    ObrigacaoFiscalService,
    GuiaPagamentoService,
    AuditoriaFiscalService,
    AuditoriaEstoqueFiscalService,
    ManifestacaoDestinatarioService,
    ReceitaFederalService,
    SintegraService,
  ],
})
export class FiscalModule {}
