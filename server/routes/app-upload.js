const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateAdmin } = require('../middleware/auth');
const { APPS, getBaseUrl } = require('../config/apps');
const appsRouter = require('./apps');
const loadAppStatuses = appsRouter.loadAppStatuses;
const saveAppStatuses = appsRouter.saveAppStatuses;

const router = express.Router();

// Configurar multer para upload de arquivos .exe
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { appId } = req.params;
    
    if (!APPS[appId]) {
      return cb(new Error('Aplicação não encontrada'));
    }

    const appDir = path.join(__dirname, '../../downloads', appId);
    
    // Criar diretório se não existir
    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true });
      console.log(`📁 Diretório criado: ${appDir}`);
    }

    cb(null, appDir);
  },
  filename: (req, file, cb) => {
    // Manter nome original do arquivo
    const originalName = file.originalname;
    cb(null, originalName);
  }
});

// Filtro para aceitar apenas arquivos .exe
const fileFilter = (req, file, cb) => {
  if (file.originalname.toLowerCase().endsWith('.exe')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos .exe são permitidos!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: fileFilter
});

// POST /api/upload/:appId - Upload de arquivo .exe (público, sem autenticação)
router.post('/:appId', upload.single('file'), async (req, res) => {
  try {
    const { appId } = req.params;
    
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
    }

    const filename = req.file.filename;
    const downloadUrl = `${getBaseUrl()}/downloads/${appId}/${filename}`;

    // Atualizar status da aplicação com nova URL de download
    const statuses = await loadAppStatuses();
    const currentStatus = statuses[appId] || { ...APPS[appId].defaultStatus };
    
    // Extrair versão do nome do arquivo se possível (ex: App-v1.2.3.exe)
    const versionMatch = filename.match(/v?(\d+\.\d+\.\d+)/i);
    const detectedVersion = versionMatch ? versionMatch[1] : null;

    // Atualizar status
    statuses[appId] = {
      ...currentStatus,
      download_url: downloadUrl,
      current_version: detectedVersion || currentStatus.current_version,
      message: `Nova versão disponível: ${filename}`
    };

    await saveAppStatuses(statuses);

    console.log(`✅ Arquivo enviado com sucesso (${appId}):`, {
      filename: filename,
      size: req.file.size,
      downloadUrl: downloadUrl
    });

    res.json({
      success: true,
      filename: filename,
      downloadUrl: downloadUrl,
      size: req.file.size,
      status: statuses[appId]
    });
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error);
    res.status(500).json({ error: error.message || 'Erro ao fazer upload do arquivo' });
  }
});

// DELETE /api/upload/:appId/:filename - Deletar arquivo (público, sem autenticação)
router.delete('/:appId/:filename', async (req, res) => {
  try {
    const { appId, filename } = req.params;
    
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    const filePath = path.join(__dirname, '../../downloads', appId, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Arquivo deletado (${appId}):`, filename);
      res.json({ success: true, message: 'Arquivo deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar arquivo' });
  }
});

module.exports = router;
