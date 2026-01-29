import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaLink, FaCopy } from 'react-icons/fa';
import './Home.css';

const applications = [
  { id: 'slottedaimbot', key: 'slottedaimbot', label: 'Valorant AimPrivate' },
  { id: 'valorant-aimbot-color', key: 'valorant-aimbot-color', label: 'Valorant Aimbot Color' },
  { id: 'cs2-elevate', key: 'cs2-elevate', label: 'Counter Strike 2 Elevate' },
  { id: 'vgc-bypass', key: 'vgc-bypass', label: 'VGC Bypass' },
];

const Home = () => {
  const [statusByApp, setStatusByApp] = useState({});
  const [updatingByApp, setUpdatingByApp] = useState({});
  const [errorByApp, setErrorByApp] = useState({});

  // Buscar status inicial de todas as aplicações usando novo endpoint
  useEffect(() => {
    const fetchStatusForApp = async (app) => {
      const appKey = app.key;
      setErrorByApp((prev) => ({ ...prev, [appKey]: '' }));
      setUpdatingByApp((prev) => ({ ...prev, [appKey]: true }));

      try {
        const res = await fetch(`/api/status/${app.id}`);
        if (!res.ok) throw new Error('Falha ao buscar status');
        const data = await res.json();
        setStatusByApp((prev) => ({ ...prev, [appKey]: data }));
      } catch (err) {
        console.error(`Erro ao buscar /api/status/${app.id}:`, err);
        setErrorByApp((prev) => ({
          ...prev,
          [appKey]: 'Não foi possível carregar o status.',
        }));
      } finally {
        setUpdatingByApp((prev) => ({ ...prev, [appKey]: false }));
      }
    };

    applications.forEach(fetchStatusForApp);
  }, []);

  const handleChangeStatus = async (app, newStatus) => {
    const appKey = app.key;
    const currentStatus = statusByApp[appKey];
    if (!currentStatus) return;

    setUpdatingByApp((prev) => ({ ...prev, [appKey]: true }));
    setErrorByApp((prev) => ({ ...prev, [appKey]: '' }));

    try {
      const res = await fetch(`/api/status/${app.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
        },
        body: JSON.stringify({
          status: newStatus,
          message:
            newStatus === 'online'
              ? 'Aplicação está online e atualizada.'
              : 'Aplicação offline para atualização.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Erro ao atualizar status');
      }

      setStatusByApp((prev) => ({
        ...prev,
        [appKey]: {
          ...(prev[appKey] || {}),
          status: newStatus,
          message:
            newStatus === 'online'
              ? 'Aplicação está online e atualizada.'
              : 'Aplicação offline para atualização.',
        },
      }));
    } catch (err) {
      console.error('Erro ao atualizar /api/status:', err);
      setErrorByApp((prev) => ({
        ...prev,
        [appKey]: 'Erro ao atualizar status.',
      }));
    } finally {
      setUpdatingByApp((prev) => ({ ...prev, [appKey]: false }));
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'online') return <FaCheckCircle className="home-status-badge-icon" />;
    if (status === 'degraded') return <FaExclamationTriangle className="home-status-badge-icon" />;
    return <FaTimesCircle className="home-status-badge-icon" />;
  };

  const getApiUrl = (appId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/status/${appId}`;
  };

  const handleCopyApiUrl = async (appId) => {
    const apiUrl = getApiUrl(appId);
    try {
      await navigator.clipboard.writeText(apiUrl);
      alert('URL da API copiada para a área de transferência!');
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = apiUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('URL da API copiada para a área de transferência!');
      } catch (e) {
        alert('Erro ao copiar. URL: ' + apiUrl);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleOpenApiUrl = (appId) => {
    const apiUrl = getApiUrl(appId);
    window.open(apiUrl, '_blank');
  };

  return (
    <div className="Home" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Header />
      <ParticlesCanvas />
      <div className="home-status-container">
        <div className="home-status-wrapper">
          <div className="home-status-header">
            <h1>Status das Aplicações</h1>
          </div>

          <div className="home-status-grid">
            {applications.map((app) => {
              const appKey = app.key;
              const appStatus = statusByApp[appKey];
              const isUpdating = !!updatingByApp[appKey];
              const error = errorByApp[appKey];
              const currentMode = appStatus?.status || 'online';

              return (
                <div key={appKey} className="home-status-card">
                  <div className="home-status-card-header">
                    <div className="home-status-card-title">
                      <h3>{app.label}</h3>
                    </div>
                    <span className={`home-status-badge ${currentMode}`}>
                      {getStatusIcon(currentMode)}
                      {currentMode === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  <div className="home-status-controls">
                    <label htmlFor={`status-select-${appKey}`}>Modo:</label>
                    <select
                      id={`status-select-${appKey}`}
                      className="home-status-select"
                      value={currentMode}
                      onChange={(e) => handleChangeStatus(app, e.target.value)}
                      disabled={!appStatus || isUpdating}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                    {isUpdating && <span className="home-status-loading">Atualizando...</span>}
                  </div>

                  {appStatus && (
                    <pre className="home-status-json">
{JSON.stringify(appStatus, null, 2)}
                    </pre>
                  )}

                  {error && <div className="home-status-error">{error}</div>}

                  <div className="home-status-api-section">
                    <div className="api-url-display">
                      <FaLink className="api-icon" />
                      <span className="api-url-text">{getApiUrl(app.id)}</span>
                    </div>
                    <div className="api-actions">
                      <button
                        className="btn-api-copy"
                        onClick={() => handleCopyApiUrl(app.id)}
                        title="Copiar URL da API"
                      >
                        <FaCopy /> Copiar URL
                      </button>
                      <button
                        className="btn-api-open"
                        onClick={() => handleOpenApiUrl(app.id)}
                        title="Abrir URL da API em nova aba"
                      >
                        <FaLink /> Abrir API
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

