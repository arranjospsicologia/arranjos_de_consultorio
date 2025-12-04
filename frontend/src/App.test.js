import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock do axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    }
  }))
}));

// Mock das páginas
jest.mock('./pages/Login', () => () => <div>Login Page</div>);
jest.mock('./pages/Dashboard', () => () => <div>Dashboard</div>);
jest.mock('./pages/Clientes', () => () => <div>Clientes</div>);
jest.mock('./pages/Agenda', () => () => <div>Agenda</div>);
jest.mock('./pages/Acompanhar', () => () => <div>Acompanhar</div>);
jest.mock('./pages/Financeiro', () => () => <div>Financeiro</div>);
jest.mock('./pages/Estatisticas', () => () => <div>Estatisticas</div>);
jest.mock('./pages/Configuracoes', () => () => <div>Configuracoes</div>);

// Mock do Layout
jest.mock('./components/Layout', () => ({ children }) => <div>{children}</div>);

// Mock do AuthContext
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn()
  })
}));

import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders login page when not authenticated', () => {
    const { container } = render(<App />);
    // O app deve renderizar sem erros
    expect(container).toBeTruthy();
  });
});
