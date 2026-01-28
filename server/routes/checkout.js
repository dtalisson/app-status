const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Stock = require('../models/Stock');
const { authenticateAdmin, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Função para gerar key única
const generateUniqueKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// Middleware para autenticar usuário (não apenas admin)
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

// Finalizar compra (criar vendas para todos os itens do carrinho)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { items, couponCode } = req.body; // items: [{productId, planId, quantity}]
    
    console.log('📥 Finalizando compra:', {
      userId: req.user._id,
      itemsCount: items?.length || 0,
      couponCode
    });

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    const createdSales = [];
    const errors = [];

    // Processar cada item do carrinho
    for (const item of items) {
      try {
        const { productId, planId, quantity } = item;

        // Verificar se produto existe
        const product = await Product.findById(productId);
        if (!product) {
          errors.push(`Produto ${productId} não encontrado`);
          continue;
        }

        // Verificar se plano existe (se fornecido)
        let plan = null;
        let planValue = 0;
        if (planId) {
          plan = await Plan.findById(planId);
          if (!plan) {
            errors.push(`Plano ${planId} não encontrado`);
            continue;
          }
          planValue = plan.value;
        }

        // Criar uma venda para cada quantidade
        for (let i = 0; i < quantity; i++) {
          let key = null;
          let stockItem = null;
          
          // Tentar pegar uma key do estoque
          try {
            const stockQuery = { 
              product: productId, 
              used: false 
            };
            
            if (planId) {
              stockQuery.plan = planId;
            } else {
              stockQuery.plan = null;
            }
            
            stockItem = await Stock.findOne(stockQuery);
            
            if (stockItem) {
              key = stockItem.key;
            }
          } catch (stockError) {
            console.error('Erro ao buscar key do estoque:', stockError);
            // Continuar com geração automática se falhar
          }
          
          // Se não encontrou no estoque, gerar key única
          if (!key) {
            key = generateUniqueKey();
            let keyExists = true;
            
            // Garantir que a key seja única
            while (keyExists) {
              const existingSale = await Sale.findOne({ key });
              const existingStock = await Stock.findOne({ key });
              if (!existingSale && !existingStock) {
                keyExists = false;
              } else {
                key = generateUniqueKey();
              }
            }
          }

          // Calcular valor com desconto (se houver)
          let finalValue = planValue;
          if (couponCode) {
            // Aqui você pode adicionar lógica de desconto se necessário
            // Por enquanto, vamos assumir que o desconto já foi aplicado no frontend
            finalValue = planValue;
          }

          // Criar venda
          const sale = await Sale.create({
            key,
            product: productId,
            plan: planId || null,
            userId: req.user._id,
            userEmail: req.user.email || req.user.discordUsername || 'Sem email',
            userName: req.user.discordUsername || req.user.username || 'Usuário',
            value: finalValue,
            status: 'completed',
          });
          
          // Marcar key do estoque como usada
          if (stockItem) {
            stockItem.used = true;
            stockItem.usedAt = new Date();
            stockItem.saleId = sale._id;
            await stockItem.save();
          }

          // Popular dados do produto e plano
          const populatedSale = await Sale.findById(sale._id)
            .populate('product')
            .populate('plan');

          createdSales.push(populatedSale);
        }
      } catch (error) {
        console.error('Erro ao processar item:', error);
        errors.push(`Erro ao processar item: ${error.message}`);
      }
    }

    if (createdSales.length === 0 && errors.length > 0) {
      return res.status(400).json({ 
        error: 'Nenhuma venda foi criada', 
        errors 
      });
    }

    console.log(`✅ ${createdSales.length} venda(s) criada(s) com sucesso`);

    res.status(201).json({
      success: true,
      sales: createdSales,
      message: `${createdSales.length} produto(s) adquirido(s) com sucesso!`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('❌ Erro ao finalizar compra:', error);
    res.status(500).json({ error: error.message || 'Erro ao finalizar compra' });
  }
});

module.exports = router;


