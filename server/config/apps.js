// Configuração das aplicações Windows
const APPS = {
  'slottedaimbot': {
    id: 'slottedaimbot',
    name: 'Valorant AimPrivate',
    defaultStatus: {
      status: 'online',
      current_version: '1.0.0',
      min_version: '1.0.0',
      maintenance: false,
      message: 'Aplicação está online e atualizada.',
      download_url: '',
      release_notes: 'Versão inicial'
    }
  },
  'valorant-aimbot-color': {
    id: 'valorant-aimbot-color',
    name: 'Valorant Aimbot Color',
    defaultStatus: {
      status: 'online',
      current_version: '1.0.0',
      min_version: '1.0.0',
      maintenance: false,
      message: 'Aplicação está online e atualizada.',
      download_url: '',
      release_notes: 'Versão inicial'
    }
  },
  'cs2-elevate': {
    id: 'cs2-elevate',
    name: 'Counter Strike 2 Elevate',
    defaultStatus: {
      status: 'online',
      current_version: '1.0.0',
      min_version: '1.0.0',
      maintenance: false,
      message: 'Aplicação está online e atualizada.',
      download_url: '',
      release_notes: 'Versão inicial'
    }
  },
  'vgc-bypass': {
    id: 'vgc-bypass',
    name: 'VGC Bypass',
    defaultStatus: {
      status: 'online',
      current_version: '1.0.0',
      min_version: '1.0.0',
      maintenance: false,
      message: 'Aplicação está online e atualizada.',
      download_url: '',
      release_notes: 'Versão inicial'
    }
  }
};

// Base URL para downloads (ajustar conforme ambiente)
const getBaseUrl = () => {
  return process.env.BASE_URL || 'https://app-status-n3ki.onrender.com';
};

module.exports = { APPS, getBaseUrl };
