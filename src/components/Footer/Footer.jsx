import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer reveal">
      <div className="footer-min">
        <div className="copy">© {year} Radiant Store. Todos os direitos reservados.</div>
        <nav className="links">
          <a href="#termos">Termos</a>
          <a href="#privacidade">Privacidade</a>
          <a href="#cookies">Cookies</a>
          <a href="#contato">Contato</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;


