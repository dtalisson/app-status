const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Discord OAuth2 Configuration
// Nota: Carregamos diretamente do process.env em cada requisição para garantir valores atualizados
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Iniciar fluxo OAuth Discord
router.get('/auth/discord', (req, res) => {
  // Re-carregar variáveis para garantir que estão atualizadas
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  // O redirect URI deve apontar para o BACKEND callback, não para o frontend!
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${backendUrl}/api/auth/discord/callback`;
  
  console.log('🔍 Tentando iniciar Discord OAuth...');
  console.log('  Client ID presente:', !!clientId);
  console.log('  Client Secret presente:', !!clientSecret);
  console.log('  Redirect URI:', redirectUri);
  
  if (!clientId || !clientSecret) {
    console.error('❌ Discord OAuth não configurado!');
    console.error('  Client ID:', clientId || 'VAZIO');
    console.error('  Client Secret:', clientSecret ? 'Presente (oculto)' : 'VAZIO');
    console.error('Configure DISCORD_CLIENT_ID e DISCORD_CLIENT_SECRET no arquivo server/.env');
    console.error('Veja DISCORD_SETUP.md para instruções completas');
    
    // Retornar página HTML com instruções
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Discord OAuth não configurado</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(8, 164, 247, 0.3);
            border-radius: 16px;
            padding: 40px;
            max-width: 600px;
          }
          h1 { color: #ef4444; margin-top: 0; }
          h2 { color: #08a4f7; margin-top: 24px; }
          code {
            background: rgba(0, 0, 0, 0.3);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
          }
          ol { line-height: 1.8; }
          a { color: #08a4f7; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Discord OAuth não configurado</h1>
          <p>Para usar o login com Discord, você precisa configurar as credenciais:</p>
          
          <h2>1. Criar aplicação no Discord</h2>
          <ol>
            <li>Acesse <a href="https://discord.com/developers/applications" target="_blank">Discord Developer Portal</a></li>
            <li>Clique em <strong>"New Application"</strong></li>
            <li>Dê um nome (ex: "Radiant Store Admin")</li>
            <li>Clique em <strong>"Create"</strong></li>
          </ol>
          
          <h2>2. Configurar OAuth2</h2>
          <ol>
            <li>No menu lateral, clique em <strong>"OAuth2"</strong></li>
            <li>Em <strong>"Redirects"</strong>, adicione:
              <br><code>http://localhost:3000?token=</code>
              <br><code>http://localhost:3000/admin/callback</code>
            </li>
            <li>Copie o <strong>Client ID</strong> e o <strong>Client Secret</strong></li>
          </ol>
          
          <h2>3. Adicionar ao .env</h2>
          <p>Edite o arquivo <code>server/.env</code> e adicione:</p>
          <pre style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; overflow-x: auto;">
DISCORD_CLIENT_ID=seu_client_id_aqui
DISCORD_CLIENT_SECRET=seu_client_secret_aqui
DISCORD_REDIRECT_URI=http://localhost:3000?token=
FRONTEND_URL=http://localhost:3000</pre>
          
          <h2>4. Reiniciar servidor</h2>
          <p>Após salvar o .env, reinicie o servidor Node.js.</p>
          
          <p style="margin-top: 24px; color: #fbbf24;">
            📖 Veja <code>DISCORD_SETUP.md</code> para instruções detalhadas.
          </p>
        </div>
      </body>
      </html>
    `);
  }

  const scopes = ['identify', 'email'];
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('%20')}`;
  
  console.log('✅ Redirecionando para Discord OAuth...');
  console.log('  URL completa:', discordAuthUrl);
  console.log('  Redirect URI usado:', redirectUri);
  console.log('  Redirect URI codificado:', encodeURIComponent(redirectUri));
  res.redirect(discordAuthUrl);
});

// Callback do Discord OAuth
router.get('/auth/discord/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/admin/login?error=no_code`);
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    // O redirect URI deve apontar para o BACKEND callback
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${backendUrl}/api/auth/discord/callback`;
    
    if (!clientId || !clientSecret) {
      return res.redirect(`${FRONTEND_URL}/admin/login?error=not_configured`);
    }

    // Trocar code por access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Buscar dados do usuário Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const discordUser = userResponse.data;
    const discordId = discordUser.id;
    const discordUsername = `${discordUser.username}#${discordUser.discriminator}`;
    const discordEmail = discordUser.email;
    const discordAvatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`
      : null;

    // Verificar se usuário existe pelo Discord ID
    let user = await User.findOne({ discordId });

    if (!user) {
      // Verificar se existe por email (para migrar usuário existente)
      user = await User.findOne({ email: discordEmail });
      
      if (user) {
        // Atualizar usuário existente com Discord
        user.discordId = discordId;
        user.discordUsername = discordUsername;
        user.discordAvatar = discordAvatar;
        user.authMethod = 'discord';
        await user.save();
      } else {
        // Criar novo usuário para qualquer pessoa que fizer login pelo Discord
        console.log('Discord callback - Criando novo usuário para Discord ID:', discordId);
        
        user = await User.create({
          discordId,
          discordUsername,
          discordAvatar,
          email: discordEmail,
          username: discordUser.username,
          authMethod: 'discord',
        });
        
        console.log('Discord callback - Usuário criado com sucesso:', {
          id: user._id,
          discordId: user.discordId,
          username: user.discordUsername
        });
      }
    } else {
      // Atualizar dados do Discord
      user.discordUsername = discordUsername;
      user.discordAvatar = discordAvatar;
      if (!user.email && discordEmail) {
        user.email = discordEmail;
      }
      await user.save();
    }

    console.log('Discord callback - Usuário encontrado/criado:', {
      id: user._id,
      discordId: user.discordId,
      username: user.username || user.discordUsername
    });

    // Verificar se user._id existe
    if (!user || !user._id) {
      console.error('❌ ERRO: Usuário ou User._id não existe!');
      return res.redirect(`${FRONTEND_URL}?error=user_not_found`);
    }

    // Verificar se JWT_SECRET existe
    if (!JWT_SECRET) {
      console.error('❌ ERRO: JWT_SECRET não está definido!');
      return res.redirect(`${FRONTEND_URL}/admin/login?error=jwt_secret_missing`);
    }

    // Gerar JWT token
    try {
      const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
      
      console.log('Discord callback - Token gerado:', token ? 'Token existe' : 'Token NULL');
      console.log('Discord callback - Token length:', token ? token.length : 0);
      
      if (!token || token === 'null' || token === 'undefined') {
        console.error('❌ ERRO: Token inválido gerado!');
        return res.redirect(`${FRONTEND_URL}/admin/login?error=token_generation_failed`);
      }

      // Redirecionar para frontend com token na URL
      const redirectUrl = `${FRONTEND_URL}?token=${encodeURIComponent(token)}`;
      console.log('Discord callback - Redirecionando para frontend');
      console.log('Discord callback - Redirect URL (primeiros 150 chars):', redirectUrl.substring(0, 150));
      res.redirect(redirectUrl);
    } catch (tokenError) {
      console.error('❌ ERRO ao gerar token JWT:', tokenError);
      return res.redirect(`${FRONTEND_URL}/admin/login?error=token_error`);
    }
  } catch (error) {
    console.error('Erro no callback Discord:', error);
    res.redirect(`${FRONTEND_URL}/admin/login?error=discord_error`);
  }
});

module.exports = router;

