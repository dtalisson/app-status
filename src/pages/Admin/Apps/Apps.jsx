import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { FaCheckCircle, FaTimesCircle, FaUpload, FaTrash, FaDownload } from 'react-icons/fa';
import './Apps.css';

const Apps = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingApp, setEditingApp] = useState(null);
  const [uploading, setUploading] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/apps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setApps(data);
      
      // Carregar arquivos de cada aplicação
      data.forEach(app => loadFiles(app.id));
    } catch (error) {
      console.error('Erro ao carregar aplicações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (appId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/apps/${appId}/files`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setFiles(prev => ({ ...prev, [appId]: data.files || [] }));
    } catch (error) {
      console.error(`Erro ao carregar arquivos de ${appId}:`, error);
    }
  };

  const handleUpdateStatus = async (appId, updates) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/status/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        await loadApps();
        setEditingApp(null);
      } else {
        alert('Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const handleFileUpload = async (appId, file) => {
    if (!file || !file.name.endsWith('.exe')) {
      alert('Apenas arquivos .exe são permitidos');
      return;
    }

    setUploading(prev => ({ ...prev, [appId]: true }));

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/upload/${appId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        alert('Arquivo enviado com sucesso!');
        await loadFiles(appId);
        await loadApps();
      } else {
        alert(data.error || 'Erro ao fazer upload');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload');
    } finally {
      setUploading(prev => ({ ...prev, [appId]: false }));
    }
  };

  const handleDeleteFile = async (appId, filename) => {
    if (!window.confirm(`Tem certeza que deseja deletar ${filename}?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/upload/${appId}/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        await loadFiles(appId);
        alert('Arquivo deletado com sucesso');
      } else {
        alert('Erro ao deletar arquivo');
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      alert('Erro ao deletar arquivo');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    return status === 'online' ? (
      <FaCheckCircle className="status-icon online" />
    ) : (
      <FaTimesCircle className="status-icon offline" />
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="apps-loading">Carregando aplicações...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="apps-container">
        <div className="apps-header">
          <h1>Gerenciar Aplicações</h1>
          <p>Gerencie status, versões e arquivos de download das aplicações</p>
        </div>

        <div className="apps-grid">
          {apps.map((app) => (
            <div key={app.id} className="app-card">
              <div className="app-card-header">
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
                  <div className="app-actions">
                    <button
                      className="btn-edit"
                      onClick={() => setEditingApp(app.id)}
                    >
                      Editar Status
                    </button>
                  </div>

                  <div className="app-files-section">
                    <h4>Arquivos Disponíveis</h4>
                    <div className="file-upload">
                      <label className="file-upload-label">
                        <FaUpload /> Upload .exe
                        <input
                          type="file"
                          accept=".exe"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileUpload(app.id, e.target.files[0]);
                            }
                          }}
                          disabled={uploading[app.id]}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {uploading[app.id] && <span className="uploading">Enviando...</span>}
                    </div>

                    <div className="files-list">
                      {files[app.id] && files[app.id].length > 0 ? (
                        files[app.id].map((file, idx) => (
                          <div key={idx} className="file-item">
                            <div className="file-info">
                              <FaDownload className="file-icon" />
                              <div>
                                <div className="file-name">{file.filename}</div>
                                <div className="file-meta">
                                  {formatFileSize(file.size)} • {new Date(file.modified).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                            <button
                              className="btn-delete-file"
                              onClick={() => handleDeleteFile(app.id, file.filename)}
                              title="Deletar arquivo"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-files">Nenhum arquivo disponível</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
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

export default Apps;
