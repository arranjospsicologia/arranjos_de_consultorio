import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (token && usuarioSalvo) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUsuario(JSON.parse(usuarioSalvo));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, usuario: usuarioData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuarioData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUsuario(usuarioData);
      navigate('/');
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    delete api.defaults.headers.common['Authorization'];
    setUsuario(null);
    navigate('/login');
  };

  const value = {
    usuario,
    login,
    logout,
    isAuthenticated: !!usuario,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
