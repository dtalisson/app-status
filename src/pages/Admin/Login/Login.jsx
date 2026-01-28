import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaDiscord } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há erro na URL
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'not_authorized':
          setError('Você não está autorizado a acessar o painel');
          break;
        case 'discord_error':
          setError('Erro ao autenticar com Discord');
          break;
        case 'not_configured':
          setError('Discord OAuth não está configurado');
          break;
        default:
          setError('Erro ao fazer login');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Para login tradicional, preencha username e senha');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = () => {
    // Redirecionar para rota do backend que inicia OAuth
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/auth/discord`;
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <div className="admin-login-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
          </div>
          <h1>Admin VGC</h1>
          <p>Faça login para acessar o painel</p>
        </div>
        
        <div className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          
          {/* Botão Discord em destaque */}
          <button
            type="button"
            onClick={handleDiscordLogin}
            className="admin-login-discord-button"
          >
            <FaDiscord />
            <span>Entrar com Discord</span>
          </button>
          
          <div className="admin-login-divider">
            <span>ou</span>
          </div>
          
          {/* Formulário tradicional (opcional - para admins sem Discord) */}
          <form onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label>Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
              />
            </div>
            
            <div className="admin-login-field">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
              />
            </div>
            
            <button type="submit" disabled={loading} className="admin-login-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span>{loading ? 'Entrando...' : 'Entrar'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

