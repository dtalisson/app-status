import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../../utils/api';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { FaImage } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await productsAPI.getAdmin();
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="products-loading">
          <div className="loading-spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="products-page">
        <div className="products-header">
          <h2>Visualização de Produtos</h2>
          <p className="products-header-subtitle">
            Para gerenciar produtos, use o dashboard administrativo
          </p>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <FaImage className="empty-icon" />
              <p>Nenhum produto cadastrado</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-container">
                  {product.imageUrl || product.image ? (
                    <img 
                      src={product.imageUrl || product.image} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="product-image-placeholder"
                    style={{ display: product.imageUrl || product.image ? 'none' : 'flex' }}
                  >
                    <FaImage />
                  </div>
                </div>
                
                <div className="product-info">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <span className={`product-status ${product.active ? 'active' : 'inactive'}`}>
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <p className="product-description">
                    {product.description || 'Sem descrição'}
                  </p>
                  
                  <div className="product-price">
                    {formatCurrency(product.price || 0)}
                  </div>
                  
                  {product.plans && product.plans.length > 0 && (
                    <div className="product-plans-list">
                      <strong>Planos associados:</strong>
                      <div className="plans-tags">
                        {product.plans.map((plan, idx) => (
                          <span key={plan._id || idx} className="plan-tag">
                            {(plan.name || plan).substring(0, 20)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="product-actions">
                  <span className="product-view-only">Somente visualização</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Products;
