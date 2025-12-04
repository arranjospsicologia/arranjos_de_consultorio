const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no JSON Server
    const response = await axios.get(`${JSON_SERVER_URL}/usuarios?email=${email}`);
    const usuarios = response.data;

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = usuarios[0];

    // Verificação simplificada (em produção, use bcrypt.compare com hash real)
    // Para o usuário padrão: admin@arranjos.com / 123456
    const senhaValida = password === '123456' && email === 'admin@arranjos.com';
    
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nome: usuario.nome 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// Validar token
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido' });
      }
      
      res.json({ valid: true, usuario: user });
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ error: 'Erro ao validar token' });
  }
});

module.exports = router;
