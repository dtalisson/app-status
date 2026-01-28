# 🔄 REINICIE O SERVIDOR AGORA!

## ⚠️ IMPORTANTE: O servidor PRECISA ser reiniciado!

Após editar o arquivo `.env`, você **SEMPRE** precisa reiniciar o servidor Node.js para as mudanças terem efeito.

## 📋 Passos:

### 1. PARAR o servidor atual
- Vá até o terminal onde o servidor está rodando
- Pressione `Ctrl + C` para parar

### 2. INICIAR novamente
```bash
cd server
npm run dev
```

### 3. Verificar se carregou as variáveis
Quando o servidor iniciar, você deve ver no console:
```
🔍 Verificando variáveis Discord:
  DISCORD_CLIENT_ID: ✅ Carregado
  DISCORD_CLIENT_SECRET: ✅ Carregado
  DISCORD_REDIRECT_URI: http://localhost:3000?token=
  FRONTEND_URL: http://localhost:3000
```

### 4. Testar novamente
- Acesse: http://localhost:3000
- Clique no ícone de perfil
- Clique "Entrar com Discord"
- ✅ Deve funcionar!

---

## ❓ Ainda não funciona?

Verifique:
1. ✅ Servidor foi reiniciado após editar .env?
2. ✅ As mensagens de debug aparecem no console do servidor?
3. ✅ O arquivo `.env` está em `server/.env` (não em outro lugar)?
4. ✅ Não há espaços extras nas variáveis do .env?

---

**🚀 Reinicie o servidor e teste novamente!**


