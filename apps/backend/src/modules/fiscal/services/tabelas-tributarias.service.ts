import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { NcmTabela } from '../entities/ncm-tabela.entity';
import { CestTabela } from '../entities/cest-tabela.entity';
import { CfopTabela } from '../entities/cfop-tabela.entity';
import { CstIcms, CstIpi, CstPisCofins } from '../entities/cst-tabelas.entity';
import { IcmsAliquotasUf, IcmsStMva } from '../entities/icms-tabelas.entity';
import { MatrizTributaria } from '../entities/matriz-tributaria.entity';
import { EmpresaFiscal } from '../entities/empresa-fiscal.entity';

@Injectable()
export class TabelasTributariasService {
  private readonly logger = new Logger(TabelasTributariasService.name);

  constructor(
    @InjectRepository(NcmTabela)
    private readonly ncmRepo: Repository<NcmTabela>,
    @InjectRepository(CestTabela)
    private readonly cestRepo: Repository<CestTabela>,
    @InjectRepository(CfopTabela)
    private readonly cfopRepo: Repository<CfopTabela>,
    @InjectRepository(CstIcms)
    private readonly cstIcmsRepo: Repository<CstIcms>,
    @InjectRepository(CstIpi)
    private readonly cstIpiRepo: Repository<CstIpi>,
    @InjectRepository(CstPisCofins)
    private readonly cstPisCofinsRepo: Repository<CstPisCofins>,
    @InjectRepository(IcmsAliquotasUf)
    private readonly icmsUfRepo: Repository<IcmsAliquotasUf>,
    @InjectRepository(IcmsStMva)
    private readonly icmsStMvaRepo: Repository<IcmsStMva>,
    @InjectRepository(MatrizTributaria)
    private readonly matrizRepo: Repository<MatrizTributaria>,
    @InjectRepository(EmpresaFiscal)
    private readonly empresaFiscalRepo: Repository<EmpresaFiscal>,
  ) {}

