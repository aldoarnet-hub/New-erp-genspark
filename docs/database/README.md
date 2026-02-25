# Modelo de Dados - ERP SaaS

## Visao Geral

O banco de dados PostgreSQL 16 contem ~43 tabelas organizadas nos seguintes dominios:

## Core (4 tabelas)

| Tabela | Descricao |
|--------|----------|
| tenants | Tenants do sistema (empresas clientes do SaaS) |
| empresas | Empresas do tenant (pessoa juridica) |
| filiais | Filiais/lojas de cada empresa |
| usuarios | Usuarios do sistema com perfil e permissoes |

## Cadastros - Auxiliares (12 tabelas)

| Tabela | Descricao |
|--------|----------|
| unidades_medida | Unidades de medida (UN, KG, M, M2, etc.) |
| categorias | Categorias de produtos (hierarquica) |
| marcas | Marcas de produtos |
| fabricantes | Fabricantes |
| tabelas_preco | Tabelas de precos |
| formas_pagamento | Formas de pagamento (dinheiro, cartao, etc.) |
| condicoes_pagamento | Condicoes de pagamento (a vista, 30/60, etc.) |
| condicoes_pagamento_parcelas | Parcelas das condicoes |
| bancos | Bancos (codigo Febraban) |
| contas_bancarias | Contas bancarias da empresa |
| centros_custo | Centros de custo (hierarquico) |
| plano_contas | Plano de contas contabil (hierarquico) |

## Cadastros - Produtos (7 tabelas)

| Tabela | Descricao |
|--------|----------|
| produtos | Cadastro principal de produtos |
| produto_precos | Precos por filial/tabela |
| produto_filial | Estoque por filial |
| produto_composicao | Composicao de kits |
| produto_similares | Produtos similares/substitutos |
| produto_aplicacoes | Aplicacoes do produto |
| produto_midias | Imagens e arquivos do produto |

## Cadastros - Clientes (4 tabelas)

| Tabela | Descricao |
|--------|----------|
| clientes | Cadastro principal de clientes |
| cliente_enderecos | Enderecos de entrega/cobranca |
| cliente_contatos | Contatos do cliente |
| cliente_limites | Historico de analise de credito |

## Cadastros - Fornecedores (5 tabelas)

| Tabela | Descricao |
|--------|----------|
| fornecedores | Cadastro de fornecedores |
| fornecedor_avaliacoes | Avaliacoes periodicas |
| transportadoras | Transportadoras |
| vendedores | Vendedores/representantes |
| vendedor_carteira | Carteira de clientes do vendedor |

## Fiscal (10 tabelas)

| Tabela | Descricao |
|--------|----------|
| ncm_tabela | Nomenclatura Comum do Mercosul |
| cest_tabela | Codigo Especificador de Substituicao Tributaria |
| cfop_tabela | Codigo Fiscal de Operacoes e Prestacoes |
| cst_icms | Codigo de Situacao Tributaria ICMS |
| cst_ipi | Codigo de Situacao Tributaria IPI |
| cst_pis_cofins | Codigo de Situacao Tributaria PIS/COFINS |
| icms_aliquotas_uf | Aliquotas ICMS por UF |
| icms_st_mva | Margem de Valor Agregado para ICMS-ST |
| matriz_tributaria | Matriz tributaria configuravel |
| empresa_fiscal | Configuracoes fiscais da empresa |

## Auditoria (1 tabela + triggers)

| Tabela | Descricao |
|--------|----------|
| auditoria | Log de todas as operacoes (INSERT/UPDATE/DELETE) |

### Triggers de Auditoria

Triggers automaticos em: produtos, clientes, fornecedores, transportadoras, vendedores.

## Convencoes

- **PK**: UUID v4 gerado automaticamente
- **Multi-tenant**: Coluna `tenantId` em todas as tabelas de negocio
- **Audit**: Colunas `criadoEm` e `atualizadoEm` com timestamps automaticos
- **Soft delete**: Flag `ativo` (boolean) ao inves de exclusao fisica
- **Indexes**: tenantId indexado em todas as tabelas; unique constraints em tenant+codigo
