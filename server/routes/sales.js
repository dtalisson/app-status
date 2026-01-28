const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar todas as vendas (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('product')
      .populate('plan')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar vendas' });
  }
});

// Buscar venda por ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('product')
      .populate('plan');
    
    if (!sale) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar venda' });
  }
});

// Criar venda (admin ou sistema)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { key, product, plan, userEmail, userName, value, status } = req.body;
    
    // Verificar se produto existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Se tiver plano, verificar se existe
    if (plan) {
      const planExists = await Plan.findById(plan);
      if (!planExists) {
        return res.status(404).json({ message: 'Plano não encontrado' });
      }
    }
    
    const sale = await Sale.create({
      key,
      product,
      plan: plan || null,
      userEmail,
      userName,
      value,
      status: status || 'completed',
    });
    
    const populatedSale = await Sale.findById(sale._id)
      .populate('product')
      .populate('plan');
    
    res.status(201).json(populatedSale);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Key já existe' });
    }
    res.status(400).json({ message: 'Erro ao criar venda', error: error.message });
  }
});

// Estatísticas do dashboard
router.get('/stats/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments({ status: 'completed' });
    const totalRevenue = await Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);
    
    const revenueByMonth = await Sale.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByMonth,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;


