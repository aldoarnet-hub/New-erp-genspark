import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { PERFIS, PerfilUsuario } from '@/shared/enums';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(tenantId: string): Promise<Usuario[]> {
    return this.usuarioRepository.find({
      where: { tenantId },
      select: ['id', 'nome', 'email', 'perfil', 'roles', 'ativo', 'ultimoLogin', 'criadoEm'],
    });
  }

  async findById(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} nao encontrado`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async create(data: {
    nome: string;
    email: string;
    senha: string;
    perfil: PerfilUsuario;
    tenantId: string;
    empresaId: string;
    filialId?: string;
  }): Promise<Usuario> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email ja cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.senha, 12);
    const roles = PERFIS[data.perfil] || [];

    const usuario = this.usuarioRepository.create({
      ...data,
      senha: hashedPassword,
      roles: roles as string[],
      permissoes: roles as string[],
    });

    const saved = await this.usuarioRepository.save(usuario);
    const { senha: _, ...result } = saved;
    return result as Usuario;
  }

  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const usuario = await this.findById(id);

    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 12);
    }

    Object.assign(usuario, data);
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findById(id);
    await this.usuarioRepository.remove(usuario);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usuarioRepository.update(id, {
      ultimoLogin: new Date(),
      tentativasLogin: 0,
    });
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    const usuario = await this.findById(id);
    usuario.tentativasLogin += 1;

    // Bloqueia por 30 minutos apos 5 tentativas
    if (usuario.tentativasLogin >= 5) {
      usuario.bloqueadoAte = new Date(Date.now() + 30 * 60 * 1000);
    }

    await this.usuarioRepository.save(usuario);
  }
}
