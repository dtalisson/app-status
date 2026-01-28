# Painel Administrativo - Radiant Store

## 🚀 Como Acessar

1. **Inicie o servidor backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Inicie o frontend:**
   ```bash
   npm start
   ```

3. **Acesse o painel admin:**
   - URL: http://localhost:3000/admin/login
   - **Credenciais padrão:**
     - Username: `admin`
     - Password: `admin123`
     - ⚠️ **IMPORTANTE:** Altere a senha após o primeiro login!

## 📋 Funcionalidades

### Dashboard
- Visualização do faturamento total
- Número de keys vendidas
- Ticket médio por venda
- Listagem completa de todas as vendas com detalhes:
  - Key gerada
  - Produto vendido
  - Plano (se aplicável)
  - Usuário que comprou
  - Valor da venda
  - Data e hora
  - Status da venda

### Gerenciamento de Produtos
- ✅ Listar todos os produtos cadastrados
- ✅ Cadastrar novo produto (nome, descrição, valor, imagem JPG)
- ✅ Editar produtos existentes
- ✅ Deletar produtos
- ✅ Ativar/desativar produtos
- ✅ Visualizar planos relacionados a cada produto

### Gerenciamento de Planos
- ✅ Listar todos os planos cadastrados
- ✅ Cadastrar novo plano vinculado a um produto
- ✅ Editar planos existentes
- ✅ Deletar planos
- ✅ Ativar/desativar planos

## 🔐 Autenticação

O painel é protegido por autenticação JWT. Você precisa estar logado para acessar qualquer página administrativa.

## 📊 Dados Armazenados no MongoDB

Todas as informações são armazenadas diretamente no MongoDB:

- **Products (Produtos)**
  - Nome, descrição, valor, imagem
  - Status ativo/inativo
  - Planos relacionados

- **Plans (Planos)**
  - Nome, descrição, valor
  - Produto associado
  - Status ativo/inativo

- **Sales (Vendas/Keys)**
  - Key única gerada
  - Produto e plano vendidos
  - Dados do comprador (email, nome)
  - Valor da venda
  - Status (completa, pendente, cancelada)
  - Data e hora da venda

- **Admins (Administradores)**
  - Username, email
  - Senha (criptografada)
  - Role (admin/superadmin)

## 🛠️ Estrutura de Rotas da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Produtos
- `GET /api/products` - Listar produtos públicos (ativos)
- `GET /api/products/admin` - Listar todos produtos (admin)
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

### Planos
- `GET /api/plans` - Listar todos planos (admin)
- `GET /api/plans/product/:productId` - Listar planos por produto
- `GET /api/plans/:id` - Buscar plano por ID
- `POST /api/plans` - Criar plano (admin)
- `PUT /api/plans/:id` - Atualizar plano (admin)
- `DELETE /api/plans/:id` - Deletar plano (admin)

### Vendas
- `GET /api/sales` - Listar todas vendas (admin)
- `GET /api/sales/:id` - Buscar venda por ID
- `POST /api/sales` - Criar venda/key (admin)
- `GET /api/sales/stats/dashboard` - Estatísticas do dashboard (admin)

## 🔄 Criar Nova Venda/Key

Para criar uma nova venda (key), faça um POST para `/api/sales` com:

```json
{
  "key": "KEY-UNICA-GERADA",
  "product": "ID_DO_PRODUTO",
  "plan": "ID_DO_PLANO" (opcional),
  "userEmail": "email@usuario.com",
  "userName": "Nome do Usuário",
  "value": 99.90,
  "status": "completed"
}
```

## 📝 Notas Importantes

1. **Segurança:** Altere a senha padrão do admin após o primeiro acesso
2. **JWT_SECRET:** Configure um JWT_SECRET seguro no `.env` do servidor
3. **Imagens:** As URLs de imagem devem ser válidas e apontar para arquivos JPG
4. **Keys:** Cada key deve ser única no banco de dados
5. **Planos:** Um plano sempre deve estar associado a um produto existente

## 🎨 Interface

O painel possui uma interface moderna e minimalista com:
- Design dark theme consistente com o site
- Layout responsivo
- Sidebar navegável
- Formulários intuitivos
- Tabelas organizadas
- Modais para cadastro/edição

---

**Desenvolvido para Radiant Store** 🚀


