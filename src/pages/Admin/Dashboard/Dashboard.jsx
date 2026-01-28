import React, { useState, useEffect } from 'react';
import { salesAPI } from '../../../utils/api';
import AdminLayout from '../../../components/Admin/AdminLayout';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    revenueByMonth: [],
  });
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, salesData] = await Promise.all([
        salesAPI.getDashboardStats(),
        salesAPI.getAll(),
      ]);
      setStats(statsData);
      setSales(salesData);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">Carregando...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-stats">
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Faturamento Total</h3>
              <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          
          <div className="stat-card sales">
            <div className="stat-icon">🔑</div>
            <div className="stat-content">
              <h3>Keys Vendidas</h3>
              <p className="stat-value">{stats.totalSales}</p>
            </div>
          </div>
          
          <div className="stat-card average">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Ticket Médio</h3>
              <p className="stat-value">
                {stats.totalSales > 0 
                  ? formatCurrency(stats.totalRevenue / stats.totalSales)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Vendas Recentes</h2>
          <div className="sales-table-container">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Produto</th>
                  <th>Plano</th>
                  <th>Usuário</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Nenhuma venda registrada
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale._id}>
                      <td className="key-cell">{sale.key}</td>
                      <td>{sale.product?.name || 'N/A'}</td>
                      <td>{sale.plan?.name || '-'}</td>
                      <td>
                        <div>
                          <div>{sale.userName || sale.userEmail}</div>
                          <small>{sale.userEmail}</small>
                        </div>
                      </td>
                      <td className="value-cell">{formatCurrency(sale.value)}</td>
                      <td>{formatDate(sale.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${sale.status}`}>
                          {sale.status === 'completed' ? 'Concluída' : 
                           sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;


