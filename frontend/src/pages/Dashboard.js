import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const response = await api.get('/estatisticas/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  if (!dashboard) {
    return <div className="error">Erro ao carregar dados</div>;
  }

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="text-muted">Visão geral do consultório</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">👥</div>
          <div className="stat-content">
            <p className="stat-label">Clientes Ativos</p>
            <p className="stat-value">{dashboard.clientes.ativos}</p>
            <p className="stat-detail">
              Total: {dashboard.clientes.total}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">📅</div>
          <div className="stat-content">
            <p className="stat-label">Sessões Hoje</p>
            <p className="stat-value">{dashboard.agendamentos.hoje}</p>
            <p className="stat-detail">
              Mês: {dashboard.agendamentos.mes_atual}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">💰</div>
          <div className="stat-content">
            <p className="stat-label">Receita Mês</p>
            <p className="stat-value">
              R$ {dashboard.financeiro.mes_atual.receita_recebida.toFixed(2)}
            </p>
            <p className="stat-detail">
              Total: R$ {dashboard.financeiro.mes_atual.receita_total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pendente</p>
            <p className="stat-value">
              R$ {dashboard.financeiro.mes_atual.receita_pendente.toFixed(2)}
            </p>
            <p className="stat-detail">
              A receber este mês
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Status dos Agendamentos</h3>
          <div className="status-list">
            <div className="status-item">
              <span className="badge badge-primary">Agendado</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.agendado}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-success">Presente</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.presente}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-warning">Cancelado</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.cancelado}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-info">Falta Justificada</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.falta_justificada}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-danger">Falta Cobrada</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.falta_cobrada}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-secondary">Cancelado pelo Terapeuta</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.cancelado_terapeuta}
              </span>
            </div>
            <div className="status-item">
              <span className="badge badge-light">Cancelado por Feriado</span>
              <span className="status-count">
                {dashboard.agendamentos.por_status.cancelado_feriado}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Status dos Clientes</h3>
          <div className="status-list">
            <div className="status-item">
              <span>Ativos</span>
              <span className="status-count primary">
                {dashboard.clientes.ativos}
              </span>
            </div>
            <div className="status-item">
              <span>Inativos</span>
              <span className="status-count">
                {dashboard.clientes.inativos}
              </span>
            </div>
            <div className="status-item">
              <span>Alta</span>
              <span className="status-count success">
                {dashboard.clientes.alta}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h3>Resumo Financeiro Total</h3>
        <div className="financial-summary">
          <div className="summary-item">
            <span className="summary-label">Receita Total</span>
            <span className="summary-value">
              R$ {dashboard.financeiro.total.receita_total.toFixed(2)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Recebido</span>
            <span className="summary-value success">
              R$ {dashboard.financeiro.total.receita_recebida.toFixed(2)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pendente</span>
            <span className="summary-value warning">
              R$ {dashboard.financeiro.total.receita_pendente.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
