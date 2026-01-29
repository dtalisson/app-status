import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Status.css';

const applications = [
  { id: '', key: 'global', label: 'Geral' },
  { id: 'valorant', key: 'valorant', label: 'VALORANT' },
  { id: 'cs2', key: 'cs2', label: 'CS2' },
  { id: 'fortnite', key: 'fortnite', label: 'FORTNITE' },
];

const Status = () => {
  const [frontendStatus, setFrontendStatus] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [frontendError, setFrontendError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [statusByApp, setStatusByApp] = useState({});
  const [updatingByApp, setUpdatingByApp] = useState({});
  const [errorByApp, setErrorByApp] = useState({});

  const buildUrl = (appId) =>
    appId ? `/api/status?app=${encodeURIComponent(appId)}` : '/api/status';

  // Buscar status do Frontend e do Backend na mesma página
  useEffect(() => {
    const fetchFrontend = async () => {
      setFrontendError('');
      try {
        const res = await fetch('/api/status/frontend');
        if (!res.ok) throw new Error('Falha ao buscar status');
        const data = await res.json();
        setFrontendStatus(data);
      } catch (err) {
        console.error('Erro ao buscar /api/status/frontend:', err);
        setFrontendError('Não foi possível carregar o status do frontend.');
      }
    };
    const fetchBackend = async () => {
      setBackendError('');
      try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('Falha ao buscar status');
        const data = await res.json();
        setBackendStatus(data);
      } catch (err) {
        console.error('Erro ao buscar /api/status:', err);
        setBackendError('Não foi possível carregar o status do backend.');
      }
    };
    fetchFrontend();
    fetchBackend();
  }, []);

  const fetchStatusForApp = async (app) => {
    const appKey = app.key;
    setErrorByApp((prev) => ({ ...prev, [appKey]: '' }));
    setUpdatingByApp((prev) => ({ ...prev, [appKey]: true }));

    try {
      const res = await fetch(buildUrl(app.id));
      if (!res.ok) throw new Error('Falha ao buscar status');
      const data = await res.json();
      setStatusByApp((prev) => ({ ...prev, [appKey]: data }));
    } catch (err) {
      console.error('Erro ao buscar /api/status:', err);
      setErrorByApp((prev) => ({
        ...prev,
        [appKey]: 'Não foi possível carregar o status.',
      }));
    } finally {
      setUpdatingByApp((prev) => ({ ...prev, [appKey]: false }));
    }
  };

  useEffect(() => {
    applications.forEach((app) => {
      fetchStatusForApp(app);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeStatus = async (app, newStatus) => {
    const appKey = app.key;
    const currentStatus = statusByApp[appKey];
    if (!currentStatus) return;

    setUpdatingByApp((prev) => ({ ...prev, [appKey]: true }));
    setErrorByApp((prev) => ({ ...prev, [appKey]: '' }));

    try {
      const res = await fetch(buildUrl(app.id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    if (status === 'online') return <FaCheckCircle className="status-icon operational" />;
    if (status === 'degraded') return <FaExclamationTriangle className="status-icon degraded" />;
    return <FaTimesCircle className="status-icon down" />;
  };

  return (
    <div className="status-page">
      <Header />
      <div className="status-container">
        <div className="status-content">
          <div className="status-header">
            <h1>Status das Aplicações</h1>
            <p>
              Controle rápido do endpoint <code>/api/status</code> para cada jogo/app.
            </p>
          </div>

          {/* Frontend e Backend na mesma página */}
          <div className="status-stack">
            <div className="status-stack-title">Sistema</div>
            <div className="status-system-grid">
              <div className="status-system-card">
                <div className="status-card-header">
                  <h3>Frontend</h3>
                  {frontendStatus ? (
                    getStatusIcon(frontendStatus.status)
                  ) : (
                    <span className="status-badge down">Carregando...</span>
                  )}
                </div>
                <div className="status-card-body">
                  {frontendError && (
                    <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: 8 }}>{frontendError}</p>
                  )}
                  {frontendStatus && (
                    <pre
                      style={{
                        marginTop: 12,
                        background: '#111',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        maxHeight: 180,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(frontendStatus, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
              <div className="status-system-card">
                <div className="status-card-header">
                  <h3>Backend</h3>
                  {backendStatus ? (
                    getStatusIcon(backendStatus.status)
                  ) : (
                    <span className="status-badge down">Carregando...</span>
                  )}
                </div>
                <div className="status-card-body">
                  {backendError && (
                    <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: 8 }}>{backendError}</p>
                  )}
                  {backendStatus && (
                    <pre
                      style={{
                        marginTop: 12,
                        background: '#111',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        maxHeight: 180,
                        overflow: 'auto',
                      }}
                    >
                      {JSON.stringify(backendStatus, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="status-grid">
            {applications.map((app) => {
              const appKey = app.key;
              const appStatus = statusByApp[appKey];
              const isUpdating = !!updatingByApp[appKey];
              const error = errorByApp[appKey];
              const currentMode = appStatus?.status || 'online';

              return (
                <div key={appKey} className="status-card">
                  <div className="status-card-header">
                    <h3>{app.label}</h3>
                    {getStatusIcon(currentMode)}
                  </div>
                  <div className="status-card-body">
                    <div className={`status-badge ${currentMode === 'online' ? 'operational' : 'down'}`}>
                      {currentMode === 'online' ? 'Online' : 'Offline'}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label htmlFor={`status-select-${appKey}`}>Modo:</label>
                      <select
                        id={`status-select-${appKey}`}
                        value={currentMode}
                        onChange={(e) => handleChangeStatus(app, e.target.value)}
                        disabled={!appStatus || isUpdating}
                      >
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                      {isUpdating && <span>Atualizando...</span>}
                    </div>

                    {appStatus && (
                      <pre
                        style={{
                          marginTop: '12px',
                          background: '#111',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          maxHeight: '150px',
                          overflow: 'auto',
                        }}
                      >
{JSON.stringify(appStatus, null, 2)}
                      </pre>
                    )}

                    {error && (
                      <p style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '12px' }}>{error}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="status-history">
            <h2>Histórico Recente</h2>
            <div className="history-list">
              <div className="history-item">
                <span className="history-time">Hoje, 14:30</span>
                <span className="history-status operational">Todos os serviços operacionais</span>
              </div>
              <div className="history-item">
                <span className="history-time">Hoje, 10:15</span>
                <span className="history-status operational">Manutenção programada concluída</span>
              </div>
              <div className="history-item">
                <span className="history-time">Ontem, 22:00</span>
                <span className="history-status operational">Sistema estável</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Status;


