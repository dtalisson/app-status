const express = require('express');
const Product = require('../models/Product');
const Plan = require('../models/Plan');
const { authenticateAdmin } = require('../middleware/auth');
const { normalizeImageUrl } = require('../utils/imageNormalizer');

const router = express.Router();

// Listar produtos (público)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate('plans')
      .sort({ createdAt: -1 })
      .select('name description subDescription imageUrl tutorial tutorialText download active plans createdAt updatedAt');
    
    // Normalizar imageUrl de todos os produtos antes de retornar
    const normalizedProducts = products.map(product => {
      const normalized = product.toObject();
      if (normalized.imageUrl) {
        normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
      }
      return normalized;
    });
    
    console.log('📦 Produtos retornados:', normalizedProducts.length);
    normalizedProducts.forEach(p => {
      console.log(`  - ${p.name}: imageUrl=${p.imageUrl || 'NÃO DEFINIDO'}`);
    });
    
    res.json(normalizedProducts);
  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

// Listar todos produtos (admin)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .populate('plans')
      .sort({ createdAt: -1 });
    
    // Normalizar imageUrl de todos os produtos antes de retornar
    const normalizedProducts = products.map(product => {
      const normalized = product.toObject();
      if (normalized.imageUrl) {
        normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
      }
      return normalized;
    });
    
    res.json(normalizedProducts);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar produtos' });
  }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('plans');
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Normalizar imageUrl antes de retornar
    const normalized = product.toObject();
    if (normalized.imageUrl) {
      normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
    }
    
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

// Criar produto (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, subDescription, imageUrl, tutorial, tutorialText, download, active, plans } = req.body;
    
    // Normalizar imageUrl usando função dedicada
    const normalizedUrl = normalizeImageUrl(imageUrl || '');
    
    console.log('Criando produto - imageUrl original:', imageUrl);
    console.log('Criando produto - imageUrl normalizado:', normalizedUrl);
    
    const product = await Product.create({
      name,
      description: description || '',
      subDescription: subDescription || '',
      tutorial: tutorial || '',
      tutorialText: tutorialText || '',
      download: download || '',
      imageUrl: normalizedUrl,
      active: active !== undefined ? active : true,
      plans: plans || [],
    });
    
    // Popular planos para retornar
    const populatedProduct = await Product.findById(product._id).populate('plans');
    
    // Normalizar imageUrl antes de retornar
    const normalized = populatedProduct.toObject();
    if (normalized.imageUrl) {
      normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
    }
    
    console.log('Produto criado - imageUrl salvo:', normalized.imageUrl);
    res.status(201).json(normalized);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar produto', error: error.message });
  }
});

// Atualizar produto (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔄 Recebendo requisição de atualização:', {
      id: req.params.id,
      body: req.body,
      imageUrlRecebido: req.body.imageUrl,
      tipoImageUrl: typeof req.body.imageUrl
    });
    
    const { plans, imageUrl, ...updateData } = req.body;
    
    // Se plans foi fornecido, atualizar planos associados
    if (plans !== undefined) {
      updateData.plans = plans;
    }
    
    // Normalizar imageUrl - SEMPRE processar se fornecido
    if (imageUrl !== undefined) {
      console.log('📸 imageUrl fornecido na requisição:', imageUrl);
      console.log('📸 Tipo do imageUrl:', typeof imageUrl);
      console.log('📸 imageUrl é string vazia?', imageUrl === '');
      
      // Usar função de normalização dedicada
      const normalizedUrl = normalizeImageUrl(imageUrl || '');
      
      console.log('📸 imageUrl após normalização:', normalizedUrl);
      
      // SEMPRE definir imageUrl (mesmo que vazio) para garantir atualização
      updateData.imageUrl = normalizedUrl;
      console.log('📸 imageUrl que será salvo no banco:', updateData.imageUrl || '(vazio)');
      console.log('📸 Tipo do imageUrl que será salvo:', typeof updateData.imageUrl);
    } else {
      console.log('⚠️ imageUrl NÃO foi fornecido na requisição');
    }
    
    console.log('💾 updateData antes de salvar:', updateData);
    
    console.log('💾 Salvando no banco de dados...');
    console.log('💾 updateData completo:', JSON.stringify(updateData, null, 2));
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('plans');
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    console.log('💾 Produto salvo no banco - imageUrl no documento:', product.imageUrl || '(não definido)');
    
    // Normalizar imageUrl antes de retornar (apenas para exibição, não altera o banco)
    const normalized = product.toObject();
    if (normalized.imageUrl) {
      normalized.imageUrl = normalizeImageUrl(normalized.imageUrl);
    }
    
    console.log('✅ Produto atualizado - imageUrl final retornado:', normalized.imageUrl || '(vazio/não definido)');
    console.log('✅ Produto completo após atualização:', {
      id: normalized._id,
      name: normalized.name,
      description: normalized.description,
      active: normalized.active,
      imageUrl: normalized.imageUrl,
      imageUrlLength: normalized.imageUrl ? normalized.imageUrl.length : 0,
      plansCount: normalized.plans ? normalized.plans.length : 0
    });
    
    res.json(normalized);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error: error.message });
  }
});

// Deletar produto (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Remover planos associados
    await Plan.deleteMany({ product: req.params.id });
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar produto' });
  }
});

module.exports = router;


