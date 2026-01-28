# ⚠️ CORREÇÃO URGENTE: Discord Redirect URI

## Problema Identificado

O `DISCORD_REDIRECT_URI` está configurado incorretamente! Ele precisa apontar para o **BACKEND**, não para o frontend.

## Como Corrigir

### 1. No Discord Developer Portal

Acesse: https://discord.com/developers/applications

1. Selecione sua aplicação
2. Vá em **OAuth2** → **General**
3. Em **Redirects**, você deve ter:
   ```
   http://localhost:5000/api/auth/discord/callback
   ```
   **NÃO** deve ser `http://localhost:3000?token=`

### 2. No arquivo `server/.env`

Atualize a linha `DISCORD_REDIRECT_URI`:

```env
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
```

**OU** adicione:

```env
BACKEND_URL=http://localhost:5000
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/discord/callback
```

### 3. Reinicie o servidor backend

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente
npm run dev
```

## Como Funciona Agora

1. Usuário clica em "Entrar com Discord"
2. Redireciona para Discord
3. Discord redireciona para: `http://localhost:5000/api/auth/discord/callback?code=...`
4. Backend processa o código, gera o token JWT
5. Backend redireciona para: `http://localhost:3000?token=TOKEN_AQUI`
6. Frontend captura o token e faz login

## Teste

Após fazer essas alterações:
1. Reinicie o servidor backend
2. Tente fazer login com Discord novamente
3. Verifique os logs no terminal do backend
4. Verifique o console do navegador


