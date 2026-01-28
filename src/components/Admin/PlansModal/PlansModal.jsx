import React, { useState, useEffect } from 'react';
import { plansAPI, productsAPI } from '../../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaBox, FaArrowLeft, FaCube } from 'react-icons/fa';
import './PlansModal.css';

const PlansModal = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    product: '',
    active: true,
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setShowForm(false);
      setEditingPlan(null);
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, productsData] = await Promise.all([
        plansAPI.getAll(),
        productsAPI.getAdmin(),
      ]);
      
      console.log('📥 Planos carregados no modal:', plansData?.length || 0);
      
      setPlans(plansData || []);
      setAllProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setPlans([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const planData = {
        name: formData.name,
        value: parseFloat(formData.value),
        product: formData.product,
        active: formData.active,
      };

      console.log('📤 Salvando plano - dados completos:', JSON.stringify(planData, null, 2));

      if (editingPlan) {
        await plansAPI.update(editingPlan._id, planData);
      } else {
        await plansAPI.create(planData);
      }
      
      await loadData();
      resetForm();
      // Se estava editando um plano, recarregar planos do produto selecionado
      if (selectedProduct) {
        await loadPlansForProduct(selectedProduct._id || selectedProduct);
      }
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      alert(error.message || 'Erro ao salvar plano');
    }
  };

  const handleEdit = (plan) => {
    console.log('📝 Iniciando edição do plano:', {
      id: plan._id,
      name: plan.name,
      fullPlan: plan
    });
    
    setEditingPlan(plan);
    
    const formDataToSet = {
      name: plan.name || '',
      value: plan.value?.toString() || '',
      product: plan.product?._id || plan.product || '',
      active: plan.active !== undefined ? plan.active : true,
    };
    
    console.log('📝 FormData que será definido:', formDataToSet);
    
    setFormData(formDataToSet);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este plano?')) return;
    
    try {
      await plansAPI.delete(id);
      await loadData();
      // Recarregar planos do produto selecionado
      if (selectedProduct) {
        await loadPlansForProduct(selectedProduct._id || selectedProduct);
      }
    } catch (error) {
      alert(error.message || 'Erro ao deletar plano');
    }
  };

  const loadPlansForProduct = async (productId) => {
    try {
      const plansData = await plansAPI.getByProduct(productId);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Erro ao carregar planos do produto:', error);
      setPlans([]);
    }
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    await loadPlansForProduct(product._id);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setPlans([]);
  };

  const resetForm = () => {
    console.log('🔄 resetForm chamado');
    setFormData({
      name: '',
      value: '',
      product: selectedProduct ? (selectedProduct._id || selectedProduct) : '',
      active: true,
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="plans-modal-overlay" onClick={onClose}>
      <div className="plans-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="plans-modal-header">
          <div className="header-title-section">
            {selectedProduct && !showForm && (
              <button className="btn-back-products" onClick={handleBackToProducts}>
                <FaArrowLeft /> Voltar
              </button>
            )}
            <h2>
              {selectedProduct && !showForm 
                ? `Planos - ${selectedProduct.name || 'Produto'}`
                : 'Gerenciar Planos'
              }
            </h2>
          </div>
          <div className="modal-header-actions">
            {!showForm && selectedProduct && (
              <button 
                className="btn-add-plan" 
                onClick={() => {
                  setFormData({
                    ...formData,
                    product: selectedProduct._id || selectedProduct,
                  });
                  setShowForm(true);
                }}
              >
                <FaPlus /> Novo Plano
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="plans-modal-body">
          {showForm ? (
            <form onSubmit={handleSubmit} className="plan-form">
              <div className="form-header">
                <h3>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</h3>
                <button type="button" className="btn-back" onClick={resetForm}>
                  <FaTimes /> Voltar
                </button>
              </div>

              <div className="form-group">
                <label>Nome do Plano *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Ex: Diário, Semanal, Mensal, Lifetime"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group form-group-status">
                  <label>Status</label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span>Plano Ativo</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Produto Associado *</label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  required
                  className="product-select"
                >
                  <option value="">Selecione um produto</option>
                  {allProducts.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                {allProducts.length === 0 && (
                  <p className="field-hint">
                    Nenhum produto disponível. 
                    <button
                      type="button"
                      className="link-button"
                      onClick={onClose}
                    >
                      Criar produto primeiro
                    </button>
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  <FaCheck /> {editingPlan ? 'Atualizar' : 'Criar Plano'}
                </button>
              </div>
            </form>
          ) : selectedProduct ? (
            // Mostrar planos do produto selecionado
            <>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando planos...</p>
                </div>
              ) : plans.length === 0 ? (
                <div className="empty-state">
                  <FaBox className="empty-icon" />
                  <h3>Nenhum plano cadastrado para este produto</h3>
                  <p>Comece adicionando seu primeiro plano</p>
                  <button 
                    className="btn-add-first" 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        product: selectedProduct._id || selectedProduct,
                      });
                      setShowForm(true);
                    }}
                  >
                    <FaPlus /> Adicionar Primeiro Plano
                  </button>
                </div>
              ) : (
                <div className="plans-list">
                  {plans.map((plan) => (
                    <div key={plan._id} className="plan-item">
                      <div className="plan-item-icon">
                        <FaBox />
                      </div>
                      
                      <div className="plan-item-info">
                        <div className="plan-item-header">
                          <h4>{plan.name}</h4>
                          <span className={`plan-status ${plan.active ? 'active' : 'inactive'}`}>
                            {plan.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <div className="plan-item-details">
                          <div className="plan-item-value">
                            <span className="plan-label">Valor:</span>
                            <span className="plan-value">{formatCurrency(plan.value || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="plan-item-actions">
                        <button 
                          className="btn-edit-item"
                          onClick={() => handleEdit(plan)}
                        >
                          <FaEdit /> Editar
                        </button>
                        <button 
                          className="btn-delete-item"
                          onClick={() => handleDelete(plan._id)}
                        >
                          <FaTrash /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Mostrar lista de produtos
            <>
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando produtos...</p>
                </div>
              ) : allProducts.length === 0 ? (
                <div className="empty-state">
                  <FaCube className="empty-icon" />
                  <h3>Nenhum produto cadastrado</h3>
                  <p>Crie produtos primeiro para adicionar planos</p>
                </div>
              ) : (
                <div className="products-list">
                  {allProducts.map((product) => {
                    const productPlansCount = plans.filter(
                      p => (p.product?._id || p.product || p.productId) === (product._id || product)
                    ).length;
                    
                    return (
                      <div 
                        key={product._id} 
                        className="product-card-item"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="product-card-icon">
                          <FaCube />
                        </div>
                        
                        <div className="product-card-info">
                          <h4>{product.name}</h4>
                          <p className="product-card-plans-count">
                            {productPlansCount} {productPlansCount === 1 ? 'plano' : 'planos'} cadastrado{productPlansCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <div className="product-card-arrow">
                          <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlansModal;

