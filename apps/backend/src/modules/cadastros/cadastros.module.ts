import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UnidadeMedida } from './entities/unidade-medida.entity';
import {
  Categoria, Marca, Fabricante, TabelaPreco, FormaPagamento,
  CondicaoPagamento, CondicaoPagamentoParcela, Banco, ContaBancaria,
  CentroCusto, PlanoConta, Auditoria,
} from './entities/auxiliares.entity';
import {
  Produto, ProdutoPreco, ProdutoFilial, ProdutoComposicao,
  ProdutoSimilar, ProdutoAplicacao, ProdutoMidia,
} from './entities/produto.entity';
import { Cliente, ClienteEndereco, ClienteContato, ClienteLimite } from './entities/cliente.entity';
import {
  Fornecedor, FornecedorAvaliacao, Transportadora,
  Vendedor, VendedorCarteira,
} from './entities/fornecedor.entity';

// Services
import { ProdutosService } from './services/produtos.service';
import { ClientesService } from './services/clientes.service';
import { FornecedoresService } from './services/fornecedores.service';
import { AuxiliaresService } from './services/auxiliares.service';
import { AuditoriaService } from './services/auditoria.service';

// Controllers
import { ProdutosController } from './controllers/produtos.controller';
import { ClientesController } from './controllers/clientes.controller';
import { FornecedoresController, TransportadorasController, VendedoresController } from './controllers/fornecedores.controller';
import { AuxiliaresController } from './controllers/auxiliares.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Auxiliares
      UnidadeMedida, Categoria, Marca, Fabricante, TabelaPreco,
      FormaPagamento, CondicaoPagamento, CondicaoPagamentoParcela,
      Banco, ContaBancaria, CentroCusto, PlanoConta, Auditoria,
      // Produtos
      Produto, ProdutoPreco, ProdutoFilial, ProdutoComposicao,
      ProdutoSimilar, ProdutoAplicacao, ProdutoMidia,
      // Clientes
      Cliente, ClienteEndereco, ClienteContato, ClienteLimite,
      // Fornecedores e relacionados
      Fornecedor, FornecedorAvaliacao, Transportadora,
      Vendedor, VendedorCarteira,
    ]),
  ],
  controllers: [
    ProdutosController,
    ClientesController,
    FornecedoresController,
    TransportadorasController,
    VendedoresController,
    AuxiliaresController,
  ],
  providers: [
    AuditoriaService,
    ProdutosService,
    ClientesService,
    FornecedoresService,
    AuxiliaresService,
  ],
  exports: [
    AuditoriaService,
    ProdutosService,
    ClientesService,
    FornecedoresService,
    AuxiliaresService,
  ],
})
export class CadastrosModule {}
