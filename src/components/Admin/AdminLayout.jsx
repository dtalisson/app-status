import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaBox, FaTags, FaSignOutAlt, FaBars, FaTimes, FaDesktop } from 'react-icons/fa';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/admin/produtos', label: 'Produtos', icon: FaBox },
    { path: '/admin/planos', label: 'Planos', icon: FaTags },
    { path: '/admin/apps', label: 'Aplicações', icon: FaDesktop },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-sidebar-header">
          <h2>Radiant Store</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="admin-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <button className="admin-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Sair</span>
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Painel Administrativo</h1>
          {admin?.discordUsername && (
            <div className="admin-user-info">
              {admin.discordAvatar && (
                <img 
                  src={admin.discordAvatar} 
                  alt={admin.discordUsername}
                  className="admin-avatar"
                />
              )}
              <span className="admin-username">{admin.discordUsername}</span>
            </div>
          )}
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

