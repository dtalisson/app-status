const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { authenticateAdmin } = require('../middleware/auth');

// Listar todos os cupons (apenas admin)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    res.status(500).json({ error: 'Erro ao buscar cupons' });
  }
});

// Criar cupom (apenas admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    console.log('📥 Requisição para criar cupom recebida:', {
      body: req.body,
      admin: req.admin?.username || req.admin?.discordUsername || 'Admin autenticado'
    });

    const { code, percentage, expiresAt } = req.body;

    if (!code || percentage === undefined) {
      console.log('❌ Validação falhou: código ou porcentagem faltando');
      return res.status(400).json({ error: 'Código e porcentagem são obrigatórios' });
    }

    if (percentage < 0 || percentage > 100) {
      console.log('❌ Validação falhou: porcentagem fora do range');
      return res.status(400).json({ error: 'Porcentagem deve estar entre 0 e 100' });
    }

    console.log('✅ Criando cupom com dados:', {
      code: code.toUpperCase().trim(),
      percentage,
      expiresAt: expiresAt || null
    });

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      percentage,
      expiresAt: expiresAt || null,
      active: true
    });

    console.log('✅ Cupom criado com sucesso:', coupon._id);
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      console.log('❌ Código de cupom duplicado');
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    console.error('❌ Erro ao criar cupom:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar cupom' });
  }
});

// Atualizar cupom (apenas admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { code, percentage, active, expiresAt } = req.body;

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (percentage !== undefined) {
      if (percentage < 0 || percentage > 100) {
        return res.status(400).json({ error: 'Porcentagem deve estar entre 0 e 100' });
      }
      updateData.percentage = percentage;
    }
    if (active !== undefined) updateData.active = active;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt;

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    res.json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Código de cupom já existe' });
    }
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({ error: 'Erro ao atualizar cupom' });
  }
});

// Deletar cupom (apenas admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    res.json({ message: 'Cupom deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cupom:', error);
    res.status(500).json({ error: 'Erro ao deletar cupom' });
  }
});

// Validar cupom (público - para usar no carrinho)
router.get('/validate/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const coupon = await Coupon.findOne({ code, active: true });

    if (!coupon) {
      return res.status(404).json({ error: 'Cupom inválido ou inativo' });
    }

    // Verificar se expirou
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }

    res.json({
      valid: true,
      code: coupon.code,
      percentage: coupon.percentage
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({ error: 'Erro ao validar cupom' });
  }
});

module.exports = router;