  // ============================================================
  // NCM
  // ============================================================
  async listarNCM(filtro?: { codigo?: string; descricao?: string; page?: number; limit?: number }) {
    const page = filtro?.page || 1;
    const limit = filtro?.limit || 50;
    const qb = this.ncmRepo.createQueryBuilder('n')
      .where('n.ativo = true');

    if (filtro?.codigo) qb.andWhere('n.ncmCodigo LIKE :cod', { cod: `${filtro.codigo}%` });
    if (filtro?.descricao) qb.andWhere('LOWER(n.descricao) LIKE :desc', { desc: `%${filtro.descricao.toLowerCase()}%` });

    qb.orderBy('n.ncmCodigo', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarNCMPorCodigo(codigo: string) {
    const ncm = await this.ncmRepo.findOne({ where: { ncmCodigo: codigo, ativo: true } });
    if (!ncm) throw new NotFoundException(`NCM ${codigo} não encontrado`);
    return ncm;
  }

  // ============================================================
  // CEST
  // ============================================================
  async listarCEST(filtro?: { codigo?: string; segmento?: string; page?: number; limit?: number }) {
    const page = filtro?.page || 1;
    const limit = filtro?.limit || 50;
    const qb = this.cestRepo.createQueryBuilder('c').where('c.ativo = true');
    if (filtro?.codigo) qb.andWhere('c.cestCodigo LIKE :cod', { cod: `${filtro.codigo}%` });
    if (filtro?.segmento) qb.andWhere('c.segmento = :seg', { seg: filtro.segmento });
    qb.orderBy('c.cestCodigo', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ============================================================
  // CFOP
  // ============================================================
  async listarCFOP(filtro?: { codigo?: string; tipo?: string; venda?: boolean; page?: number; limit?: number }) {
    const page = filtro?.page || 1;
    const limit = filtro?.limit || 100;
    const qb = this.cfopRepo.createQueryBuilder('c').where('c.ativo = true');
    if (filtro?.codigo) qb.andWhere('c.cfopCodigo LIKE :cod', { cod: `${filtro.codigo}%` });
    if (filtro?.tipo) qb.andWhere('c.tipoOperacao = :tipo', { tipo: filtro.tipo });
    if (filtro?.venda !== undefined) qb.andWhere('c.venda = :venda', { venda: filtro.venda });
    qb.orderBy('c.cfopCodigo', 'ASC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async buscarCFOPPorCodigo(codigo: string) {
    const cfop = await this.cfopRepo.findOne({ where: { cfopCodigo: codigo, ativo: true } });
    if (!cfop) throw new NotFoundException(`CFOP ${codigo} não encontrado`);
    return cfop;
  }

  // ============================================================
  // CST
  // ============================================================
  async listarCSTICMS() {
    return this.cstIcmsRepo.find({ where: { ativo: true }, order: { cstCodigo: 'ASC' } });
  }

  async listarCSTIPI() {
    return this.cstIpiRepo.find({ where: { ativo: true }, order: { cstCodigo: 'ASC' } });
  }

  async listarCSTPISCOFINS(tipoOperacao?: string) {
    const where: any = { ativo: true };
    if (tipoOperacao) where.tipoOperacao = tipoOperacao;
    return this.cstPisCofinsRepo.find({ where, order: { cstCodigo: 'ASC' } });
  }

  // ============================================================
  // ICMS Alíquotas UF
  // ============================================================
  async listarAliquotasICMS(ufOrigem?: string, ufDestino?: string) {
    const where: any = { ativo: true };
    if (ufOrigem) where.ufOrigem = ufOrigem;
    if (ufDestino) where.ufDestino = ufDestino;
    return this.icmsUfRepo.find({ where, order: { ufOrigem: 'ASC', ufDestino: 'ASC' } });
  }

  async buscarAliquotaICMS(ufOrigem: string, ufDestino: string) {
    return this.icmsUfRepo.findOne({
      where: { ufOrigem, ufDestino, ativo: true },
      order: { dataInicioVigencia: 'DESC' },
    });
  }

  // ============================================================
  // ICMS-ST MVA
  // ============================================================
  async listarMVA(filtro?: { ncm?: string; cest?: string; ufOrigem?: string; ufDestino?: string }) {
    const qb = this.icmsStMvaRepo.createQueryBuilder('m').where('m.ativo = true');
    if (filtro?.ncm) qb.andWhere('m.ncmCodigo = :ncm', { ncm: filtro.ncm });
    if (filtro?.cest) qb.andWhere('m.cestCodigo = :cest', { cest: filtro.cest });
    if (filtro?.ufOrigem) qb.andWhere('m.ufOrigem = :ufO', { ufO: filtro.ufOrigem });
    if (filtro?.ufDestino) qb.andWhere('m.ufDestino = :ufD', { ufD: filtro.ufDestino });
    return qb.orderBy('m.ncmCodigo', 'ASC').getMany();
  }

  // ============================================================
  // Matriz Tributária
  // ============================================================
  async listarMatrizTributaria(tenantId: string, filtro?: { page?: number; limit?: number }) {
    const page = filtro?.page || 1;
    const limit = filtro?.limit || 50;
    const qb = this.matrizRepo.createQueryBuilder('m')
      .where('m.tenantId = :tenantId', { tenantId })
      .andWhere('m.ativo = true')
      .orderBy('m.prioridade', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async criarRegraMatriz(tenantId: string, dto: Partial<MatrizTributaria>) {
    const regra = this.matrizRepo.create({ ...dto, tenantId });
    return this.matrizRepo.save(regra);
  }

  async atualizarRegraMatriz(id: string, tenantId: string, dto: Partial<MatrizTributaria>) {
    const regra = await this.matrizRepo.findOne({ where: { id, tenantId } });
    if (!regra) throw new NotFoundException('Regra não encontrada');
    Object.assign(regra, dto);
    return this.matrizRepo.save(regra);
  }

  async excluirRegraMatriz(id: string, tenantId: string) {
    const regra = await this.matrizRepo.findOne({ where: { id, tenantId } });
    if (!regra) throw new NotFoundException('Regra não encontrada');
    regra.ativo = false;
    return this.matrizRepo.save(regra);
  }

  // ============================================================
  // Empresa Fiscal
  // ============================================================
  async buscarEmpresaFiscal(tenantId: string, empresaId: string) {
    return this.empresaFiscalRepo.findOne({ where: { tenantId, empresaId } });
  }

  async criarOuAtualizarEmpresaFiscal(tenantId: string, dto: Partial<EmpresaFiscal>) {
    let empresa = await this.empresaFiscalRepo.findOne({
      where: { tenantId, empresaId: dto.empresaId },
    });
    if (empresa) {
      Object.assign(empresa, dto);
    } else {
      empresa = this.empresaFiscalRepo.create({ ...dto, tenantId });
    }
    return this.empresaFiscalRepo.save(empresa);
  }

  // ============================================================
  // Estatísticas
  // ============================================================
  async getEstatisticasFiscais(tenantId: string) {
    const [
      totalNCM, totalCFOP, totalCSTICMS, totalRegras,
    ] = await Promise.all([
      this.ncmRepo.count({ where: { ativo: true } }),
      this.cfopRepo.count({ where: { ativo: true } }),
      this.cstIcmsRepo.count({ where: { ativo: true } }),
      this.matrizRepo.count({ where: { tenantId, ativo: true } }),
    ]);

    return {
      tabelasCarregadas: {
        ncm: totalNCM,
        cfop: totalCFOP,
        cstIcms: totalCSTICMS,
        regrasMatriz: totalRegras,
      },
    };
  }
}
