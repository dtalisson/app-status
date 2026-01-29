import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
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
  const [editingVersions, setEditingVersions] = useState({});
  const [versionInputs, setVersionInputs] = useState({});

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
        // Inicializar inputs de versão
        setVersionInputs((prev) => ({
          ...prev,
          [appKey]: {
            current_version: data.current_version || '1.0.0',
            min_version: data.min_version || '1.0.0',
          },
        }));
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


  const handleUpdateVersions = async (app) => {
    const appKey = app.key;
    const versions = versionInputs[appKey];
    if (!versions) return;

    setUpdatingByApp((prev) => ({ ...prev, [appKey]: true }));
    setErrorByApp((prev) => ({ ...prev, [appKey]: '' }));

    try {
      const res = await fetch(`/api/status/${app.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_version: versions.current_version,
          min_version: versions.min_version,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Erro ao atualizar versões');
      }

      // Recarregar status
      const statusRes = await fetch(`/api/status/${app.id}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatusByApp((prev) => ({ ...prev, [appKey]: statusData }));
        setVersionInputs((prev) => ({
          ...prev,
          [appKey]: {
            current_version: statusData.current_version,
            min_version: statusData.min_version,
          },
        }));
      }

      setEditingVersions((prev) => ({ ...prev, [appKey]: false }));
      alert('Versões atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar versões:', err);
      setErrorByApp((prev) => ({
        ...prev,
        [appKey]: 'Erro ao atualizar versões.',
      }));
    } finally {
      setUpdatingByApp((prev) => ({ ...prev, [appKey]: false }));
    }
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
                      <span className="app-id-display">ID: {app.id}</span>
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

                  {/* Controles de Versão */}
                  <div className="home-status-versions">
                    {editingVersions[appKey] ? (
                      <div className="version-edit-form">
                        <div className="version-input-group">
                          <label>Versão Atual:</label>
                          <input
                            type="text"
                            value={versionInputs[appKey]?.current_version || ''}
                            onChange={(e) =>
                              setVersionInputs((prev) => ({
                                ...prev,
                                [appKey]: {
                                  ...prev[appKey],
                                  current_version: e.target.value,
                                },
                              }))
                            }
                            className="version-input"
                            placeholder="1.0.0"
                          />
                        </div>
                        <div className="version-input-group">
                          <label>Versão Mínima:</label>
                          <input
                            type="text"
                            value={versionInputs[appKey]?.min_version || ''}
                            onChange={(e) =>
                              setVersionInputs((prev) => ({
                                ...prev,
                                [appKey]: {
                                  ...prev[appKey],
                                  min_version: e.target.value,
                                },
                              }))
                            }
                            className="version-input"
                            placeholder="1.0.0"
                          />
                        </div>
                        <div className="version-actions">
                          <button
                            className="btn-version-save"
                            onClick={() => handleUpdateVersions(app)}
                            disabled={isUpdating}
                          >
                            Salvar
                          </button>
                          <button
                            className="btn-version-cancel"
                            onClick={() => {
                              setEditingVersions((prev) => ({ ...prev, [appKey]: false }));
                              // Restaurar valores originais
                              if (appStatus) {
                                setVersionInputs((prev) => ({
                                  ...prev,
                                  [appKey]: {
                                    current_version: appStatus.current_version,
                                    min_version: appStatus.min_version,
                                  },
                                }));
                              }
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="version-display">
                        <div className="version-item">
                          <span className="version-label">Versão Atual:</span>
                          <span className="version-value">{appStatus?.current_version || '1.0.0'}</span>
                        </div>
                        <div className="version-item">
                          <span className="version-label">Versão Mínima:</span>
                          <span className="version-value">{appStatus?.min_version || '1.0.0'}</span>
                        </div>
                        <button
                          className="btn-version-edit"
                          onClick={() => {
                            setEditingVersions((prev) => ({ ...prev, [appKey]: true }));
                            if (appStatus) {
                              setVersionInputs((prev) => ({
                                ...prev,
                                [appKey]: {
                                  current_version: appStatus.current_version || '1.0.0',
                                  min_version: appStatus.min_version || '1.0.0',
                                },
                              }));
                            }
                          }}
                        >
                          Editar Versões
                        </button>
                      </div>
                    )}
                  </div>

                  {appStatus && (
                    <pre className="home-status-json">
{JSON.stringify(appStatus, null, 2)}
                    </pre>
                  )}

                  {error && <div className="home-status-error">{error}</div>}
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

