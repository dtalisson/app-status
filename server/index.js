const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- Estado em memória para /api/status ---
// Estado "global" (sem aplicação específica)
const defaultStatusState = {
  status: 'online', // "online" ou "offline"
  current_version: '1.0.0',
  min_version: '1.0.0',
  maintenance: false,
  message: 'Aplicação está online e atualizada.',
};

let statusState = { ...defaultStatusState };

// Estados por aplicação (ex.: valorant, cs2...)
// Estrutura: { [appName]: StatusState }
const appStatusStates = {};

const getAppStatus = (appName) => {
  const key = String(appName || '').toLowerCase();
  if (!key) return statusState;

  if (!appStatusStates[key]) {
    appStatusStates[key] = { ...defaultStatusState };
  }
  return appStatusStates[key];
};

const updateStatusObject = (target, updates) => {
  return { ...target, ...updates };
};

// Clientes conectados via SSE
const statusClients = new Set();

// --- Rotas de aplicações e downloads (DEVEM VIR ANTES DAS ROTAS ESPECÍFICAS) ---
const appsRouter = require('./routes/apps');
const downloadsRouter = require('./routes/downloads');
const appUploadRouter = require('./routes/app-upload');

// Rotas de aplicações
app.use('/api/apps', appsRouter);
// Rotas de status com :appId (DEVEM VIR ANTES das rotas sem parâmetros)
app.use('/api/status', appsRouter.statusRouter);
app.use('/downloads', downloadsRouter);
app.use('/api/upload', appUploadRouter);

// --- Endpoints de status simples (rotas específicas sem parâmetros) ---

// GET /api/status/frontend — status da aplicação frontend (React)
app.get('/api/status/frontend', (req, res) => {
  try {
    const pkg = require('../package.json');
    res.json({
      status: 'online',
      current_version: pkg.version || '1.0.0',
      min_version: '1.0.0',
      maintenance: false,
      message: 'Frontend disponível e em execução.',
    });
  } catch (err) {
    console.error('Erro em GET /api/status/frontend:', err);
    res.status(500).json({ status: 'offline', message: 'Erro ao obter status do frontend.' });
  }
});

// SSE: GET /api/status/stream
app.get('/api/status/stream', (req, res) => {
  // Headers SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Enviar estado atual imediatamente
  res.write(`data: ${JSON.stringify(statusState)}\n\n`);

  const client = { id: Date.now(), res };
  statusClients.add(client);

  console.log(`[SSE] Cliente conectado (${client.id}). Total: ${statusClients.size}`);

  req.on('close', () => {
    statusClients.delete(client);
    console.log(`[SSE] Cliente desconectado (${client.id}). Total: ${statusClients.size}`);
  });
});

// GET /api/status (sem parâmetros - compatibilidade)
// Se ?app=valorant, retorna o status SOMENTE dessa aplicação.
// Sem ?app, retorna o status global (compatível com implementação antiga).
app.get('/api/status', (req, res) => {
  try {
    const appName = req.query.app;
    const state = getAppStatus(appName);
    res.json(state);
  } catch (err) {
    console.error('Erro em GET /api/status:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/status (sem parâmetros - compatibilidade)
// Se ?app=valorant, atualiza SOMENTE essa aplicação.
// Sem ?app, atualiza o status global (compatível com implementação antiga).
app.post('/api/status', (req, res) => {
  try {
    const allowedFields = ['status', 'current_version', 'min_version', 'maintenance', 'message'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    const appName = req.query.app;

    if (appName) {
      const key = String(appName).toLowerCase();
      const current = getAppStatus(key);
      const newState = updateStatusObject(current, updates);
      appStatusStates[key] = newState;
      console.log(`[STATUS] Atualizado (${key}):`, newState);

      // Por enquanto, SSE continua emitindo apenas o estado global
    } else {
      statusState = updateStatusObject(statusState, updates);
      console.log('[STATUS] Atualizado (global):', statusState);

      // Notificar todos os clientes SSE conectados com o estado global
      const payload = `data: ${JSON.stringify(statusState)}\n\n`;
      statusClients.forEach((client) => {
        try {
          client.res.write(payload);
        } catch (e) {
          // Se falhar a escrita, remove o cliente
          statusClients.delete(client);
        }
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Erro em POST /api/status:', err);
    res.status(500).json({ ok: false, error: 'Erro interno' });
  }
});
app.use('/downloads', downloadsRouter);
app.use('/api/upload', appUploadRouter);

// --- Raiz: JSON para app (Accept: application/json), HTML para navegador ---
// App C++ chama GET / e espera JSON; navegador abre / e espera a página.
const buildPath = path.join(__dirname, '../build');

app.get('/', (req, res) => {
  const accept = (req.get('Accept') || '').toLowerCase();
  if (accept.includes('application/json')) {
    res.set('Content-Type', 'application/json');
    return res.status(200).json(statusState);
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});

// --- Servir frontend React compilado (build) ---
// IMPORTANTE: Servir arquivos estáticos ANTES da rota catch-all
app.use(express.static(buildPath));

// Qualquer rota que NÃO comece com /api ou /downloads cai no index.html do React
// Isso permite que o React Router gerencie as rotas do frontend
app.get(/^(?!\/api|\/downloads).*/, (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
