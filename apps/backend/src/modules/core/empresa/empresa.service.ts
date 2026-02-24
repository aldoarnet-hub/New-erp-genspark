import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async findAll(tenantId: string): Promise<Empresa[]> {
    return this.empresaRepository.find({
      where: { tenantId },
      relations: ['filiais'],
    });
  }

  async findById(id: string, tenantId: string): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({
      where: { id, tenantId },
      relations: ['filiais'],
    });
    if (!empresa) {
      throw new NotFoundException(`Empresa ${id} nao encontrada`);
    }
    return empresa;
  }

  async create(data: Partial<Empresa>): Promise<Empresa> {
    const empresa = this.empresaRepository.create(data);
    return this.empresaRepository.save(empresa);
  }

  async update(id: string, tenantId: string, data: Partial<Empresa>): Promise<Empresa> {
    const empresa = await this.findById(id, tenantId);
    Object.assign(empresa, data);
    return this.empresaRepository.save(empresa);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const empresa = await this.findById(id, tenantId);
    await this.empresaRepository.remove(empresa);
  }
}
