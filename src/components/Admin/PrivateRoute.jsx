import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#08a4f7'
      }}>
        Carregando...
      </div>
    );
  }

  // Verificar se é admin ou se tem token válido
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Se não for admin explicitamente, ainda permitir acesso se tiver token (para compatibilidade)
  if (!isAdmin && user) {
    // Verificar se é o admin específico por email/discordId
    const ADMIN_EMAIL = 'darlan-talisson@hotmail.com';
    const ADMIN_DISCORD_ID = '841457100755566602';
    const isSpecificAdmin = 
      user.email === ADMIN_EMAIL || 
      user.discordId === ADMIN_DISCORD_ID;
    
    if (!isSpecificAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;


