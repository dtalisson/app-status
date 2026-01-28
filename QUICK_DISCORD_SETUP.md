# 🚀 Configuração Rápida Discord OAuth

## ⚡ Passo a Passo Rápido

### 1️⃣ Criar Aplicação Discord (2 minutos)

1. **Acesse:** https://discord.com/developers/applications
2. **Clique em:** "New Application"
3. **Nome:** "Radiant Store Admin" (ou qualquer nome)
4. **Clique:** "Create"

### 2️⃣ Configurar OAuth2 (1 minuto)

1. **No menu lateral:** Clique em **"OAuth2"**
2. **Em "Redirects"**, adicione estas URLs (uma por linha):
   ```
   http://localhost:3000?token=
   http://localhost:3000/admin/callback
   ```
3. **Copie:**
   - **Client ID** (número grande, está na página OAuth2)
   - **Client Secret** (clique em "Reset Secret" se necessário, depois copie)

### 3️⃣ Configurar .env (30 segundos)

**Abra:** `server/.env`

**Adicione ou edite estas linhas:**

```env
DISCORD_CLIENT_ID=COLE_SEU_CLIENT_ID_AQUI
DISCORD_CLIENT_SECRET=COLE_SEU_CLIENT_SECRET_AQUI
DISCORD_REDIRECT_URI=http://localhost:3000?token=
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Substitua `COLE_SEU_CLIENT_ID_AQUI` pelo Client ID real
- Substitua `COLE_SEU_CLIENT_SECRET_AQUI` pelo Client Secret real
- **NÃO** compartilhe o Client Secret publicamente

### 4️⃣ Reiniciar Servidor

**Pare o servidor** (Ctrl+C) e **inicie novamente:**

```bash
cd server
npm run dev
```

### 5️⃣ Testar

1. Acesse o site: http://localhost:3000
2. Clique no ícone de perfil no Header
3. Clique em "Entrar com Discord"
4. Autorize a aplicação
5. Pronto! ✅

---

## 🔒 Opcional: Restringir Acesso

Se quiser que apenas Discord IDs específicos possam fazer login:

1. **Encontre seu Discord ID:**
   - Discord Settings → Advanced → Enable Developer Mode
   - Clique direito no seu perfil → "Copy ID"

2. **Adicione ao .env:**
   ```env
   ALLOWED_DISCORD_IDS=SEU_DISCORD_ID_AQUI
   ```

3. **Múltiplos IDs:** Separe por vírgula:
   ```env
   ALLOWED_DISCORD_IDS=123456789,987654321
   ```

---

## ❓ Problemas?

### Erro: "Discord OAuth não configurado"
- ✅ Verifique se as variáveis estão no `.env`
- ✅ Verifique se não há espaços extras
- ✅ Reinicie o servidor após editar o `.env`

### Erro: "Invalid redirect_uri"
- ✅ Verifique se a URL está exatamente como configurado no Discord
- ✅ Certifique-se de ter adicionado `http://localhost:3000?token=` nas Redirects

### Erro: "Invalid client"
- ✅ Verifique se copiou o Client ID e Secret corretamente
- ✅ Certifique-se de não ter espaços extras antes/depois

---

**📖 Para mais detalhes, veja `DISCORD_SETUP.md`**


