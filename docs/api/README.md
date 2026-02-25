# API Reference - ERP SaaS

## Base URL

- **Desenvolvimento**: `http://localhost:3001/api/v1`
- **Staging**: `https://staging.erp.example.com/api/v1`
- **Producao**: `https://erp.example.com/api/v1`

## Autenticacao

Todas as rotas (exceto `/auth/login` e `/health`) requerem JWT Bearer token.

```
Authorization: Bearer <access_token>
```

## Endpoints

### Health
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /health | Health check da API |

### Auth
| Metodo | Rota | Descricao |
|--------|------|----------|
| POST | /auth/login | Login (retorna access + refresh token) |
| POST | /auth/refresh | Refresh do token |
| GET | /auth/profile | Perfil do usuario logado |

### Core - Tenants
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /tenants | Listar tenants |
| GET | /tenants/:id | Buscar tenant por ID |
| POST | /tenants | Criar tenant |
| PUT | /tenants/:id | Atualizar tenant |

### Core - Empresas
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /empresas | Listar empresas |
| GET | /empresas/:id | Buscar empresa por ID |
| POST | /empresas | Criar empresa |
| PUT | /empresas/:id | Atualizar empresa |

### Core - Filiais
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /filiais | Listar filiais |
| GET | /filiais/:id | Buscar filial por ID |
| POST | /filiais | Criar filial |
| PUT | /filiais/:id | Atualizar filial |

### Core - Usuarios
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /usuarios | Listar usuarios |
| GET | /usuarios/:id | Buscar usuario por ID |
| POST | /usuarios | Criar usuario |
| PUT | /usuarios/:id | Atualizar usuario |

### Produtos
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /produtos | Listar produtos (com filtros e paginacao) |
| GET | /produtos/:id | Buscar produto por ID |
| GET | /produtos/:id/completo | Buscar produto completo (precos, estoque, etc.) |
| POST | /produtos | Criar produto |
| PUT | /produtos/:id | Atualizar produto |
| PATCH | /produtos/:id/inativar | Inativar produto |
| GET | /produtos/estatisticas | Estatisticas de produtos |

#### Sub-recursos de Produtos
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET/POST/PUT/DELETE | /produtos/:id/precos | Precos do produto |
| GET/POST/PUT/DELETE | /produtos/:id/estoque | Estoque por filial |
| GET/POST/PUT/DELETE | /produtos/:id/composicao | Composicao (kits) |
| GET/POST/DELETE | /produtos/:id/similares | Produtos similares |
| GET/POST/DELETE | /produtos/:id/aplicacoes | Aplicacoes |
| GET/POST/DELETE | /produtos/:id/midias | Midias |

### Clientes
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /clientes | Listar clientes |
| GET | /clientes/:id | Buscar cliente por ID |
| GET | /clientes/:id/completo | Buscar com enderecos, contatos, limites |
| POST | /clientes | Criar cliente |
| PUT | /clientes/:id | Atualizar cliente |
| PATCH | /clientes/:id/inativar | Inativar cliente |
| GET | /clientes/estatisticas | Estatisticas |

#### Sub-recursos de Clientes
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET/POST/PUT/DELETE | /clientes/:id/enderecos | Enderecos |
| GET/POST/PUT/DELETE | /clientes/:id/contatos | Contatos |
| GET/POST | /clientes/:id/limites | Analise de credito |

### Fornecedores
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /fornecedores | Listar fornecedores |
| GET | /fornecedores/:id | Buscar fornecedor |
| POST | /fornecedores | Criar fornecedor |
| PUT | /fornecedores/:id | Atualizar fornecedor |
| PATCH | /fornecedores/:id/inativar | Inativar |
| POST | /fornecedores/:id/avaliacoes | Registrar avaliacao |
| GET | /fornecedores/estatisticas | Estatisticas |

### Transportadoras
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /transportadoras | Listar transportadoras |
| POST | /transportadoras | Criar transportadora |
| PUT | /transportadoras/:id | Atualizar |
| PATCH | /transportadoras/:id/inativar | Inativar |

### Vendedores
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /vendedores | Listar vendedores |
| POST | /vendedores | Criar vendedor |
| PUT | /vendedores/:id | Atualizar |
| GET/POST/DELETE | /vendedores/:id/carteira | Carteira de clientes |

### Cadastros Auxiliares
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET/POST/PUT | /auxiliares/unidades | Unidades de medida |
| GET/POST/PUT | /auxiliares/categorias | Categorias |
| GET/POST/PUT | /auxiliares/marcas | Marcas |
| GET/POST/PUT | /auxiliares/fabricantes | Fabricantes |
| GET/POST/PUT | /auxiliares/tabelas-preco | Tabelas de preco |
| GET/POST/PUT | /auxiliares/formas-pagamento | Formas de pagamento |
| GET/POST/PUT | /auxiliares/condicoes-pagamento | Condicoes de pagamento |
| GET/POST/PUT | /auxiliares/bancos | Bancos |
| GET/POST/PUT | /auxiliares/contas-bancarias | Contas bancarias |
| GET/POST/PUT | /auxiliares/centros-custo | Centros de custo |
| GET/POST/PUT | /auxiliares/plano-contas | Plano de contas |
| GET | /auxiliares/cep/:cep | Consulta CEP via ViaCEP |
| GET | /auxiliares/estatisticas | Estatisticas gerais |

### Fiscal
| Metodo | Rota | Descricao |
|--------|------|----------|
| GET | /fiscal/ncm | Tabela NCM |
| GET | /fiscal/cest | Tabela CEST |
| GET | /fiscal/cfop | Tabela CFOP |
| POST | /fiscal/calcular | Calcular tributacao |
| POST | /fiscal/validar | Validar configuracao fiscal |

## Formato de Resposta

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-02-24T12:00:00.000Z"
}
```

## Erros

```json
{
  "statusCode": 400,
  "timestamp": "2024-02-24T12:00:00.000Z",
  "path": "/api/v1/produtos",
  "method": "POST",
  "message": "Descricao da falha"
}
```

## Swagger

Documentacao interativa disponivel em:
- **Dev**: http://localhost:3001/api/docs
