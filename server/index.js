const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// --- Estado em memória para /api/status ---
let statusState = {
  status: 'online',           // "online" ou "offline"
  current_version: '1.0.0',
  min_version: '1.0.0',
  maintenance: false,
  message: 'Aplicação está online e atualizada.',
};

// Clientes conectados via SSE
const statusClients = new Set();

// --- Endpoints de status simples ---

// GET /api/status
app.get('/api/status', (_req, res) => {
  try {
    res.json(statusState);
  } catch (err) {
    console.error('Erro em GET /api/status:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/status (admin simples, sem auth)
app.post('/api/status', (req, res) => {
  try {
    const allowedFields = ['status', 'current_version', 'min_version', 'maintenance', 'message'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    statusState = { ...statusState, ...updates };

    console.log('[STATUS] Atualizado:', statusState);

    // Notificar todos os clientes SSE conectados
    const payload = `data: ${JSON.stringify(statusState)}\n\n`;
    statusClients.forEach((client) => {
      try {
        client.res.write(payload);
      } catch (e) {
        // Se falhar a escrita, remove o cliente
        statusClients.delete(client);
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Erro em POST /api/status:', err);
    res.status(500).json({ ok: false, error: 'Erro interno' });
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

// --- Servir frontend React compilado (build) ---
// Em produção, o React é compilado para a pasta ../build (raiz do projeto).
// Este bloco faz o Node servir tanto a API quanto o frontend na MESMA porta.
const buildPath = path.join(__dirname, '../build');

app.use(express.static(buildPath));

// Qualquer rota que NÃO comece com /api cai no index.html do React
// Usamos uma regex porque o Express 5 não aceita mais '*' puro nas rotas.
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Servidor ouvindo em http://localhost:${port}`);
});
