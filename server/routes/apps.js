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

// Construir download URL
const buildDownloadUrl = (appId, filename) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/downloads/${appId}/${filename}`;
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
    const allowedFields = ['status', 'current_version', 'min_version', 'maintenance', 'message', 'release_notes'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Atualizar status
    const newStatus = { ...currentStatus, ...updates };

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
