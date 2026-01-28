import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, usersAPI, adminAPI } from '../utils/api';

const ADMIN_EMAIL = 'darlan-talisson@hotmail.com';
const ADMIN_DISCORD_ID = '841457100755566602';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (!token) {
        console.log('No token found, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      // Migrar token antigo
      if (localStorage.getItem('adminToken') && !localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', localStorage.getItem('adminToken'));
        localStorage.removeItem('adminToken');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Checking auth with token:', token.substring(0, 20) + '...');
      }

      // Tentar verificar como usuário primeiro
      try {
        const userData = await usersAPI.getProfile();
        if (userData && userData.user) {
          console.log('Setting user from profile:', userData.user);
          const user = userData.user;
          setUser(user);
          
          // Verificar se é admin
          const checkAdmin = 
            user.email === ADMIN_EMAIL || 
            user.discordId === ADMIN_DISCORD_ID;
          
          if (checkAdmin) {
            try {
              await adminAPI.check();
              setIsAdmin(true);
            } catch (e) {
              setIsAdmin(checkAdmin); // Se a API falhar, usar verificação local
            }
          } else {
            setIsAdmin(false);
          }
          
          setLoading(false);
          return userData;
        }
      } catch (userError) {
        // Se falhar, tentar como admin (para compatibilidade)
        try {
          const adminData = await authAPI.verify();
          if (adminData && adminData.admin) {
            // Converter admin para formato de user
            const adminUser = {
              id: adminData.admin.id,
              discordId: adminData.admin.discordId,
              discordUsername: adminData.admin.discordUsername,
              discordAvatar: adminData.admin.discordAvatar,
              email: adminData.admin.email,
              username: adminData.admin.username,
            };
            setUser(adminUser);
            setIsAdmin(true);
            setLoading(false);
            return adminData;
          }
        } catch (adminError) {
          console.error('Both user and admin verification failed');
        }
      }
      
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      return null;
    } catch (error) {
      console.error('CheckAuth error:', error);
      localStorage.removeItem('userToken');
      localStorage.removeItem('adminToken');
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authAPI.login(username, password);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Login response data:', data);
      }
      
      // Migrar token
      if (localStorage.getItem('adminToken')) {
        localStorage.setItem('userToken', localStorage.getItem('adminToken'));
        localStorage.removeItem('adminToken');
      }
      
      // Atualizar estado
      await checkAuth();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

