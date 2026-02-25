import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';
import * as crypto from 'crypto';

/**
 * Servico para gerenciamento de certificados digitais A1 e A3
 * para assinatura de documentos fiscais eletronicos
 */
@Injectable()
export class CertificadoDigitalService {
  private readonly logger = new Logger(CertificadoDigitalService.name);

  constructor(
    @InjectRepository(EmpresaFiscal)
    private readonly empresaFiscalRepo: Repository<EmpresaFiscal>,
  ) {}

  /**
   * Verifica validade do certificado e alerta sobre vencimento
   */
  async verificarValidade(tenantId: string, empresaId: string): Promise<{
    valido: boolean;
    diasRestantes: number;
    dataVencimento: Date | null;
    alerta: string | null;
  }> {
    const empresa = await this.empresaFiscalRepo.findOne({
      where: { tenantId, empresaId },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa fiscal nao encontrada');
    }

    if (!empresa.certificadoValidadeFim) {
      return {
        valido: false,
        diasRestantes: 0,
        dataVencimento: null,
        alerta: 'critico',
      };
    }

    const hoje = new Date();
    const vencimento = new Date(empresa.certificadoValidadeFim);
    const diasRestantes = Math.ceil(
      (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
    );

    let alerta: string | null = null;
    if (diasRestantes <= 7) {
      alerta = 'critico';
    } else if (diasRestantes <= (empresa.certificadoDiasAlerta || 30)) {
      alerta = 'alerta';
    }

    return {
      valido: diasRestantes > 0,
      diasRestantes,
      dataVencimento: vencimento,
      alerta,
    };
  }

  /**
   * Registra dados do certificado digital para uma empresa
   */
  async registrarCertificado(
    tenantId: string,
    empresaId: string,
    dados: {
      tipo: string;
      serial: string;
      validadeInicio: Date;
      validadeFim: Date;
      caminho?: string;
      senhaCriptografada?: string;
    },
  ): Promise<EmpresaFiscal> {
    const empresa = await this.empresaFiscalRepo.findOne({
      where: { tenantId, empresaId },
    });

    if (!empresa) {
      throw new BadRequestException('Empresa fiscal nao encontrada');
    }

    empresa.certificadoTipo = dados.tipo;
    empresa.certificadoSerial = dados.serial;
    empresa.certificadoValidadeInicio = dados.validadeInicio;
    empresa.certificadoValidadeFim = dados.validadeFim;
    if (dados.caminho) empresa.certificadoCaminho = dados.caminho;
    if (dados.senhaCriptografada) {
      empresa.certificadoSenhaCriptografada = this.criptografarSenha(dados.senhaCriptografada);
    }

    return this.empresaFiscalRepo.save(empresa);
  }

  /**
   * Assina XML conforme padrao da SEFAZ (stub - em producao usar signxml)
   * A implementacao real requer a lib node-signpdf / xml-crypto
   */
  async assinarXml(
    xmlString: string,
    _tenantId: string,
    _empresaId: string,
    _tagAssinar: string = 'infNFe',
  ): Promise<string> {
    this.logger.log('Assinando XML...');
    // Em producao: carregar certificado PKCS#12, extrair chave privada,
    // aplicar assinatura XML enveloped com RSA-SHA256 usando xml-crypto
    //
    // Stub: retorna XML com marcador de assinatura
    return xmlString.replace(
      '</infNFe>',
      '</infNFe><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo/><SignatureValue/></Signature>',
    );
  }

  /**
   * Gera chave de acesso da NF-e (44 digitos)
   */
  gerarChaveAcesso(params: {
    cUf: string;
    aamm: string;
    cnpj: string;
    mod: string;
    serie: string;
    nNf: string;
    tpEmis: string;
    cNf: string;
  }): string {
    const chave =
      params.cUf.padStart(2, '0') +
      params.aamm +
      params.cnpj.padStart(14, '0') +
      params.mod.padStart(2, '0') +
      params.serie.padStart(3, '0') +
      params.nNf.padStart(9, '0') +
      params.tpEmis +
      params.cNf.padStart(8, '0');

    const dv = this.calcularDigitoVerificador(chave);
    return chave + dv;
  }

  /**
   * Calcula digito verificador da chave de acesso (modulo 11)
   */
  private calcularDigitoVerificador(chave: string): string {
    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let idx = 0;
    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i], 10) * pesos[idx % pesos.length];
      idx++;
    }
    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    return dv.toString();
  }

  /**
   * Criptografa senha do certificado com AES-256
   */
  private criptografarSenha(senha: string): string {
    const key = process.env.ENCRYPTION_KEY || 'erp-saas-encryption-key-32-chars!';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
    let encrypted = cipher.update(senha, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
}
