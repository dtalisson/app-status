import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productsAPI } from '../../utils/api';
import { normalizeImageUrl } from '../../utils/imageNormalizer';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import LoginModal from '../../components/LoginModal/LoginModal';
import { FaSpinner, FaImage, FaArrowLeft, FaCheckCircle, FaClock, FaCalendar } from 'react-icons/fa';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getById(id);
      
      if (data) {
        setProduct(data);
        // Selecionar o plano mais barato por padrão
        if (data.plans && data.plans.length > 0) {
          const activePlans = data.plans
            .filter(plan => plan && (plan.active !== false))
            .map(plan => typeof plan === 'object' ? plan : {});
          
          if (activePlans.length > 0) {
            const minPlan = activePlans.reduce((min, plan) => {
              return (plan.value || 0) < (min.value || 0) ? plan : min;
            });
            setSelectedPlan(minPlan);
          }
        }
      } else {
        setError('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setError('Erro ao carregar produto. Tente novamente mais tarde.');
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

  const getPlanIcon = (planName) => {
    const name = planName?.toLowerCase() || '';
    if (name.includes('diário') || name.includes('diario') || name.includes('daily')) {
      return <FaClock />;
    } else if (name.includes('semanal') || name.includes('weekly')) {
      return <FaCalendar />;
    } else if (name.includes('mensal') || name.includes('monthly')) {
      return <FaCalendar />;
    }
    return <FaCheckCircle />;
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    const planObj = typeof selectedPlan === 'object' ? selectedPlan : {};
    return planObj.value || 0;
  };

  const handleAddToCart = () => {
    if (!user) {
      // Se não estiver logado, abrir modal de login
      setShowLoginModal(true);
      return;
    }

    if (!product || !selectedPlan) {
      alert('Por favor, selecione um plano primeiro');
      return;
    }

    addToCart(product, selectedPlan, 1);
    navigate('/carrinho');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Após login, adicionar ao carrinho automaticamente
    if (product && selectedPlan) {
      addToCart(product, selectedPlan, 1);
      navigate('/carrinho');
    }
  };

  if (loading) {
    return (
      <div className="ProductDetailPage">
        <ParticlesCanvas />
        <Header />
        <div className="product-detail-loading">
          <FaSpinner className="spinner-icon" />
          <p>Carregando produto...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="ProductDetailPage">
        <ParticlesCanvas />
        <Header />
        <div className="product-detail-error">
          <p>{error || 'Produto não encontrado'}</p>
          <button className="btn-back-to-products" onClick={() => navigate('/produtos')}>
            <FaArrowLeft /> Voltar para Produtos
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const activePlans = (product.plans || [])
    .filter(plan => plan && (plan.active !== false))
    .map(plan => typeof plan === 'object' ? plan : {})
    .sort((a, b) => (a.value || 0) - (b.value || 0));

  return (
    <div className="ProductDetailPage">
      <ParticlesCanvas />
      <Header />
      
      <div className="product-detail-container">
        {/* Back Button */}
        <button className="btn-back-to-products" onClick={() => navigate('/produtos')}>
          <FaArrowLeft /> Voltar para Produtos
        </button>

        <div className="product-detail-content">
          {/* Top Section - Product Image and Plans */}
          <div className="product-detail-top">
            {/* Left Side - Product Image */}
            <div className="product-detail-left">
              <div className="product-image-wrapper">
                {(() => {
                  const normalizedUrl = normalizeImageUrl(product.imageUrl || '');
                  return normalizedUrl ? (
                    <img 
                      src={normalizedUrl} 
                      alt={product.name || 'Produto'}
                      className="product-detail-image"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      style={{
                        border: 'none',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                        borderRadius: 0,
                        borderWidth: 0,
                        borderStyle: 'none',
                        borderColor: 'transparent'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        // Forçar remoção de todas as bordas após carregar
                        e.target.style.border = 'none';
                        e.target.style.outline = 'none';
                        e.target.style.borderWidth = '0';
                        e.target.style.borderStyle = 'none';
                        e.target.style.borderColor = 'transparent';
                        e.target.style.borderRadius = '0';
                        e.target.style.padding = '0';
                        e.target.style.margin = '0';
                        
                        const fallback = e.target.nextSibling;
                        if (fallback) {
                          fallback.style.display = 'none';
                        }
                      }}
                    />
                  ) : null;
                })()}
                <div className="product-image-fallback" style={{ display: 'none' }}>
                  <FaImage />
                </div>
              </div>
            </div>

            {/* Right Side - Plans */}
            {activePlans.length > 0 ? (
              <div className="product-detail-right">
                <div className="plan-selection-box">
                  <h3 className="plan-selection-title">Selecione um Plano</h3>
                  <div className="plans-list">
                    {activePlans.map((plan, idx) => {
                      const planObj = typeof plan === 'object' ? plan : {};
                      const isSelected = selectedPlan && (
                        selectedPlan._id === planObj._id || 
                        (selectedPlan.name === planObj.name && selectedPlan.value === planObj.value)
                      );
                      return (
                        <div
                          key={planObj._id || plan || idx}
                          className={`plan-option-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedPlan(planObj)}
                        >
                          <div className="plan-option-icon">
                            {getPlanIcon(planObj.name)}
                          </div>
                          <div className="plan-option-info">
                            <span className="plan-option-name">{planObj.name || 'Plano'}</span>
                            <span className="plan-option-stock">5 em estoque</span>
                          </div>
                          <span className="plan-option-price">{formatCurrency(planObj.value || 0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Price and Purchase */}
                {selectedPlan && (
                  <div className="purchase-box">
                    <div className="purchase-total">
                      <div className="purchase-total-left">
                        <span className="purchase-label">PREÇO TOTAL</span>
                          <span className="purchase-plan-name">
                            {selectedPlan.name || 'Plano'}
                          </span>
                      </div>
                      <span className="purchase-total-price">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                    <div className="purchase-controls">
                      <button className="btn-purchase" onClick={handleAddToCart}>
                        {user ? 'Adicionar ao carrinho' : '→ Entrar para Comprar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="product-detail-right">
                <div className="no-plans-message">
                  <p>Este produto não possui planos disponíveis no momento.</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Sub Description */}
          {(product.subDescription || product.description) && (
            <div className="product-sub-description">
              <h1 className="product-detail-title">{product.name}</h1>
              <p style={{ whiteSpace: 'pre-line' }}>
                {product.subDescription || product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
};

export default ProductDetail;

