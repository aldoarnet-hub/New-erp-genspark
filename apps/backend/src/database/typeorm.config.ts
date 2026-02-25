import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Carrega .env
dotenv.config({ path: ['.env', '../../.env'] });

// Core entities
import { Tenant } from '../modules/core/tenant/entities/tenant.entity';
import { Empresa } from '../modules/core/empresa/entities/empresa.entity';
import { Filial } from '../modules/core/filial/entities/filial.entity';
import { Usuario } from '../modules/core/usuario/entities/usuario.entity';

// Cadastros entities
import {
  UnidadeMedida,
  Categoria, Marca, Fabricante, TabelaPreco, FormaPagamento,
  CondicaoPagamento, CondicaoPagamentoParcela, Banco, ContaBancaria,
  CentroCusto, PlanoConta, Auditoria,
  Produto, ProdutoPreco, ProdutoFilial, ProdutoComposicao,
  ProdutoSimilar, ProdutoAplicacao, ProdutoMidia,
  Cliente, ClienteEndereco, ClienteContato, ClienteLimite,
  Fornecedor, FornecedorAvaliacao, Transportadora,
  Vendedor, VendedorCarteira,
} from '../modules/cadastros/entities';

// Fiscal entities
import {
  EmpresaFiscal, NcmTabela, CestTabela, CfopTabela,
  CstIcms, CstIpi, CstPisCofins,
  IcmsAliquotasUf, IcmsStMva, MatrizTributaria,
} from '../modules/fiscal/entities';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'erp_dev',
  entities: [
    // Core
    Tenant, Empresa, Filial, Usuario,
    // Cadastros
    UnidadeMedida,
    Categoria, Marca, Fabricante, TabelaPreco, FormaPagamento,
    CondicaoPagamento, CondicaoPagamentoParcela, Banco, ContaBancaria,
    CentroCusto, PlanoConta, Auditoria,
    Produto, ProdutoPreco, ProdutoFilial, ProdutoComposicao,
    ProdutoSimilar, ProdutoAplicacao, ProdutoMidia,
    Cliente, ClienteEndereco, ClienteContato, ClienteLimite,
    Fornecedor, FornecedorAvaliacao, Transportadora,
    Vendedor, VendedorCarteira,
    // Fiscal
    EmpresaFiscal, NcmTabela, CestTabela, CfopTabela,
    CstIcms, CstIpi, CstPisCofins,
    IcmsAliquotasUf, IcmsStMva, MatrizTributaria,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
