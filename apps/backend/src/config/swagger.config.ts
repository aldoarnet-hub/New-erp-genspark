import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('ERP SaaS - Materiais de Construcao')
  .setDescription(
    'API do sistema ERP SaaS Multi-Tenant para varejo e atacado de materiais de construcao.\n\n' +
    '## Autenticacao\n' +
    'Use o endpoint `/api/v1/auth/login` para obter um token JWT.\n' +
    'Inclua o token no header: `Authorization: Bearer <token>`\n\n' +
    '## Multi-Tenant\n' +
    'O tenant e identificado automaticamente via JWT (tenantId no payload).\n\n' +
    '## Modulos\n' +
    '- **Auth** - Autenticacao e autorizacao\n' +
    '- **Core** - Tenant, Empresa, Filial, Usuario\n' +
    '- **Cadastros** - Produtos, Clientes, Fornecedores, Auxiliares\n' +
    '- **Fiscal** - Tabelas tributarias, motor fiscal, Simples Nacional\n',
  )
  .setVersion('1.0.0')
  .setContact('ERP SaaS', 'https://erp-construcao.com.br', 'contato@erp-construcao.com.br')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Insira o token JWT obtido no login',
    },
    'JWT',
  )
  .addTag('Auth', 'Autenticacao e autorizacao')
  .addTag('Tenants', 'Gestao de tenants')
  .addTag('Empresas', 'Gestao de empresas')
  .addTag('Filiais', 'Gestao de filiais')
  .addTag('Usuarios', 'Gestao de usuarios')
  .addTag('Produtos', 'Cadastro e gestao de produtos')
  .addTag('Clientes', 'Cadastro e gestao de clientes')
  .addTag('Fornecedores', 'Cadastro e gestao de fornecedores')
  .addTag('Transportadoras', 'Cadastro de transportadoras')
  .addTag('Vendedores', 'Cadastro de vendedores')
  .addTag('Auxiliares', 'Cadastros auxiliares (categorias, marcas, bancos, etc.)')
  .addTag('Fiscal', 'Tabelas e motor tributario')
  .addTag('Health', 'Verificacao de saude da API')
  .build();

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customSiteTitle: 'ERP SaaS - API Docs',
};
