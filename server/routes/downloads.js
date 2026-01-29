const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { APPS } = require('../config/apps');

const router = express.Router();

// GET /downloads/:appId/:filename - Serve arquivo .exe para download
router.get('/:appId/:filename', async (req, res) => {
  try {
    const { appId, filename } = req.params;

    // Validar aplicação
    if (!APPS[appId]) {
      return res.status(404).json({ error: 'Aplicação não encontrada' });
    }

    // Validar extensão .exe
    if (!filename.endsWith('.exe')) {
      return res.status(400).json({ error: 'Apenas arquivos .exe são permitidos' });
    }

    // Caminho do arquivo
    const filePath = path.join(__dirname, '../../downloads', appId, filename);

    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    // Obter informações do arquivo
    const stats = await fs.stat(filePath);

    // Headers para download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

    // Enviar arquivo
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);

  } catch (err) {
    console.error('Erro ao servir arquivo:', err);
    res.status(500).json({ error: 'Erro ao servir arquivo' });
  }
});

module.exports = router;
