// Motor Tributario (calculo principal de impostos)
export { MotorTributarioService, ItemOperacao, ContextoTributario, ResultadoTributario } from './motor-tributario.service';

// Simples Nacional
export { CalculoSimplesNacionalService } from './calculo-simples-nacional.service';

// Validacao tributaria
export { ValidadorTributarioService, AlertaFiscal } from './validador-tributario.service';

// Tabelas tributarias (NCM, CEST, CFOP, CST, ICMS, MVA, Matriz)
export { TabelasTributariasService } from './tabelas-tributarias.service';

// Certificado digital (A1/A3) e assinatura XML
export { CertificadoDigitalService } from './certificado-digital.service';

// NF-e: XML generator
export { NfeXmlGeneratorService } from './nfe-xml-generator.service';

// SEFAZ: webservice integration
export { SefazService } from './sefaz.service';

// NF-e: servico principal (emissao, cancelamento, consulta)
export { NfeService } from './nfe.service';

// NFC-e: Nota Fiscal de Consumidor Eletronica (modelo 65)
export { NFCeService } from './nfce.service';

// Contingencia: SVC-AN, SVC-RS, EPEC, FS-DA, NFC-e Offline
export { ContingenciaService } from './contingencia.service';

// DANFE: gerador de dados para DANFE retrato, simplificado e NFC-e
export { DanfeService } from './danfe.service';

// SPED: Fiscal e Contribuicoes
export { SpedService } from './sped.service';

// Obrigacoes fiscais, calendario, auditoria, simulador
export { ObrigacaoFiscalService, AuditoriaFiscalService, SimuladorTributarioService } from './obrigacoes-auditoria.service';

// DIFAL (Diferencial de Aliquotas) e FCP
export { CalculoDifalService } from './calculo-difal.service';

// Guias de pagamento (DAS, DARF, GNRE, GPS, GRU)
export { GuiaPagamentoService } from './guia-pagamento.service';

// Manifestacao do Destinatario Eletronico
export { ManifestacaoDestinatarioService } from './manifestacao-destinatario.service';

// Receita Federal (consulta CNPJ, validacao CPF/CNPJ)
export { ReceitaFederalService } from './receita-federal.service';

// SINTEGRA (validacao e consulta de Inscricao Estadual)
export { SintegraService } from './sintegra.service';

// Auditoria de Estoque Fiscal
export { AuditoriaEstoqueFiscalService } from './auditoria-estoque.service';
