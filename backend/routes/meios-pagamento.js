const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Listar todos os meios de pagamento do usuário
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    const response = await axios.get(
      `${JSON_SERVER_URL}/meios_pagamento?usuario_id=${usuarioId}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar meios de pagamento:', error);
    res.status(500).json({ error: 'Erro ao buscar meios de pagamento' });
  }
});

// Listar apenas meios de pagamento ativos
router.get('/ativos', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    const response = await axios.get(
      `${JSON_SERVER_URL}/meios_pagamento?usuario_id=${usuarioId}&ativo=true`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar meios de pagamento ativos:', error);
    res.status(500).json({ error: 'Erro ao buscar meios de pagamento ativos' });
  }
});

// Buscar meio de pagamento por ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/meios_pagamento/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Meio de pagamento não encontrado' });
    }
    console.error('Erro ao buscar meio de pagamento:', error);
    res.status(500).json({ error: 'Erro ao buscar meio de pagamento' });
  }
});

// Criar novo meio de pagamento
router.post('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    const novoMeioPagamento = {
      ...req.body,
      usuario_id: usuarioId,
      ativo: req.body.ativo !== undefined ? req.body.ativo : true,
      taxa_percentual: req.body.taxa_percentual || 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/meios_pagamento`, novoMeioPagamento);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar meio de pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar meio de pagamento' });
  }
});

// Atualizar meio de pagamento
router.put('/:id', async (req, res) => {
  try {
    const meioPagamentoAtualizado = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/meios_pagamento/${req.params.id}`,
      meioPagamentoAtualizado
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Meio de pagamento não encontrado' });
    }
    console.error('Erro ao atualizar meio de pagamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar meio de pagamento' });
  }
});

// Atualizar taxa com data de vigência (cria registro no histórico)
router.put('/:id/taxa', async (req, res) => {
  try {
    const { taxa_percentual, data_vigencia } = req.body;

    if (taxa_percentual === undefined || !data_vigencia) {
      return res.status(400).json({ error: 'Taxa e data de vigência são obrigatórios' });
    }

    // Buscar meio de pagamento atual
    const meioRes = await axios.get(`${JSON_SERVER_URL}/meios_pagamento/${req.params.id}`);
    const meioAtual = meioRes.data;

    // Criar registro no histórico
    const historicoData = {
      meio_pagamento_id: parseInt(req.params.id),
      taxa_anterior: meioAtual.taxa_percentual,
      taxa_nova: taxa_percentual,
      data_vigencia: data_vigencia,
      created_at: new Date().toISOString()
    };

    await axios.post(`${JSON_SERVER_URL}/historico_taxas`, historicoData);

    // Atualizar taxa no meio de pagamento
    const meioPagamentoAtualizado = {
      ...meioAtual,
      taxa_percentual: taxa_percentual,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/meios_pagamento/${req.params.id}`,
      meioPagamentoAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Meio de pagamento não encontrado' });
    }
    console.error('Erro ao atualizar taxa:', error);
    res.status(500).json({ error: 'Erro ao atualizar taxa' });
  }
});

// Buscar histórico de taxas de um meio de pagamento
router.get('/:id/historico', async (req, res) => {
  try {
    const response = await axios.get(
      `${JSON_SERVER_URL}/historico_taxas?meio_pagamento_id=${req.params.id}&_sort=created_at&_order=desc`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar histórico de taxas:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de taxas' });
  }
});

// Deletar meio de pagamento
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/meios_pagamento/${req.params.id}`);
    res.json({ message: 'Meio de pagamento removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Meio de pagamento não encontrado' });
    }
    console.error('Erro ao deletar meio de pagamento:', error);
    res.status(500).json({ error: 'Erro ao deletar meio de pagamento' });
  }
});

module.exports = router;
