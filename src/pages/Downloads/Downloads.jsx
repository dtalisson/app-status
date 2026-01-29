import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { FaCheckCircle, FaTimesCircle, FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import './Downloads.css';

const Downloads = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      setApps(data);
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (appId, updates) => {
    try {
      const res = await fetch(`/api/status/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await loadApps();
        setEditingApp(null);
        alert('Status atualizado com sucesso!');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };


  const getStatusIcon = (status) => {
    if (status === 'online') return <FaCheckCircle className="status-icon online" />;
    if (status === 'degraded') return <FaExclamationTriangle className="status-icon degraded" />;
    return <FaTimesCircle className="status-icon offline" />;
  };

  if (loading) {
    return (
      <div className="downloads-page">
        <Header />
        <ParticlesCanvas />
        <div className="downloads-loading">Carregando aplicações...</div>
      </div>
    );
  }

  return (
    <div className="downloads-page">
      <Header />
      <ParticlesCanvas />
      <div className="downloads-container">
        <div className="downloads-header">
          <h1>Gerenciar Downloads</h1>
          <p>Gerencie status, versões e arquivos de download das aplicações</p>
        </div>

        <div className="downloads-grid">
          {apps.map((app) => (
            <div key={app.id} className="download-card">
              <div className="download-card-header">
                <div>
                  <h3>{app.name}</h3>
                  <span className="app-id">{app.id}</span>
                </div>
                {getStatusIcon(app.status.status)}
              </div>

              {editingApp === app.id ? (
                <AppEditForm
                  app={app}
                  onSave={(updates) => handleUpdateStatus(app.id, updates)}
                  onCancel={() => setEditingApp(null)}
                />
              ) : (
                <>
                  <AppStatusDisplay app={app} />
                  <div className="download-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setEditingApp(app.id)}
                    >
                      Editar Status
                    </button>
                  </div>

                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const AppStatusDisplay = ({ app }) => {
  const status = app.status;
  return (
    <div className="app-status-display">
      <div className="status-row">
        <span className="status-label">Status:</span>
        <span className={`status-value ${status.status}`}>
          {status.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">Versão Atual:</span>
        <span className="status-value">{status.current_version}</span>
      </div>
      <div className="status-row">
        <span className="status-label">Versão Mínima:</span>
        <span className="status-value">{status.min_version}</span>
      </div>
      <div className="status-row">
        <span className="status-label">Manutenção:</span>
        <span className="status-value">{status.maintenance ? 'Sim' : 'Não'}</span>
      </div>
      <div className="status-row">
        <span className="status-label">Mensagem:</span>
        <span className="status-value">{status.message}</span>
      </div>
      {status.release_notes && (
        <div className="status-row">
          <span className="status-label">Release Notes:</span>
          <span className="status-value">{status.release_notes}</span>
        </div>
      )}
    </div>
  );
};

const AppEditForm = ({ app, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    status: app.status.status,
    current_version: app.status.current_version,
    min_version: app.status.min_version,
    maintenance: app.status.maintenance,
    message: app.status.message,
    release_notes: app.status.release_notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="app-edit-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Status:</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="form-group">
        <label>Versão Atual:</label>
        <input
          type="text"
          value={formData.current_version}
          onChange={(e) => setFormData({ ...formData, current_version: e.target.value })}
          placeholder="1.0.0"
        />
      </div>

      <div className="form-group">
        <label>Versão Mínima:</label>
        <input
          type="text"
          value={formData.min_version}
          onChange={(e) => setFormData({ ...formData, min_version: e.target.value })}
          placeholder="1.0.0"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.maintenance}
            onChange={(e) => setFormData({ ...formData, maintenance: e.target.checked })}
          />
          Em Manutenção
        </label>
      </div>

      <div className="form-group">
        <label>Mensagem:</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Release Notes:</label>
        <textarea
          value={formData.release_notes}
          onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
          rows="2"
          placeholder="v1.1.0 - Melhorias"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-save">Salvar</button>
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default Downloads;
