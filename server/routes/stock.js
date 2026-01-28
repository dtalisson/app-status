const express = require('express');
const Stock = require('../models/Stock');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar todo o estoque (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { product, plan, used } = req.query;
    const query = {};
    
    if (product) query.product = product;
    if (plan) query.plan = plan;
    if (used !== undefined) query.used = used === 'true';
    
    const stock = await Stock.find(query)
      .populate('product', 'name')
      .populate('plan', 'name')
      .populate('saleId', 'key userEmail')
      .sort({ createdAt: -1 });
    
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar estoque', error: error.message });
  }
});

// Estatísticas do estoque
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const { product, plan } = req.query;
    const query = {};
    
    if (product) query.product = product;
    if (plan) query.plan = plan;
    
    const total = await Stock.countDocuments(query);
    const available = await Stock.countDocuments({ ...query, used: false });
    const used = await Stock.countDocuments({ ...query, used: true });
    
    res.json({ total, available, used });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

// Buscar uma key disponível do estoque (sem plano)
router.get('/available/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { planId } = req.query;
    
    const query = { 
      product: productId, 
      used: false 
    };
    
    if (planId && planId !== 'null') {
      query.plan = planId;
    } else {
      query.plan = null;
    }
    
    const availableKey = await Stock.findOne(query)
      .populate('product', 'name')
      .populate('plan', 'name');
    
    if (!availableKey) {
      return res.status(404).json({ 
        message: 'Nenhuma key disponível no estoque para este produto/plano' 
      });
    }
    
    res.json(availableKey);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar key disponível', error: error.message });
  }
});

// Adicionar keys ao estoque (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { keys, product, plan } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ message: 'Lista de keys é obrigatória' });
    }
    
    if (!product) {
      return res.status(400).json({ message: 'Produto é obrigatório' });
    }
    
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
    
    const createdKeys = [];
    const errors = [];
    
    for (const key of keys) {
      try {
        const trimmedKey = key.trim();
        if (!trimmedKey) {
          errors.push(`Key vazia ignorada`);
          continue;
        }
        
        const stockItem = await Stock.create({
          key: trimmedKey,
          product,
          plan: plan || null,
          used: false,
        });
        
        const populated = await Stock.findById(stockItem._id)
          .populate('product', 'name')
          .populate('plan', 'name');
        
        createdKeys.push(populated);
      } catch (error) {
        if (error.code === 11000) {
          errors.push(`Key "${key.trim()}" já existe no estoque`);
        } else {
          errors.push(`Erro ao adicionar key "${key.trim()}": ${error.message}`);
        }
      }
    }
    
    if (createdKeys.length === 0) {
      return res.status(400).json({ 
        message: 'Nenhuma key foi adicionada', 
        errors 
      });
    }
    
    res.status(201).json({
      success: true,
      added: createdKeys.length,
      keys: createdKeys,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar keys ao estoque', error: error.message });
  }
});

// Remover key do estoque (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id);
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Key não encontrada no estoque' });
    }
    
    if (stockItem.used) {
      return res.status(400).json({ message: 'Não é possível remover uma key que já foi usada' });
    }
    
    await Stock.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Key removida do estoque com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao remover key do estoque', error: error.message });
  }
});

// Atualizar key do estoque (admin)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key || key.trim() === '') {
      return res.status(400).json({ message: 'Key é obrigatória' });
    }
    
    const stockItem = await Stock.findById(req.params.id);
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Key não encontrada no estoque' });
    }
    
    if (stockItem.used) {
      return res.status(400).json({ message: 'Não é possível editar uma key que já foi usada' });
    }
    
    // Verificar se a nova key já existe (exceto a própria)
    const existingKey = await Stock.findOne({ 
      key: key.trim(),
      _id: { $ne: req.params.id }
    });
    
    if (existingKey) {
      return res.status(400).json({ message: 'Esta key já existe no estoque' });
    }
    
    stockItem.key = key.trim();
    await stockItem.save();
    
    const populated = await Stock.findById(stockItem._id)
      .populate('product', 'name')
      .populate('plan', 'name');
    
    res.json({ 
      message: 'Key atualizada com sucesso',
      stock: populated
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar key', error: error.message });
  }
});

// Marcar key como usada (interno - usado pelo checkout)
router.patch('/:id/use', async (req, res) => {
  try {
    const { saleId } = req.body;
    const stockItem = await Stock.findById(req.params.id);
    
    if (!stockItem) {
      return res.status(404).json({ message: 'Key não encontrada no estoque' });
    }
    
    if (stockItem.used) {
      return res.status(400).json({ message: 'Key já foi usada' });
    }
    
    stockItem.used = true;
    stockItem.usedAt = new Date();
    if (saleId) stockItem.saleId = saleId;
    
    await stockItem.save();
    
    res.json({ 
      message: 'Key marcada como usada',
      key: stockItem.key 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao marcar key como usada', error: error.message });
  }
});

module.exports = router;

