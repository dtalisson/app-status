import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ParticlesCanvas from '../../components/ParticlesCanvas/ParticlesCanvas';
import ProductPurchaseModal from '../../components/ProductPurchaseModal/ProductPurchaseModal';
import { 
  FaLock,
  FaCalendarAlt, 
  FaTag, 
  FaDollarSign, 
  FaUser, 
  FaCopy,
  FaCube,
  FaBook,
  FaDownload,
  FaSignOutAlt,
  FaSearch,
  FaEye
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [activeMenu, setActiveMenu] = useState('produtos');
  const [copied, setCopied] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Se for admin, redirecionar para perfil admin
    if (isAdmin) {
      navigate('/admin/profile');
      return;
    }

    loadPurchases();
  }, [user, isAdmin, navigate]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getPurchases();
      if (data && data.purchases) {
        setPurchases(data.purchases);
        const total = data.purchases.reduce((sum, purchase) => sum + (purchase.value || 0), 0);
        setTotalSpent(total);
        // Produtos ativos são aqueles com status 'completed'
        const active = data.purchases.filter(p => p.status === 'completed').length;
        setActiveProducts(active);
      }
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const copyUserId = () => {
    if (user?.id || user?._id) {
      const userId = (user.id || user._id).toString();
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  const userId = (user.id || user._id || '').toString();
  const displayId = userId.length > 20 ? userId.substring(0, 20) + '...' : userId;

  return (
    <div className="profile-page">
      <ParticlesCanvas />
      <Header />
      <div className="profile-container">
        <div className="profile-layout">
          {/* Main Content */}
          <div className="profile-main">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-number">{purchases.length}</div>
                  <div className="stat-text">
                    <div className="stat-title">Compras Realizadas</div>
                    <div className="stat-subtitle">x Sem dados anteriores</div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-number">{activeProducts}</div>
                  <div className="stat-text">
                    <div className="stat-title">Produtos Ativos</div>
                    <div className="stat-subtitle">x Sem dados anteriores</div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-number">{formatCurrency(totalSpent)}</div>
                  <div className="stat-text">
                    <div className="stat-title">Total Gasto</div>
                    <div className="stat-subtitle">x Sem dados anteriores</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="products-section">
              <h2 className="section-title">Os Meus Produtos Adquiridos</h2>
              
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Carregando produtos...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="empty-state-card">
                  <FaLock className="empty-icon" />
                  <h3>Nenhum Produto Encontrado</h3>
                  <p>Você ainda não adquiriu nenhum produto. Que tal explorar a nossa loja?</p>
                  <button 
                    className="explore-button"
                    onClick={() => navigate('/produtos')}
                  >
                    <FaSearch />
                    <span>Explorar Produtos</span>
                  </button>
                </div>
              ) : (
                <div className="sales-list">
                  {purchases.map((purchase) => {
                    const productObj = purchase.product || purchase.productId || {};
                    const productName = productObj.name || 'Produto';
                    return (
                      <div key={purchase._id} className="sale-card compact">
                        <div className="sale-info">
                          <h4>{productName}</h4>
                          <div className="sale-purchase-id">
                            ID do Pedido: <code>{purchase._id}</code>
                          </div>
                        </div>
                        <button 
                          className="btn-view-product"
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setShowPurchaseModal(true);
                          }}
                          title="Ver Pedido"
                        >
                          <FaEye />
                          <span>Ver Pedido</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="profile-sidebar">
            <div className="sidebar-user-section">
              <div className="sidebar-avatar">
                {user.discordAvatar ? (
                  <img 
                    src={user.discordAvatar} 
                    alt={user.discordUsername || 'User'} 
                  />
                ) : (
                  <div className="sidebar-avatar-placeholder">
                    <FaUser />
                  </div>
                )}
              </div>
              <div className="sidebar-username">{user.discordUsername || user.username || 'Usuário'}</div>
              <div className="sidebar-user-id">
                <span>{displayId}</span>
                <button 
                  className="copy-id-button" 
                  onClick={copyUserId}
                  title={copied ? 'Copiado!' : 'Copiar ID'}
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <nav className="sidebar-menu">
              <button 
                className={`sidebar-menu-item ${activeMenu === 'produtos' ? 'active' : ''}`}
                onClick={() => setActiveMenu('produtos')}
              >
                <FaCube />
                <span>Os Meus Produtos</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'tutoriais' ? 'active' : ''}`}
                onClick={() => setActiveMenu('tutoriais')}
              >
                <FaBook />
                <span>Tutoriais</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'downloads' ? 'active' : ''}`}
                onClick={() => setActiveMenu('downloads')}
              >
                <FaDownload />
                <span>Downloads</span>
              </button>
              <button 
                className="sidebar-menu-item logout"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <FaSignOutAlt />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
      <Footer />
      
      <ProductPurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedPurchase(null);
        }}
        purchase={selectedPurchase}
      />
    </div>
  );
};

export default Profile;

