import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { couponsAPI, checkoutAPI } from '../../utils/api';
import { normalizeImageUrl } from '../../utils/imageNormalizer';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleQuantityChange = (itemId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;
    updateQuantity(itemId, newQuantity);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const result = await couponsAPI.validate(couponCode.toUpperCase().trim());
      if (result.valid) {
        setAppliedCoupon({
          code: result.code,
          percentage: result.percentage
        });
        setCouponError('');
      } else {
        setCouponError('Cupom inválido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(error.message || 'Cupom inválido');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartTotal();
    return (subtotal * appliedCoupon.percentage) / 100;
  };

  const calculateFinalTotal = () => {
    const subtotal = getCartTotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const subtotal = getCartTotal();
  const discount = calculateDiscount();
  const finalTotal = calculateFinalTotal();

  const handleCheckout = async () => {
    if (!user) {
      alert('Por favor, faça login para finalizar a compra');
      return;
    }

    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }

    setCheckingOut(true);

    try {
      // Preparar itens para checkout
      const items = cartItems.map(item => ({
        productId: item.productId,
        planId: item.planId,
        quantity: item.quantity
      }));

      console.log('🛒 Finalizando compra:', { items, couponCode: appliedCoupon?.code });

      const result = await checkoutAPI.checkout(items, appliedCoupon?.code);
      
      console.log('✅ Compra finalizada com sucesso:', result);

      // Limpar carrinho
      clearCart();
      setAppliedCoupon(null);
      setCouponCode('');

      // Redirecionar para o perfil
      alert(`✅ ${result.message || 'Compra realizada com sucesso!'}`);
      navigate('/perfil');
    } catch (error) {
      console.error('❌ Erro ao finalizar compra:', error);
      alert(error.message || 'Erro ao finalizar compra. Tente novamente.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="CartPage">
      <ParticlesCanvas />
      <Header />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1 className="cart-title">Seu Carrinho de Compras</h1>
          <p className="cart-subtitle">
            Revise seus itens, aplique cupons e prossiga para uma compra segura e rápida com a gente.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione produtos ao carrinho para continuar</p>
          </div>
        ) : (
          <div className="cart-content">
            {/* Seção do Carrinho */}
            <div className="cart-items-section">
              <div className="cart-section-header">
                <h2>Seu Carrinho</h2>
              </div>

              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const normalizedImageUrl = normalizeImageUrl(item.productImage || '');
                  return (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-image">
                        {normalizedImageUrl ? (
                          <img 
                            src={normalizedImageUrl} 
                            alt={item.productName}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="cart-item-image-placeholder">
                            <FaShoppingCart />
                          </div>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <h3 className="cart-item-name">{item.productName}</h3>
                        <p className="cart-item-plan">Plano: {item.planName}</p>

                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <div className="cart-item-price">
                            {formatCurrency(item.planValue * item.quantity)}
                          </div>

                          <button
                            className="btn-remove-item"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="cart-summary-section">
              <div className="cart-summary-box">
                <h2>Resumo do Pedido</h2>

                <div className="coupon-section">
                  <label>Cupom de Desconto</label>
                  {appliedCoupon ? (
                    <div className="coupon-applied">
                      <div className="coupon-applied-info">
                        <FaCheck className="coupon-check-icon" />
                        <span className="coupon-applied-code">{appliedCoupon.code}</span>
                        <span className="coupon-applied-percentage">-{appliedCoupon.percentage}%</span>
                      </div>
                      <button className="btn-remove-coupon" onClick={handleRemoveCoupon}>
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-input-group">
                      <input 
                        type="text" 
                        placeholder="Seu código" 
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        disabled={applyingCoupon}
                      />
                      <button 
                        className="btn-apply-coupon" 
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                      >
                        {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="coupon-error">{couponError}</p>
                  )}
                </div>

                <div className="summary-totals">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row summary-discount">
                      <span>Desconto ({appliedCoupon.percentage}%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="summary-row summary-total">
                    <span>Total</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <button 
                  className="btn-checkout" 
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                >
                  {checkingOut ? (
                    <>
                      <FaSpinner className="spinner-icon" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    'Finalizar Compra'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;

