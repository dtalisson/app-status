const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Verificar se usuário é admin (por email ou discordId)
const ADMIN_EMAIL = 'darlan-talisson@hotmail.com';
const ADMIN_DISCORD_ID = '841457100755566602';

// Middleware para verificar admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se é admin pelo modelo Admin
    const admin = await Admin.findById(decoded.id);
    if (admin) {
      req.isAdmin = true;
      req.userId = admin._id;
      return next();
    }
    
    // Verificar se é admin pelo email ou discordId
    const user = await User.findById(decoded.id);
    if (user && (
      user.email === ADMIN_EMAIL || 
      user.discordId === ADMIN_DISCORD_ID
    )) {
      req.isAdmin = true;
      req.userId = user._id;
      return next();
    }
    
    return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Verificar se usuário é admin (sem middleware para permitir verificação)
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.json({ isAdmin: false });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se é admin pelo modelo Admin
    const admin = await Admin.findById(decoded.id);
    if (admin) {
      return res.json({ isAdmin: true });
    }
    
    // Verificar se é admin pelo email ou discordId
    const user = await User.findById(decoded.id);
    if (user && (
      user.email === ADMIN_EMAIL || 
      user.discordId === ADMIN_DISCORD_ID
    )) {
      return res.json({ isAdmin: true });
    }
    
    return res.json({ isAdmin: false });
  } catch (error) {
    return res.json({ isAdmin: false });
  }
});

// Obter estatísticas gerais
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSales = await Sale.countDocuments();
    const totalRevenue = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    
    const recentSales = await Sale.find()
      .populate('product', 'name image')
      .populate('plan', 'name')
      .populate('userId', 'discordUsername discordAvatar email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

// Listar todos os usuários
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
});

// Listar todas as vendas
router.get('/sales', verifyAdmin, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product', 'name image')
      .populate('plan', 'name')
      .populate('userId', 'discordUsername discordAvatar email')
      .sort({ createdAt: -1 });
    
    res.json({ sales });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar vendas' });
  }
});

module.exports = router;

