const express = require('express');
const Plan = require('../models/Plan');
const Product = require('../models/Product');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Listar planos (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const plans = await Plan.find().populate('product').sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar planos' });
  }
});

// Listar planos por produto
router.get('/product/:productId', async (req, res) => {
  try {
    const plans = await Plan.find({ 
      product: req.params.productId,
      active: true 
    }).populate('product');
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar planos' });
  }
});

// Buscar plano por ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('product');
    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar plano' });
  }
});

// Criar plano (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, value, product, active } = req.body;
    
    // Verificar se produto existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const plan = await Plan.create({
      name,
      description,
      value,
      product,
      active: active !== undefined ? active : true,
    });
    
    // Adicionar plano ao produto
    await Product.findByIdAndUpdate(product, {
      $addToSet: { plans: plan._id }
    });
    
    const populatedPlan = await Plan.findById(plan._id).populate('product');
    res.status(201).json(populatedPlan);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar plano', error: error.message });
  }
});

// Atualizar plano (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('product');
    
    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar plano', error: error.message });
  }
});

// Deletar plano (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Remover plano do produto
    await Product.findByIdAndUpdate(plan.product, {
      $pull: { plans: plan._id }
    });
    
    await Plan.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Plano deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar plano' });
  }
});

module.exports = router;


