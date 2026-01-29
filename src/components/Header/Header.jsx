import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <nav className="floating-nav">
      <div className="nav-container">
        <div className="logo-section">
          <img 
            src="https://i.imgur.com/43wswFE.gif" 
            alt="Radiant Store Logo" 
            className="logo-gif"
          />
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">Início</Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;


