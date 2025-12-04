import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = () => {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <h1>🧠 Arranjos de Consultório</h1>
          </div>

          <div className="navbar-links">
            <NavLink to="/" className="nav-link" end>
              📊 Dashboard
            </NavLink>
            <NavLink to="/agenda" className="nav-link">
              📅 Agenda
            </NavLink>
            <NavLink to="/acompanhar" className="nav-link">
              📋 Acompanhar
            </NavLink>
            <NavLink to="/clientes" className="nav-link">
              👥 Clientes
            </NavLink>
            <NavLink to="/financeiro" className="nav-link">
              💰 Financeiro
            </NavLink>
            <NavLink to="/estatisticas" className="nav-link">
              📈 Estatísticas
            </NavLink>
          </div>

          <div className="navbar-user">
            <NavLink to="/configuracoes" className="nav-link config-link" title="Configurações">
              ⚙️
            </NavLink>
            <span className="user-name">{usuario?.nome}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
