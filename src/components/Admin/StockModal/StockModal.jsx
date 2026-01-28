import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { productsAPI, plansAPI, stockAPI } from '../../../utils/api';
import { FaPlus, FaTrash, FaKey } from 'react-icons/fa';
import './StockModal.css';

const StockModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stock, setStock] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, used: 0 });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [keysInput, setKeysInput] = useState('');
  const [adding, setAdding] = useState(false);

  const filteredPlans = useMemo(() => {
    if (!selectedProduct) return [];
    return plans.filter(p => p.product && p.product._id === selectedProduct);
  }, [plans, selectedProduct]);

  const loadStock = useCallback(async () => {
    const [stockData, statsData] = await Promise.all([
      stockAPI.getAll({}),
      stockAPI.getStats({}),
    ]);
    setStock(stockData);
    setStats(statsData);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, plansData] = await Promise.all([
        productsAPI.getAdmin(),
        plansAPI.getAll(),
      ]);
      setProducts(productsData);
      setPlans(plansData);
      await loadStock();
    } finally {
      setLoading(false);
    }
  }, [loadStock]);

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen, loadData]);

  const handleAddKeys = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !keysInput.trim()) return;
    setAdding(true);
    try {
      const keysArray = keysInput
        .split(/\n|,/)
        .map(k => k.trim())
        .filter(Boolean);
      const res = await stockAPI.add(keysArray, selectedProduct, selectedPlan || null);
      if (res?.success) {
        setKeysInput('');
        setSelectedProduct('');
        setSelectedPlan('');
        await loadStock();
      } else {
        alert('Erro ao adicionar keys: ' + (res?.message || 'Erro desconhecido'));
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    await stockAPI.delete(id);
    await loadStock();
  };

  if (!isOpen) return null;

  return (
    <div className="stock-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="stock-modal-content">
        <div className="stock-modal-header">
          <h3>Gerenciar Estoque de Keys</h3>
          <button className="stock-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="stock-modal-body">
          {/* Stats */}
          <div className="stock-stats">
            <div className="stat-card"><div className="stat-icon total"><FaKey /></div><div className="stat-info"><span className="stat-label">Total</span><span className="stat-value">{stats.total}</span></div></div>
            <div className="stat-card"><div className="stat-icon available">📦</div><div className="stat-info"><span className="stat-label">Disponíveis</span><span className="stat-value">{stats.available}</span></div></div>
            <div className="stat-card"><div className="stat-icon used">🏷️</div><div className="stat-info"><span className="stat-label">Usadas</span><span className="stat-value">{stats.used}</span></div></div>
          </div>

          {/* Add keys */}
          <form className="stock-add-form" onSubmit={handleAddKeys}>
            <div className="form-row">
              <div className="form-group">
                <label>Produto *</label>
                <select value={selectedProduct} onChange={(e)=>{setSelectedProduct(e.target.value); setSelectedPlan('');}} required>
                  <option value="">Selecione</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Plano (Opcional)</label>
                <select value={selectedPlan} onChange={(e)=>setSelectedPlan(e.target.value)} disabled={!selectedProduct}>
                  <option value="">Sem plano</option>
                  {filteredPlans.map(pl => <option key={pl._id} value={pl._id}>{pl.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Keys *</label>
              <p className="field-hint">Uma por linha ou separadas por vírgula</p>
              <textarea value={keysInput} onChange={(e)=>setKeysInput(e.target.value)} rows="6" placeholder="KEY1\nKEY2\nKEY3" required />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Fechar</button>
              <button type="submit" className="btn-submit" disabled={adding}>{adding ? 'Adicionando...' : (<><FaPlus /> Adicionar Keys</>)}</button>
            </div>
          </form>

          {/* List */}
          <div className="stock-list">
            {loading ? (
              <div className="stock-loading">Carregando...</div>
            ) : stock.length === 0 ? (
              <div className="no-stock">Nenhuma key no estoque</div>
            ) : (
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Produto</th>
                    <th>Plano</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map(item => (
                    <tr key={item._id} className={item.used ? 'used' : ''}>
                      <td><code>{item.key}</code></td>
                      <td>{item.product?.name || '-'}</td>
                      <td>{item.plan?.name || '-'}</td>
                      <td>{item.used ? 'Usada' : 'Disponível'}</td>
                      <td>
                        {!item.used && (
                          <button className="btn-delete-key" onClick={() => handleDelete(item._id)} title="Remover">
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockModal;


