import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Filial } from './entities/filial.entity';

@Injectable()
export class FilialService {
  constructor(
    @InjectRepository(Filial)
    private readonly filialRepository: Repository<Filial>,
  ) {}

  async findAll(tenantId: string, empresaId?: string): Promise<Filial[]> {
    const where: any = { tenantId };
    if (empresaId) where.empresaId = empresaId;
    return this.filialRepository.find({ where });
  }

  async findById(id: string, tenantId: string): Promise<Filial> {
    const filial = await this.filialRepository.findOne({
      where: { id, tenantId },
    });
    if (!filial) {
      throw new NotFoundException(`Filial ${id} nao encontrada`);
    }
    return filial;
  }

  async create(data: Partial<Filial>): Promise<Filial> {
    const filial = this.filialRepository.create(data);
    return this.filialRepository.save(filial);
  }

  async update(id: string, tenantId: string, data: Partial<Filial>): Promise<Filial> {
    const filial = await this.findById(id, tenantId);
    Object.assign(filial, data);
    return this.filialRepository.save(filial);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const filial = await this.findById(id, tenantId);
    await this.filialRepository.remove(filial);
  }
}
