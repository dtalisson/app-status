import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { setAuthToken } from '../../../utils/api';
import './Callback.css';

const Callback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Salvar token no localStorage
      setAuthToken(token);
      
      // Verificar autenticação e redirecionar
      checkAuth().then(() => {
        navigate('/admin/dashboard');
      }).catch(() => {
        navigate('/admin/login?error=token_invalid');
      });
    } else {
      navigate('/admin/login?error=no_token');
    }
  }, [searchParams, navigate, checkAuth]);

  return (
    <div className="callback-container">
      <div className="callback-loading">
        <div className="callback-spinner"></div>
        <p>Autenticando com Discord...</p>
      </div>
    </div>
  );
};

export default Callback;


