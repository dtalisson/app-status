import React, { useState, useEffect } from 'react';
import { plansAPI } from '../../../utils/api';
import AdminLayout from '../../../components/Admin/AdminLayout';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const plansData = await plansAPI.getAll();
      setPlans(plansData);
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
        <div className="plans-loading">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="plans-page">
        <div className="plans-header">
          <h2>Visualização de Planos</h2>
          <p className="plans-header-subtitle">
            Para gerenciar planos, use o dashboard administrativo
          </p>
        </div>

        <div className="plans-table-container">
          <table className="plans-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Nenhum plano cadastrado
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id}>
                    <td className="plan-name">{plan.name}</td>
                    <td className="plan-description">
                      {plan.description || '-'}
                    </td>
                    <td>{plan.product?.name || 'N/A'}</td>
                    <td className="plan-value">{formatCurrency(plan.value)}</td>
                    <td>
                      <span className={`plan-status ${plan.active ? 'active' : 'inactive'}`}>
                        {plan.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <span className="plan-view-only">Somente visualização</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Plans;


