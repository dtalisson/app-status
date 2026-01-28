const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'radiant-admin-secret-key-change-in-production';

// Admin específico por email ou Discord ID
const ADMIN_EMAIL = 'darlan-talisson@hotmail.com';
const ADMIN_DISCORD_ID = '841457100755566602';

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se é admin pelo modelo Admin
    const admin = await Admin.findById(decoded.id).select('-password');
    if (admin) {
      req.admin = admin;
      return next();
    }
    
    // Verificar se é admin pelo email ou discordId no modelo User
    const user = await User.findById(decoded.id).select('-password');
    if (user && (
      user.email === ADMIN_EMAIL || 
      user.discordId === ADMIN_DISCORD_ID
    )) {
      req.admin = user; // Usar user como admin
      return next();
    }
    
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

module.exports = { authenticateAdmin, JWT_SECRET };

