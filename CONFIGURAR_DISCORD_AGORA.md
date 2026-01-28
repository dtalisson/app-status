# ⚡ CONFIGURE AGORA - Discord OAuth

## ⚠️ Você está vendo o erro porque falta configurar as credenciais Discord!

## 📝 Passo a Passo RÁPIDO (5 minutos)

### 1️⃣ Acesse Discord Developer Portal
👉 **https://discord.com/developers/applications**

### 2️⃣ Crie Nova Aplicação
- Clique em **"New Application"**
- Nome: **"Radiant Store"** (ou qualquer nome)
- Clique **"Create"**

### 3️⃣ Configure OAuth2
- No menu lateral → **"OAuth2"**
- Em **"Redirects"** → Clique **"Add Redirect"**
- Adicione esta URL (exatamente assim):
  ```
  http://localhost:3000?token=
  ```
- Clique **"Save Changes"**

### 4️⃣ Copie as Credenciais
- Na mesma página OAuth2, você verá:
  - **Client ID** (número grande) → COPIAR
  - **Client Secret** → Se não aparecer, clique "Reset Secret" e copie

### 5️⃣ Edite o arquivo `.env`

**Abra:** `server/.env`

**Procure por estas linhas e SUBSTITUA:**

```env
DISCORD_CLIENT_ID=COLE_O_CLIENT_ID_AQUI
DISCORD_CLIENT_SECRET=COLE_O_CLIENT_SECRET_AQUI
```

**Exemplo (NÃO copie este exemplo, use seus valores reais!):**
```env
DISCORD_CLIENT_ID=123456789012345678
DISCORD_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz123456
DISCORD_REDIRECT_URI=http://localhost:3000?token=
FRONTEND_URL=http://localhost:3000
```

### 6️⃣ Reinicie o Servidor

**PARAR o servidor** (Ctrl+C no terminal onde está rodando)

**INICIAR novamente:**
```bash
cd server
npm run dev
```

### 7️⃣ Teste!

1. Acesse: http://localhost:3000
2. Clique no ícone de perfil (topo direito)
3. Clique "Entrar com Discord"
4. Autorize → Pronto! ✅

---

## 🎯 Resumo do que você precisa:

1. ✅ Client ID do Discord
2. ✅ Client Secret do Discord  
3. ✅ Adicionar no `.env`
4. ✅ Reiniciar servidor

---

## ❓ Ainda com erro?

### Verifique:
- [ ] Client ID copiado corretamente (sem espaços)
- [ ] Client Secret copiado corretamente (sem espaços)
- [ ] Redirect URI no Discord: `http://localhost:3000?token=`
- [ ] Arquivo `.env` salvo
- [ ] Servidor reiniciado após editar `.env`

### Dica:
O Discord é muito sensível com a Redirect URI. Ela deve ser **EXATAMENTE** igual ao que você colocou no Developer Portal!

---

**🚀 Após configurar, o login Discord funcionará perfeitamente!**


