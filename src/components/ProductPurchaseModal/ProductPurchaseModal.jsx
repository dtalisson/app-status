import React from 'react';
import { FaTimes, FaCopy, FaBook, FaDownload } from 'react-icons/fa';
import './ProductPurchaseModal.css';

const ProductPurchaseModal = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  const product = purchase.product || purchase.productId || {};
  const plan = purchase.plan || purchase.planId || {};
  
  const handleCopyKey = () => {
    navigator.clipboard.writeText(purchase.key);
    alert('Key copiada!');
  };

  return (
    <div className="purchase-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="purchase-modal-container">
        <div className="purchase-modal-header">
          <h2>{product.name || 'Produto'}</h2>
          <button className="purchase-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="purchase-modal-body">
          {/* Informações do Produto */}
          <div className="purchase-modal-info">
            {/* Nome do Produto */}
            <div className="purchase-product-name">
              <h3>{product.name || 'Produto'}</h3>
            </div>

            {/* Plano */}
            {plan.name && (
              <div className="purchase-plan-badge">
                Plano: {plan.name}
              </div>
            )}

            {/* Key */}
            <div className="purchase-key-section">
              <label>Key:</label>
              <div className="purchase-key-container">
                <code className="purchase-key-code">{purchase.key}</code>
                <button className="purchase-copy-key-btn" onClick={handleCopyKey} title="Copiar Key">
                  <FaCopy />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseModal;

