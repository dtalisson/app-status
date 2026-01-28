import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaBox, FaSignOutAlt } from 'react-icons/fa';
import './UserDropdown.css';

const UserDropdown = ({ isOpen, onClose, user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <div className="user-dropdown-profile">
        <div className="dropdown-avatar-wrapper">
          <div className="dropdown-avatar-border">
            {user?.discordAvatar ? (
              <img 
                src={user.discordAvatar} 
                alt={user.discordUsername || 'User'} 
                className="dropdown-avatar-image"
              />
            ) : (
              <div className="dropdown-avatar-placeholder">
                <FaUser />
              </div>
            )}
          </div>
        </div>
        <div className="dropdown-username">{user?.discordUsername || user?.username || 'User'}</div>
      </div>

      <div className="dropdown-divider"></div>

      <div className="user-dropdown-menu">
        <button 
          className="dropdown-item"
          onClick={() => handleNavigate('/perfil')}
        >
          <FaUser className="dropdown-item-icon" />
          <span>Minha Conta</span>
        </button>

        <button 
          className="dropdown-item"
          onClick={() => handleNavigate('/perfil')}
        >
          <FaBox className="dropdown-item-icon" />
          <span>Meus Pedidos</span>
        </button>
      </div>

      <div className="dropdown-divider"></div>

      <div className="user-dropdown-menu">
        <button 
          className="dropdown-item logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="dropdown-item-icon" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;

