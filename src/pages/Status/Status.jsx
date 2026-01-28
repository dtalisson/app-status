import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import './Status.css';

const Status = () => {
  const [apiStatus, setApiStatus] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Buscar status inicial do backend simples
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setError('');
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('Falha ao buscar status');
        const data = await res.json();
        setApiStatus(data);
      } catch (err) {
        console.error('Erro ao buscar /api/status:', err);
        setError('Não foi possível carregar o status da API.');
      }
    };

    fetchStatus();
  }, []);

  const handleSelectChange = async (e) => {
    const newStatus = e.target.value;
    if (!apiStatus) return;

    setUpdating(true);
    setError('');
    try {
      const res = await fetch('/api/status', {
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

      // Atualizar estado local para refletir alteração
      setApiStatus((prev) => ({
        ...(prev || {}),
        status: newStatus,
        message:
          newStatus === 'online'
            ? 'Aplicação está online e atualizada.'
            : 'Aplicação offline para atualização.',
      }));
    } catch (err) {
      console.error('Erro ao atualizar /api/status:', err);
      setError('Erro ao atualizar status.');
    } finally {
      setUpdating(false);
    }
  };

  const [services] = useState([
    { name: 'Website', status: 'operational', uptime: '99.9%' },
    { name: 'API Backend', status: 'operational', uptime: '99.8%' },
    { name: 'MongoDB Database', status: 'operational', uptime: '99.9%' },
    { name: 'Payment Gateway', status: 'operational', uptime: '99.7%' },
  ]);

  return (
    <div className="status-page">
      <Header />
      <div className="status-container">
        <div className="status-content">
          {/* Controle simples do backend /api/status */}
          <div className="status-header">
            <h1>Status do Sistema</h1>
            <p>Controle rápido do endpoint <code>/api/status</code></p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="status-select">
                Modo da aplicação:
              </label>
              <select
                id="status-select"
                value={apiStatus?.status || 'online'}
                onChange={handleSelectChange}
                disabled={!apiStatus || updating}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              {updating && <span>Atualizando...</span>}
            </div>
            {apiStatus && (
              <pre style={{ marginTop: '12px', background: '#111', padding: '8px 12px', borderRadius: '8px' }}>
{JSON.stringify(apiStatus, null, 2)}
              </pre>
            )}
            {error && <p style={{ color: '#ff6b6b', marginTop: '8px' }}>{error}</p>}
          </div>

          <div className="status-grid">
            {services.map((service, index) => (
              <div key={index} className="status-card">
                <div className="status-card-header">
                  <h3>{service.name}</h3>
                  {service.status === 'operational' ? (
                    <FaCheckCircle className="status-icon operational" />
                  ) : service.status === 'degraded' ? (
                    <FaExclamationTriangle className="status-icon degraded" />
                  ) : (
                    <FaTimesCircle className="status-icon down" />
                  )}
                </div>
                <div className="status-card-body">
                  <div className="status-badge operational">
                    {service.status === 'operational' ? 'Operacional' : 
                     service.status === 'degraded' ? 'Degradado' : 'Indisponível'}
                  </div>
                  <div className="status-uptime">
                    <span>Uptime:</span>
                    <strong>{service.uptime}</strong>
                  </div>
                </div>
              </div>
            ))}
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


