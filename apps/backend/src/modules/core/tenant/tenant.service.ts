import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({ relations: ['empresas'] });
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['empresas'],
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} nao encontrado`);
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { slug } });
    if (!tenant) {
      throw new NotFoundException(`Tenant ${slug} nao encontrado`);
    }
    return tenant;
  }

  async create(data: Partial<Tenant>): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: [{ cnpj: data.cnpj }, { slug: data.slug }],
    });
    if (existing) {
      throw new ConflictException('Tenant com este CNPJ ou slug ja existe');
    }

    // Gera o nome do schema baseado no slug
    const schemaName = `tenant_${data.slug?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    const tenant = this.tenantRepository.create({ ...data, schemaName });
    return this.tenantRepository.save(tenant);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findById(id);
    Object.assign(tenant, data);
    return this.tenantRepository.save(tenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    await this.tenantRepository.remove(tenant);
  }
}
