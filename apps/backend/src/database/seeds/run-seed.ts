import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant, TenantStatus, TenantPlano } from '../../modules/core/tenant/entities/tenant.entity';
import { Empresa, EmpresaTipo, RegimeTributario } from '../../modules/core/empresa/entities/empresa.entity';
import { Filial } from '../../modules/core/filial/entities/filial.entity';
import { Usuario } from '../../modules/core/usuario/entities/usuario.entity';
import { PERFIS } from '../../shared/enums';

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'erp_dev',
    entities: [Tenant, Empresa, Filial, Usuario],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Conexao com banco estabelecida. Iniciando seed...');

  const tenantRepo = dataSource.getRepository(Tenant);
  const empresaRepo = dataSource.getRepository(Empresa);
  const filialRepo = dataSource.getRepository(Filial);
  const usuarioRepo = dataSource.getRepository(Usuario);

  // 1. Criar Tenant demo
  let tenant = await tenantRepo.findOne({ where: { slug: 'demo' } });
  if (!tenant) {
    tenant = tenantRepo.create({
      nome: 'Empresa Demo - Materiais de Construcao',
      slug: 'demo',
      cnpj: '00.000.000/0001-00',
      email: 'admin@demo.erp.com',
      telefone: '(11) 99999-9999',
      plano: TenantPlano.PROFISSIONAL,
      status: TenantStatus.ATIVO,
      schemaName: 'tenant_demo',
      maxUsuarios: 50,
      maxEmpresas: 5,
      maxFiliais: 10,
      configuracoes: { moeda: 'BRL', idioma: 'pt-BR', timezone: 'America/Sao_Paulo' },
    });
    tenant = await tenantRepo.save(tenant);
    console.log('Tenant demo criado:', tenant.id);
  }

  // 2. Criar Empresa
  let empresa = await empresaRepo.findOne({ where: { cnpj: '11.111.111/0001-11' } });
  if (!empresa) {
    empresa = empresaRepo.create({
      tenantId: tenant.id,
      razaoSocial: 'Materiais de Construcao Demo LTDA',
      nomeFantasia: 'Construcao Demo',
      cnpj: '11.111.111/0001-11',
      inscricaoEstadual: '123.456.789.000',
      tipo: EmpresaTipo.MATRIZ,
      regimeTributario: RegimeTributario.SIMPLES_NACIONAL,
      cep: '01001-000',
      logradouro: 'Rua Demo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
      codigoIbge: '3550308',
      email: 'contato@demo.com.br',
      telefone: '(11) 3333-3333',
      ativo: true,
    });
    empresa = await empresaRepo.save(empresa);
    console.log('Empresa demo criada:', empresa.id);
  }

  // 3. Criar Filial
  let filial = await filialRepo.findOne({ where: { empresaId: empresa.id } });
  if (!filial) {
    filial = filialRepo.create({
      empresaId: empresa.id,
      tenantId: tenant.id,
      nome: 'Filial Centro - SP',
      cnpj: '11.111.111/0001-11',
      inscricaoEstadual: '123.456.789.000',
      cep: '01001-000',
      logradouro: 'Rua Demo',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
      codigoIbge: '3550308',
      email: 'filial1@demo.com.br',
      telefone: '(11) 3333-3334',
      ativo: true,
    });
    filial = await filialRepo.save(filial);
    console.log('Filial demo criada:', filial.id);
  }

  // 4. Criar Usuario Admin
  const adminExists = await usuarioRepo.findOne({ where: { email: 'admin@erp.com' } });
  if (!adminExists) {
    const senhaHash = await bcrypt.hash('admin123', 12);
    const admin = usuarioRepo.create({
      tenantId: tenant.id,
      empresaId: empresa.id,
      filialId: filial.id,
      nome: 'Administrador',
      email: 'admin@erp.com',
      senha: senhaHash,
      perfil: 'ADMIN',
      roles: PERFIS.ADMIN as string[],
      permissoes: PERFIS.ADMIN as string[],
      ativo: true,
      emailVerificado: true,
    });
    await usuarioRepo.save(admin);
    console.log('Usuario admin criado: admin@erp.com / admin123');
  }

  // 5. Criar outros usuarios de teste
  const testUsers = [
    { nome: 'Gerente Vendas', email: 'gerente@erp.com', perfil: 'GERENTE' },
    { nome: 'Vendedor Joao', email: 'vendedor@erp.com', perfil: 'VENDEDOR' },
    { nome: 'Estoquista Maria', email: 'estoquista@erp.com', perfil: 'ESTOQUISTA' },
  ];

  for (const u of testUsers) {
    const exists = await usuarioRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      const senhaHash = await bcrypt.hash('123456', 12);
      const perfil = u.perfil as keyof typeof PERFIS;
      const user = usuarioRepo.create({
        tenantId: tenant.id,
        empresaId: empresa.id,
        filialId: filial.id,
        nome: u.nome,
        email: u.email,
        senha: senhaHash,
        perfil: u.perfil,
        roles: (PERFIS[perfil] || []) as string[],
        permissoes: (PERFIS[perfil] || []) as string[],
        ativo: true,
        emailVerificado: true,
      });
      await usuarioRepo.save(user);
      console.log(`Usuario criado: ${u.email} / 123456`);
    }
  }

  console.log('\nSeed concluido com sucesso!');
  console.log('==========================================');
  console.log('Credenciais de acesso:');
  console.log('  Admin:     admin@erp.com / admin123');
  console.log('  Gerente:   gerente@erp.com / 123456');
  console.log('  Vendedor:  vendedor@erp.com / 123456');
  console.log('  Estoquista: estoquista@erp.com / 123456');
  console.log('==========================================');

  await dataSource.destroy();
}

runSeed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
