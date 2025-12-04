const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Buscar configurações do usuário
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1; // Usar ID do usuário autenticado

    // Buscar configurações do usuário
    const response = await axios.get(`${JSON_SERVER_URL}/configuracoes_usuario?usuario_id=${usuarioId}`);

    if (response.data && response.data.length > 0) {
      res.json(response.data[0]);
    } else {
      // Se não existe, retornar configurações padrão
      res.json({
        usuario_id: usuarioId,
        intervalo_agenda: 15,
        dias_trabalho: ["1", "2", "3", "4", "5"],
        hora_inicio_trabalho: "08:00",
        hora_fim_trabalho: "20:00",
        nome_completo: null,
        crp: null,
        banco: null,
        agencia: null,
        conta: null,
        cpf_cnpj: null
      });
    }
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// Criar ou atualizar configurações do usuário
router.put('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    // Verificar se já existe configuração para este usuário
    const existingRes = await axios.get(`${JSON_SERVER_URL}/configuracoes_usuario?usuario_id=${usuarioId}`);

    const configData = {
      ...req.body,
      usuario_id: usuarioId,
      updated_at: new Date().toISOString()
    };

    let response;
    if (existingRes.data && existingRes.data.length > 0) {
      // Atualizar existente
      const configId = existingRes.data[0].id;
      response = await axios.put(`${JSON_SERVER_URL}/configuracoes_usuario/${configId}`, configData);
    } else {
      // Criar nova
      configData.created_at = new Date().toISOString();
      response = await axios.post(`${JSON_SERVER_URL}/configuracoes_usuario`, configData);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// Setup inicial (primeira configuração)
router.post('/primeira-configuracao', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    // Verificar se já existe configuração
    const existingRes = await axios.get(`${JSON_SERVER_URL}/configuracoes_usuario?usuario_id=${usuarioId}`);

    if (existingRes.data && existingRes.data.length > 0) {
      return res.status(400).json({ error: 'Configurações já existem para este usuário' });
    }

    const configData = {
      usuario_id: usuarioId,
      intervalo_agenda: req.body.intervalo_agenda || 15,
      dias_trabalho: req.body.dias_trabalho || ["1", "2", "3", "4", "5"],
      hora_inicio_trabalho: req.body.hora_inicio_trabalho || "08:00",
      hora_fim_trabalho: req.body.hora_fim_trabalho || "20:00",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/configuracoes_usuario`, configData);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar primeira configuração:', error);
    res.status(500).json({ error: 'Erro ao criar primeira configuração' });
  }
});

module.exports = router;
