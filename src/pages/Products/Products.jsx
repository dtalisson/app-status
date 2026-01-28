import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Products.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { productsAPI } from '../../utils/api';
import { normalizeImageUrl } from '../../utils/imageNormalizer';
import { FaImage, FaSpinner } from 'react-icons/fa';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      // A API retorna apenas produtos ativos
      const productsData = data || [];
      console.log('📦 Produtos carregados:', productsData.length);
      productsData.forEach(product => {
        console.log(`  - ${product.name || 'SEM NOME'}:`, {
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl ? 'SIM' : 'NÃO',
          plansCount: product.plans ? product.plans.length : 0,
          active: product.active
        });
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos. Tente novamente mais tarde.');
      setProducts([]);
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

  const getProductStatus = (product) => {
    // Produto ativo e com planos disponíveis = Disponível
    if (product.active && product.plans && product.plans.length > 0) {
      return 'Disponível';
    }
    return 'Indisponível';
  };

  return (
    <div className="ProductsPage">
      <div className="ProductsPage-content">
        <ParticlesCanvas />
        <Header />
        <section className="products-hero">
          <div className="products-hero-content">
            <h1>Escolha seu produto</h1>
            <p>Planos flexíveis, ativação imediata e suporte 24/7.</p>
          </div>
        </section>

        <section className="products-grid">
          {loading ? (
            <div className="products-loading">
              <FaSpinner className="spinner-icon" />
              <p>Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="products-error">
              <p>{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <FaImage className="empty-icon" />
              <h3>Nenhum produto disponível</h3>
              <p>Novos produtos em breve!</p>
            </div>
          ) : (
            products.map((product) => {
              const status = getProductStatus(product);
              const hasPlans = product.plans && product.plans.length > 0;
              
              return (
                <div key={product._id} className="product-card">
                  {/* Área da imagem com overlay de informações */}
                  <div className="product-image-container">
                    {(() => {
                      const normalizedUrl = normalizeImageUrl(product.imageUrl || '');
                      return normalizedUrl ? (
                        <>
                          <img 
                            key={`${product._id}-${normalizedUrl}`}
                            src={normalizedUrl} 
                            alt={product.name || 'Produto'}
                            className="product-image"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              console.error('❌ Erro ao carregar imagem do produto:', {
                                urlOriginal: product.imageUrl,
                                urlNormalizada: normalizedUrl,
                                urlTentada: e.target.src,
                                productId: product._id,
                                productName: product.name
                              });
                              const currentSrc = e.target.src;
                              if (!currentSrc.includes('?retry=')) {
                                e.target.src = currentSrc.split('?')[0] + '?retry=' + Date.now();
                                return;
                              }
                              e.target.style.display = 'none';
                              const fallback = e.target.nextSibling;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                            onLoad={(e) => {
                              console.log('✅ Imagem carregada com sucesso:', normalizedUrl);
                              const fallback = e.target.nextSibling;
                              if (fallback) {
                                fallback.style.display = 'none';
                              }
                            }}
                          />
                          <div 
                            className="product-image-fallback"
                            style={{ display: 'none' }}
                          >
                            <FaImage />
                          </div>
                        </>
                      ) : (
                        <div className="product-image-fallback" style={{ display: 'flex' }}>
                          <FaImage />
                        </div>
                      );
                    })()}
                    
                    {/* Badge sobre a imagem (topo direito) - Status Disponível/Indisponível */}
                    <div className={`product-image-badge ${status === 'Disponível' ? 'available' : 'unavailable'}`}>
                      {status}
                    </div>
                  </div>

                  {/* Informações do produto embaixo da imagem */}
                  <div className="product-info-section">
                    {/* Nome do produto */}
                    <h3 className="product-name">{product.name || 'Produto sem nome'}</h3>
                    
                    {/* Preço mínimo a partir do plano mais barato */}
                    {hasPlans ? (() => {
                      const activePlans = product.plans
                        .filter(plan => plan && (plan.active !== false))
                        .map(plan => typeof plan === 'object' ? plan : {})
                        .filter(plan => plan.value !== undefined && plan.value !== null);
                      
                      if (activePlans.length === 0) {
                        return (
                          <div className="product-price-section">
                            <span className="product-price-label">Indisponível</span>
                            <span className="product-price-value" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              Sem planos ativos
                            </span>
                          </div>
                        );
                      }
                      
                      // Encontrar o plano com menor valor
                      const minPlan = activePlans.reduce((min, plan) => {
                        return (plan.value || 0) < (min.value || 0) ? plan : min;
                      });
                      
                      return (
                        <div className="product-price-section">
                          <span className="product-price-label">Planos a partir de:</span>
                          <span className="product-price-value">{formatCurrency(minPlan.value || 0)}</span>
                        </div>
                      );
                    })() : (
                      <div className="product-price-section">
                        <span className="product-price-label">Indisponível</span>
                        <span className="product-price-value" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Sem planos
                        </span>
                      </div>
                    )}
                    
                    {/* Descrição */}
                    {product.description && (
                      <div className="product-desc-box">
                        <p className="product-desc">{product.description}</p>
                      </div>
                    )}
                    
                    {/* Botões de ação */}
                    <div className="product-actions">
                      <button className="btn ghost">
                        COMPRAR
                      </button>
                      <button 
                        className="btn primary" 
                        disabled={status !== 'Disponível'}
                        onClick={() => navigate(`/produto/${product._id}`)}
                      >
                        Ver Planos
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
        <Footer />
      </div>
    </div>
  );
};

export default Products;
