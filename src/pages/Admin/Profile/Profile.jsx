import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { adminAPI, stockAPI, productsAPI } from '../../../utils/api';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import ParticlesCanvas from '../../../components/ParticlesCanvas/ParticlesCanvas';
import ProductsModal from '../../../components/Admin/ProductsModal/ProductsModal';
import PlansModal from '../../../components/Admin/PlansModal/PlansModal';
import CouponsModal from '../../../components/Admin/CouponsModal/CouponsModal';
import StockModal from '../../../components/Admin/StockModal/StockModal';
import { 
  FaUsers,
  FaShoppingBag,
  FaUser,
  FaCopy,
  FaCube,
  FaSignOutAlt,
  FaEdit,
  FaChartLine,
  FaBox,
  FaTicketAlt,
  FaKey,
  FaChevronRight,
  FaTrash,
  FaSave,
  FaTimes
} from 'react-icons/fa';
import './Profile.css';

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [copied, setCopied] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  
  // Stock states
  const [stock, setStock] = useState([]);
  const [stockStats, setStockStats] = useState({ total: 0, available: 0, used: 0 });
  const [stockLoading, setStockLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [editingKey, setEditingKey] = useState(null);
  const [editingKeyValue, setEditingKeyValue] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeMenu === 'estoque') {
      loadStockData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, salesData, usersData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSales(),
        adminAPI.getUsers(),
      ]);
      
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalSales: statsData.totalSales || 0,
        totalRevenue: statsData.totalRevenue || 0,
      });
      
      // API retorna { sales: [...] }
      setRecentSales((salesData.sales || []).slice(0, 5));
      // API retorna { users: [...] }
      setUsers((usersData.users || []).slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setRecentSales([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStockData = async () => {
    try {
      setStockLoading(true);
      const [stockData, statsData, productsData] = await Promise.all([
        stockAPI.getAll({}),
        stockAPI.getStats({}),
        productsAPI.getAdmin(),
      ]);
      setStock(stockData);
      setStockStats(statsData);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    } finally {
      setStockLoading(false);
    }
  };

  // Agrupar produtos com estatísticas
  const productsWithStock = useMemo(() => {
    if (!products.length || !stock.length) {
      return products.map(product => ({
        product,
        totalKeys: 0,
        availableKeys: 0,
        usedKeys: 0,
        plansCount: 0
      }));
    }

    return products.map(product => {
      const productKeys = stock.filter(item => {
        const itemProductId = item.product?._id || item.product;
        return itemProductId === product._id;
      });
      
      const plansSet = new Set();
      productKeys.forEach(key => {
        const planId = key.plan?._id || key.plan || 'sem-plano';
        plansSet.add(planId);
      });

      return {
        product,
        totalKeys: productKeys.length,
        availableKeys: productKeys.filter(k => !k.used).length,
        usedKeys: productKeys.filter(k => k.used).length,
        plansCount: plansSet.size
      };
    }).filter(p => p.totalKeys > 0); // Apenas produtos com keys
  }, [products, stock]);

  // Agrupar keys por produto (para referência)
  const stockByProduct = useMemo(() => {
    const grouped = {};
    
    // Inicializar todos os produtos
    products.forEach(product => {
      grouped[product._id] = {
        product,
        keys: [],
        stats: { total: 0, available: 0, used: 0 }
      };
    });

    // Agrupar keys por produto
    stock.forEach(item => {
      const productId = item.product?._id || item.product;
      if (productId && grouped[productId]) {
        grouped[productId].keys.push(item);
        grouped[productId].stats.total++;
        if (item.used) {
          grouped[productId].stats.used++;
        } else {
          grouped[productId].stats.available++;
        }
      }
    });

    // Converter para array, filtrar produtos com keys e ordenar por nome do produto
    return Object.values(grouped)
      .filter(group => group.keys.length > 0) // Apenas produtos com keys
      .sort((a, b) => 
        (a.product.name || '').localeCompare(b.product.name || '')
      )
      .map(group => {
        // Agrupar keys por plano
        const keysByPlan = {};
        group.keys.forEach(key => {
          const planId = key.plan?._id || key.plan || 'sem-plano';
          if (!keysByPlan[planId]) {
            keysByPlan[planId] = {
              plan: key.plan || null,
              keys: [],
              stats: { total: 0, available: 0, used: 0 }
            };
          }
          keysByPlan[planId].keys.push(key);
          keysByPlan[planId].stats.total++;
          if (key.used) {
            keysByPlan[planId].stats.used++;
          } else {
            keysByPlan[planId].stats.available++;
          }
        });
        return {
          ...group,
          keysByPlan: Object.values(keysByPlan).sort((a, b) => {
            const nameA = a.plan?.name || 'Sem Plano';
            const nameB = b.plan?.name || 'Sem Plano';
            return nameA.localeCompare(nameB);
          })
        };
      });
  }, [stock, products]);

  const toggleProduct = (productId) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleDeleteKey = async (keyId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta key?')) return;
    try {
      await stockAPI.delete(keyId);
      await loadStockData();
    } catch (error) {
      console.error('Erro ao excluir key:', error);
      alert('Erro ao excluir key');
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingKeyValue('');
  };

  const handleStartEdit = (keyItem) => {
    setEditingKey(keyItem._id);
    setEditingKeyValue(keyItem.key);
  };

  const handleSaveEditKey = async (keyId) => {
    if (!editingKeyValue.trim()) {
      alert('A key não pode estar vazia');
      return;
    }
    try {
      await stockAPI.update(keyId, editingKeyValue.trim());
      await loadStockData();
      setEditingKey(null);
      setEditingKeyValue('');
    } catch (error) {
      console.error('Erro ao editar key:', error);
      alert(error.message || 'Erro ao editar key');
    }
  };

  const handleDeletePlanKeys = async (productId, planId) => {
    const planName = stockByProduct
      .find(p => p.product._id === productId)
      ?.keysByPlan?.find(pl => (pl.plan?._id || pl.plan || 'sem-plano') === planId)
      ?.plan?.name || 'este plano';
    
    if (!window.confirm(`Tem certeza que deseja excluir TODAS as keys disponíveis do plano "${planName}"?`)) {
      return;
    }
    
    try {
      const productStock = stockByProduct.find(p => p.product._id === productId);
      if (!productStock) return;
      
      const planStock = productStock.keysByPlan?.find(pl => (pl.plan?._id || pl.plan || 'sem-plano') === planId);
      if (!planStock) return;
      
      // Excluir apenas keys disponíveis (não usadas)
      const availableKeys = planStock.keys.filter(k => !k.used);
      
      if (availableKeys.length === 0) {
        alert('Não há keys disponíveis para excluir neste plano');
        return;
      }
      
      await Promise.all(availableKeys.map(k => stockAPI.delete(k._id)));
      await loadStockData();
    } catch (error) {
      console.error('Erro ao excluir keys do plano:', error);
      alert('Erro ao excluir keys do plano');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-text">
                    <div className="stat-title">Total de Usuários</div>
                    <div className="stat-subtitle">Usuários cadastrados</div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-number">{stats.totalSales}</div>
                  <div className="stat-text">
                    <div className="stat-title">Vendas Realizadas</div>
                    <div className="stat-subtitle">Total de keys vendidas</div>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-content">
                  <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="stat-text">
                    <div className="stat-title">Receita Total</div>
                    <div className="stat-subtitle">Faturamento acumulado</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Sections */}
            {activeMenu === 'dashboard' && (
              <>
                <div className="dashboard-section">
                  <h2 className="section-title">Vendas Recentes</h2>
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Carregando vendas...</p>
                    </div>
                  ) : recentSales.length === 0 ? (
                    <div className="empty-state-card">
                      <FaShoppingBag className="empty-icon" />
                      <h3>Nenhuma Venda Encontrada</h3>
                      <p>Ainda não há vendas registradas no sistema.</p>
                    </div>
                  ) : (
                    <div className="sales-list">
                      {recentSales.map((sale) => (
                        <div key={sale._id} className="sale-card">
                          <div className="sale-info">
                            <h4>{sale.product?.name || 'Produto'}</h4>
                            <p className="sale-user">
                              {sale.userId?.discordUsername || sale.userName || 'Usuário'} - {sale.userId?.email || sale.userEmail}
                            </p>
                            <p className="sale-key">Key: <code>{sale.key}</code></p>
                            <p className="sale-date">{formatDate(sale.createdAt)}</p>
                          </div>
                          <div className="sale-value">
                            {formatCurrency(sale.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-section">
                  <h2 className="section-title">Usuários Recentes</h2>
                  {loading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Carregando usuários...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="empty-state-card">
                      <FaUsers className="empty-icon" />
                      <h3>Nenhum Usuário Encontrado</h3>
                      <p>Ainda não há usuários cadastrados.</p>
                    </div>
                  ) : (
                    <div className="users-list">
                      {users.map((u) => (
                        <div key={u._id} className="user-card">
                          <div className="user-avatar-small">
                            {u.discordAvatar ? (
                              <img src={u.discordAvatar} alt={u.discordUsername || 'User'} />
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div className="user-info-small">
                            <h4>{u.discordUsername || u.username || 'Usuário'}</h4>
                            <p>{u.email || 'Sem email'}</p>
                            <p className="user-date">Cadastrado em {formatDate(u.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeMenu === 'produtos' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">Gerenciar Produtos</h2>
                  <button 
                    className="admin-action-button"
                    onClick={() => setShowProductsModal(true)}
                  >
                    <FaEdit />
                    <span>Gerenciar Produtos</span>
                  </button>
                </div>
                <p className="section-description">
                  Gerencie produtos, preços, imagens e planos do sistema.
                </p>
              </div>
            )}

            {activeMenu === 'planos' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">Gerenciar Planos</h2>
                  <button 
                    className="admin-action-button"
                    onClick={() => setShowPlansModal(true)}
                  >
                    <FaEdit />
                    <span>Gerenciar Planos</span>
                  </button>
                </div>
                <p className="section-description">
                  Gerencie planos e associe-os aos produtos.
                </p>
              </div>
            )}

            {activeMenu === 'cupons' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">Gerenciar Cupons</h2>
                  <button 
                    className="admin-action-button"
                    onClick={() => setShowCouponsModal(true)}
                  >
                    <FaTicketAlt />
                    <span>Gerenciar Cupons</span>
                  </button>
                </div>
                <p className="section-description">
                  Crie e gerencie cupons de desconto para os clientes.
                </p>
              </div>
            )}

            {activeMenu === 'vendas' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">Gerenciar Vendas</h2>
                  <button 
                    className="admin-action-button"
                    onClick={() => setActiveMenu('dashboard')}
                  >
                    <FaChartLine />
                    <span>Ver Estatísticas no Dashboard</span>
                  </button>
                </div>
                <p className="section-description">
                  Visualize todas as vendas e estatísticas detalhadas no dashboard principal.
                </p>
              </div>
            )}

            {activeMenu === 'estoque' && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h2 className="section-title">Gerenciar Estoque</h2>
                  <button 
                    className="admin-action-button"
                    onClick={() => setShowStockModal(true)}
                  >
                    <FaKey />
                    <span>Adicionar Keys</span>
                  </button>
                </div>
                
                {/* Estatísticas do Estoque */}
                <div className="stock-stats-cards">
                  <div className="stock-stat-card">
                    <div className="stock-stat-number">{stockStats.total}</div>
                    <div className="stock-stat-label">Total</div>
                  </div>
                  <div className="stock-stat-card available">
                    <div className="stock-stat-number">{stockStats.available}</div>
                    <div className="stock-stat-label">Disponíveis</div>
                  </div>
                  <div className="stock-stat-card used">
                    <div className="stock-stat-number">{stockStats.used}</div>
                    <div className="stock-stat-label">Usadas</div>
                  </div>
                </div>

                {/* Lista de Produtos com Cards */}
                <div className="stock-list-section">
                  {stockLoading ? (
                    <div className="stock-loading-state">
                      <div className="loading-spinner"></div>
                      <p>Carregando keys...</p>
                    </div>
                  ) : productsWithStock.length === 0 ? (
                    <div className="stock-empty-state">
                      <FaKey className="empty-icon" />
                      <p>Nenhuma key no estoque</p>
                      <p className="empty-hint">Clique em "Adicionar Keys" para começar</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="stock-list-title">Produtos com Estoque</h3>
                      <div className="stock-products-cards-list">
                        {productsWithStock.map(({ product, totalKeys, availableKeys, usedKeys, plansCount: productPlansCount }) => {
                          const productData = stockByProduct.find(p => p.product._id === product._id);
                          const keysByPlan = productData?.keysByPlan || [];
                          const stats = productData?.stats || { total: totalKeys, available: availableKeys, used: usedKeys };
                          const isExpanded = expandedProducts.has(product._id);
                          const plansCount = keysByPlan?.length || productPlansCount || 0;
                        
                        return (
                          <div key={product._id} className="stock-product-card">
                            <div 
                              className="stock-product-card-header" 
                              onClick={() => toggleProduct(product._id)}
                            >
                              <div className="stock-product-card-icon">
                                <FaCube />
                              </div>
                              <div className="stock-product-card-info">
                                <h4 className="stock-product-card-name">{product.name}</h4>
                                <p className="stock-product-card-plans">{plansCount} {plansCount === 1 ? 'plano cadastrado' : 'planos cadastrados'}</p>
                              </div>
                              <FaChevronRight 
                                className={`stock-product-card-arrow ${isExpanded ? 'expanded' : ''}`}
                              />
                            </div>
                            
                            {isExpanded && (
                              <div className="stock-product-card-content">
                                <div className="stock-product-summary-stats">
                                  <div className="summary-stat">
                                    <span className="summary-stat-value">{stats.total}</span>
                                    <span className="summary-stat-label">Total</span>
                                  </div>
                                  <div className="summary-stat available">
                                    <span className="summary-stat-value">{stats.available}</span>
                                    <span className="summary-stat-label">Disponíveis</span>
                                  </div>
                                  <div className="summary-stat used">
                                    <span className="summary-stat-value">{stats.used}</span>
                                    <span className="summary-stat-label">Usadas</span>
                                  </div>
                                </div>
                                
                                {keysByPlan && keysByPlan.length > 0 ? (
                                  <div className="stock-plans-list">
                                    {keysByPlan.map(({ plan, keys: planKeys, stats: planStats }) => (
                                      <div key={plan?._id || 'sem-plano'} className="stock-plan-section">
                                        <div className="stock-plan-header">
                                          <div className="stock-plan-info">
                                            <h5 className="stock-plan-name">
                                              {plan?.name || 'Sem Plano'}
                                            </h5>
                                            <span className="stock-plan-keys-count">
                                              {planStats.total} {planStats.total === 1 ? 'key' : 'keys'} 
                                              {' '}({planStats.available} disponíveis)
                                            </span>
                                          </div>
                                          <button
                                            className="stock-plan-delete-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeletePlanKeys(product._id, plan?._id || plan || 'sem-plano');
                                            }}
                                            title="Excluir todas as keys disponíveis deste plano"
                                            disabled={planStats.available === 0}
                                          >
                                            <FaTrash />
                                            <span>Excluir Disponíveis</span>
                                          </button>
                                        </div>
                                        
                                        <div className="stock-keys-list">
                                          {planKeys.map((keyItem) => (
                                            <div 
                                              key={keyItem._id} 
                                              className={`stock-key-item ${keyItem.used ? 'used' : ''}`}
                                            >
                                              {editingKey === keyItem._id ? (
                                                <div className="stock-key-edit-form">
                                                  <input
                                                    type="text"
                                                    value={editingKeyValue}
                                                    onChange={(e) => setEditingKeyValue(e.target.value)}
                                                    className="stock-key-edit-input"
                                                    autoFocus
                                                  />
                                                  <div className="stock-key-edit-actions">
                                                    <button
                                                      className="stock-key-btn save"
                                                      onClick={() => handleSaveEditKey(keyItem._id)}
                                                    >
                                                      <FaSave />
                                                      <span>Salvar</span>
                                                    </button>
                                                    <button
                                                      className="stock-key-btn cancel"
                                                      onClick={handleCancelEdit}
                                                    >
                                                      <FaTimes />
                                                      <span>Cancelar</span>
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <>
                                                  <div className="stock-key-value">
                                                    <code>{keyItem.key}</code>
                                                    <span className={`stock-key-status ${keyItem.used ? 'used' : 'available'}`}>
                                                      {keyItem.used ? 'Usada' : 'Disponível'}
                                                    </span>
                                                  </div>
                                                  <div className="stock-key-actions">
                                                    <button
                                                      className="stock-key-action-btn edit"
                                                      onClick={() => handleStartEdit(keyItem)}
                                                      title="Editar key"
                                                      disabled={keyItem.used}
                                                    >
                                                      <FaEdit />
                                                    </button>
                                                    <button
                                                      className="stock-key-action-btn delete"
                                                      onClick={() => handleDeleteKey(keyItem._id)}
                                                      title="Excluir key"
                                                    >
                                                      <FaTrash />
                                                    </button>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="stock-product-empty">
                                    <p>Nenhuma key cadastrada para este produto</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
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
              <div className="sidebar-username">{user.discordUsername || user.username || 'Admin'}</div>
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
              <div className="admin-badge">Administrador</div>
            </div>

            <nav className="sidebar-menu">
              <button 
                className={`sidebar-menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveMenu('dashboard')}
              >
                <FaChartLine />
                <span>Dashboard</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'produtos' ? 'active' : ''}`}
                onClick={() => setActiveMenu('produtos')}
              >
                <FaCube />
                <span>Produtos</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'planos' ? 'active' : ''}`}
                onClick={() => setActiveMenu('planos')}
              >
                <FaBox />
                <span>Planos</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'cupons' ? 'active' : ''}`}
                onClick={() => setActiveMenu('cupons')}
              >
                <FaTicketAlt />
                <span>Cupons</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'vendas' ? 'active' : ''}`}
                onClick={() => setActiveMenu('vendas')}
              >
                <FaShoppingBag />
                <span>Vendas</span>
              </button>
              <button 
                className={`sidebar-menu-item ${activeMenu === 'estoque' ? 'active' : ''}`}
                onClick={() => setActiveMenu('estoque')}
              >
                <FaKey />
                <span>Estoque</span>
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
      
      <ProductsModal 
        isOpen={showProductsModal}
        onClose={() => setShowProductsModal(false)}
      />
      
      <PlansModal 
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
      />
      
      <CouponsModal 
        isOpen={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
      />

      <StockModal
        isOpen={showStockModal}
        onClose={() => {
          setShowStockModal(false);
          if (activeMenu === 'estoque') {
            loadStockData();
          }
        }}
      />
    </div>
  );
};

export default AdminProfile;

