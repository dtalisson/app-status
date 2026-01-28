# 🔐 Configuração Discord OAuth2

## Passo a Passo para Configurar Login com Discord

### 1. Criar Aplicação no Discord Developer Portal

1. Acesse: https://discord.com/developers/applications
2. Clique em **"New Application"**
3. Dê um nome para sua aplicação (ex: "Radiant Store Admin")
4. Clique em **"Create"**

### 2. Configurar OAuth2

1. No menu lateral, clique em **"OAuth2"**
2. Em **"Redirects"**, adicione a URL de callback:
   ```
   http://localhost:3000/admin/callback
   ```
   (Para produção, adicione também sua URL de produção)
3. Copie o **Client ID** e o **Client Secret**

### 3. Adicionar ao .env

Adicione as seguintes variáveis ao arquivo `server/.env`:

```env
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui
DISCORD_REDIRECT_URI=http://localhost:3000/admin/callback
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar Permissões (Opcional)

Se quiser restringir o acesso apenas a Discord IDs específicos, adicione ao `.env`:

```env
ALLOWED_DISCORD_IDS=123456789012345678,987654321098765432
```

(IDs separados por vírgula)

### 5. Scopes Utilizados

O sistema utiliza os seguintes scopes:
- `identify` - Para obter username e avatar
- `email` - Para obter email do usuário

### 6. Como Funciona

1. Usuário clica em **"Entrar com Discord"**
2. É redirecionado para Discord para autorizar
3. Discord redireciona de volta para `/admin/callback` com um código
4. Backend troca o código por um access token
5. Backend busca dados do usuário (ID, username, email, avatar)
6. Sistema verifica se o admin existe ou cria um novo
7. Gera JWT token e redireciona para dashboard

### 7. Primeiro Admin via Discord

Quando um usuário Discord faz login pela primeira vez:
- Se `ALLOWED_DISCORD_IDS` estiver configurado, apenas IDs na lista poderão fazer login
- Se não estiver configurado, qualquer usuário Discord poderá criar uma conta de admin
- **Recomendação:** Configure `ALLOWED_DISCORD_IDS` com o seu Discord ID

### 8. Encontrar seu Discord ID

1. Ative o modo desenvolvedor no Discord: Settings → Advanced → Developer Mode
2. Clique com botão direito no seu perfil → "Copy ID"

---

**⚠️ IMPORTANTE:** 
- Não compartilhe o `DISCORD_CLIENT_SECRET`
- Use variáveis de ambiente para todas as credenciais
- Configure URLs de produção corretas quando fizer deploy


