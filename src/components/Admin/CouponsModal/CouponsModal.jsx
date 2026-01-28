import React, { useState, useEffect } from 'react';
import { couponsAPI } from '../../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaPercent } from 'react-icons/fa';
import './CouponsModal.css';

const CouponsModal = ({ isOpen, onClose }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    percentage: '',
    active: true,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const couponsData = await couponsAPI.getAll();
      setCoupons(couponsData || []);
    } catch (error) {
      console.error('Erro ao carregar cupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const couponData = {
        code: formData.code.trim().toUpperCase(),
        percentage: parseFloat(formData.percentage),
        active: formData.active,
      };

      console.log('📤 Salvando cupom:', couponData);

      if (editingCoupon) {
        await couponsAPI.update(editingCoupon._id, couponData);
        console.log('✅ Cupom atualizado com sucesso');
      } else {
        await couponsAPI.create(couponData);
        console.log('✅ Cupom criado com sucesso');
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('❌ Erro ao salvar cupom:', error);
      const errorMessage = error.message || error.error || 'Erro ao salvar cupom';
      alert(errorMessage);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      percentage: coupon.percentage?.toString() || '',
      active: coupon.active !== undefined ? coupon.active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cupom?')) {
      return;
    }

    try {
      await couponsAPI.delete(id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
      alert(error.message || 'Erro ao deletar cupom');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      percentage: '',
      active: true,
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container coupons-modal">
        <div className="modal-header">
          <h2>{editingCoupon ? 'Editar Cupom' : 'Gerenciar Cupons'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <p>Carregando cupons...</p>
            </div>
          ) : showForm ? (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Código do Cupom *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="EX: DESCONTO10"
                  required
                  disabled={!!editingCoupon}
                  style={{ textTransform: 'uppercase' }}
                />
                {editingCoupon && (
                  <p className="field-hint">O código não pode ser alterado após a criação</p>
                )}
              </div>

              <div className="form-group">
                <label>Porcentagem de Desconto (%) *</label>
                <div className="input-with-icon">
                  <FaPercent className="input-icon-left" />
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    placeholder="Ex: 10"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>
                <p className="field-hint">Valor entre 0 e 100</p>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span>Cupom ativo</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaCheck /> {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="modal-list-header">
                <button className="btn-add" onClick={() => setShowForm(true)}>
                  <FaPlus /> Novo Cupom
                </button>
              </div>

              {coupons.length === 0 ? (
                <div className="modal-empty">
                  <FaPercent className="empty-icon" />
                  <p>Nenhum cupom cadastrado</p>
                  <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <FaPlus /> Criar Primeiro Cupom
                  </button>
                </div>
              ) : (
                <div className="coupons-list">
                  {coupons.map((coupon) => (
                    <div key={coupon._id} className={`coupon-item ${!coupon.active ? 'inactive' : ''}`}>
                      <div className="coupon-info">
                        <div className="coupon-code">{coupon.code}</div>
                        <div className="coupon-details">
                          <span className="coupon-percentage">
                            <FaPercent /> {coupon.percentage}%
                          </span>
                          <span className={`coupon-status ${coupon.active ? 'active' : 'inactive'}`}>
                            {coupon.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="coupon-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(coupon)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(coupon._id)}
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsModal;

