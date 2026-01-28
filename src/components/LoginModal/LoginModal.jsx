import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDiscord, FaTimes } from 'react-icons/fa';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDiscordLogin = () => {
    // Salvar URL de retorno
    localStorage.setItem('loginReturnUrl', window.location.pathname);
    
    // Redirecionar para rota do backend que inicia OAuth
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/auth/discord`;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal-container">
        <button className="login-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="login-modal-content">
          <div className="login-modal-header">
            <h1>Login</h1>
            <p>Entre com sua conta do Discord para continuar</p>
          </div>

          <div className="login-modal-body">
            <button
              className="login-discord-button"
              onClick={handleDiscordLogin}
              disabled={loading}
            >
              <FaDiscord className="discord-icon" />
              <span>{loading ? 'Conectando...' : 'Entrar com Discord'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
