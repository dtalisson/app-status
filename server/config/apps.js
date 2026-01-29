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
      message_online: 'Aplicação está online e atualizada.',
      message_offline: 'Aplicação offline para atualização.',
      message_update_required: 'Nova versão disponível. Atualize o aplicativo.'
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
      message_online: 'Aplicação está online e atualizada.',
      message_offline: 'Aplicação offline para atualização.',
      message_update_required: 'Nova versão disponível. Atualize o aplicativo.'
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
      message_online: 'Aplicação está online e atualizada.',
      message_offline: 'Aplicação offline para atualização.',
      message_update_required: 'Nova versão disponível. Atualize o aplicativo.'
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
      message_online: 'Aplicação está online e atualizada.',
      message_offline: 'Aplicação offline para atualização.',
      message_update_required: 'Nova versão disponível. Atualize o aplicativo.'
    }
  }
};

// Base URL para downloads (ajustar conforme ambiente)
const getBaseUrl = () => {
  return process.env.BASE_URL || 'https://app-status-n3ki.onrender.com';
};

module.exports = { APPS, getBaseUrl };
