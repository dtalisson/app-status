import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';

const Home = () => {
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

  return (
    <div className="Home" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Header />
      <ParticlesCanvas />
      {/* Painel central de status, por cima do bg */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 80px)',
          padding: '80px 16px 40px',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(5, 5, 5, 0.9)',
            borderRadius: '18px',
            padding: '24px 20px',
            border: '1px solid rgba(8, 164, 247, 0.4)',
            boxShadow: '0 0 30px rgba(8, 164, 247, 0.35)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Status da Aplicação</h1>
          <p style={{ fontSize: '14px', color: '#ccc' }}>
            Controle rápido do endpoint <code>/api/status</code> diretamente da página inicial.
          </p>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label htmlFor="status-select">
              Modo:
            </label>
            <select
              id="status-select"
              value={apiStatus?.status || 'online'}
              onChange={handleSelectChange}
              disabled={!apiStatus || updating}
              style={{
                background: '#050505',
                color: '#fff',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '6px 10px',
              }}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            {updating && <span style={{ fontSize: '13px' }}>Atualizando...</span>}
          </div>

          {apiStatus && (
            <pre
              style={{
                marginTop: '16px',
                background: '#111',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '12px',
                maxHeight: '220px',
                overflow: 'auto',
              }}
            >
{JSON.stringify(apiStatus, null, 2)}
            </pre>
          )}
          {error && <p style={{ color: '#ff6b6b', marginTop: '8px', fontSize: '13px' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Home;


