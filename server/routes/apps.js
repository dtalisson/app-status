const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { authenticateAdmin } = require('../middleware/auth');
const { APPS, getBaseUrl } = require('../config/apps');

const router = express.Router();
const statusRouter = express.Router();

// Arquivo JSON para persistir status das aplicações
const STATUS_FILE = path.join(__dirname, '../data/app-status.json');

// Carregar status das aplicações do arquivo
const loadAppStatuses = async () => {
  try {
    const data = await fs.readFile(STATUS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Se arquivo não existe, criar com valores padrão
    const defaultStatuses = {};
    Object.keys(APPS).forEach(appId => {
      defaultStatuses[appId] = { ...APPS[appId].defaultStatus };
    });
    await saveAppStatuses(defaultStatuses);
    return defaultStatuses;
  }
};

// Salvar status das aplicações no arquivo
const saveAppStatuses = async (statuses) => {
  try {
    const dataDir = path.dirname(STATUS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(STATUS_FILE, JSON.stringify(statuses, null, 2));
  } catch (err) {
    console.error('Erro ao salvar status:', err);
    throw err;
  }
};

// Obter arquivo mais recente de uma aplicação
const getLatestFile = async (appId) => {
  const appDir = path.join(__dirname, '../../downloads', appId);
  try {
    const files = await fs.readdir(appDir);
    const exeFiles = files.filter(f => f.endsWith('.exe'));
    if (exeFiles.length === 0) return null;
    
    // Ordenar por data de modificação (mais recente primeiro)
    const filesWithStats = await Promise.all(
      exeFiles.map(async (file) => {
        const filePath = path.join(appDir, file);
        const stats = await fs.stat(filePath);
        return { file, mtime: stats.mtime };
      })
    );
    
    filesWithStats.sort((a, b) => b.mtime - a.mtime);
    return filesWithStats[0].file;
  } catch (err) {
    return null;
  }
};

// Utilitário simples para comparar versões no formato X.Y.Z
const compareVersions = (v1 = '', v2 = '') => {
  const a = String(v1).split('.').map((n) => parseInt(n, 10) || 0);
  const b = String(v2).split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const na = a[i] || 0;
    const nb = b[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
};

// GET /api/apps - Lista todas as aplicações
router.get('/', async (req, res) => {
  try {
    const statuses = await loadAppStatuses();
    const appsList = Object.keys(APPS).map(appId => ({
      id: appId,
      name: APPS[appId].name,
      status: statuses[appId] || APPS[appId].defaultStatus
    }));
    res.json(appsList);
  } catch (err) {
    console.error('Erro ao listar aplicações:', err);
    res.status(500).json({ error: 'Erro ao listar aplicações' });
  }
});

// GET /api/status/:appId - Retorna status de uma aplicação específica
// Esta rota será montada em /api/status no index.js
statusRouter.get('/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    const statuses = await loadAppStatuses();
    let appStatus = statuses[appId] || { ...APPS[appId].defaultStatus };

    // Remover campos obsoletos da resposta
    delete appStatus.release_notes;
    delete appStatus.download_url;

    // Detectar se o cliente informou sua versão (?version= ou ?client_version=)
    const clientVersion = req.query.version || req.query.client_version;
    let updateRequired = false;

    if (clientVersion) {
      const current = appStatus.current_version;
      const min = appStatus.min_version;

      if (min && compareVersions(clientVersion, min) < 0) {
        // Abaixo da versão mínima -> update obrigatório
        updateRequired = true;
      } else if (current && compareVersions(clientVersion, current) < 0) {
        // Abaixo da versão atual -> update recomendado/necessário
        updateRequired = true;
      }
    }

    // Escolher mensagem correta
    let effectiveMessage;
    if (updateRequired) {
      effectiveMessage =
        appStatus.message_update_required ??
        appStatus.message ??
        'Nova versão disponível. Atualize o aplicativo.';
    } else {
      const status = appStatus.status || 'online';
      effectiveMessage =
        status === 'online'
          ? (appStatus.message_online ?? appStatus.message ?? '')
          : (appStatus.message_offline ?? appStatus.message ?? '');
    }

    appStatus = {
      ...appStatus,
      message: effectiveMessage,
    };

    if (clientVersion) {
      appStatus.update_required = updateRequired;
      appStatus.client_version = clientVersion;
    }

    res.json(appStatus);
  } catch (err) {
    console.error('Erro ao buscar status:', err);
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

statusRouter.post('/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    const statuses = await loadAppStatuses();
    const currentStatus = statuses[appId] || { ...APPS[appId].defaultStatus };

    // Campos permitidos para atualização
    const allowedFields = ['status', 'current_version', 'min_version', 'maintenance', 'message', 'message_online', 'message_offline', 'message_update_required'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Atualizar status
    const newStatus = { ...currentStatus, ...updates };

    // Limpar campos obsoletos
    delete newStatus.release_notes;
    delete newStatus.download_url;

    // Definir "message" conforme o status (para resposta e clientes que leem só message)
    const status = newStatus.status || 'online';
    newStatus.message = status === 'online'
      ? (newStatus.message_online ?? newStatus.message ?? '')
      : (newStatus.message_offline ?? newStatus.message ?? '');

    statuses[appId] = newStatus;
    await saveAppStatuses(statuses);

    console.log(`[STATUS] Atualizado (${appId}):`, newStatus);
    res.json({ ok: true, status: newStatus });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ ok: false, error: 'Erro ao atualizar status' });
  }
});

// GET /api/apps/:appId/files - Lista arquivos de uma aplicação (público, sem autenticação)
router.get('/:appId/files', async (req, res) => {
  try {
    const { appId } = req.params;
    
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    const appDir = path.join(__dirname, '../../downloads', appId);
    try {
      const files = await fs.readdir(appDir);
      const exeFiles = files.filter(f => f.endsWith('.exe'));
      
      const filesWithInfo = await Promise.all(
        exeFiles.map(async (file) => {
          const filePath = path.join(appDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        })
      );

      // Ordenar por data de modificação (mais recente primeiro)
      filesWithInfo.sort((a, b) => b.modified - a.modified);
      
      res.json({ files: filesWithInfo });
    } catch (err) {
      // Diretório não existe, retornar vazio
      res.json({ files: [] });
    }
  } catch (err) {
    console.error('Erro ao listar arquivos:', err);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Exportar funções para uso em outras rotas
module.exports = router;
module.exports.statusRouter = statusRouter;
module.exports.loadAppStatuses = loadAppStatuses;
module.exports.saveAppStatuses = saveAppStatuses;
