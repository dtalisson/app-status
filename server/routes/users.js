const express = require('express');
const User = require('../models/User');
const Sale = require('../models/Sale');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Get user purchases
router.get('/me/purchases', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const purchases = await Sale.find({ userId })
      .populate('product', 'name image imageUrl description subDescription tutorial tutorialText download active')
      .populate('plan', 'name description value')
      .sort({ createdAt: -1 });

    res.json({ purchases });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Get user profile
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

module.exports = router;

