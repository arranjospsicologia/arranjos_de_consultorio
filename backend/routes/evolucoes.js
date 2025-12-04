const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Listar todas as evoluções
router.get('/', async (req, res) => {
  try {
    const { cliente_id, data_inicio, data_fim } = req.query;

    // Buscar evoluções e clientes separadamente
    const [evolucoesRes, clientesRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/evolucoes?_sort=data&_order=desc`),
      axios.get(`${JSON_SERVER_URL}/clientes`)
    ]);

    let evolucoes = evolucoesRes.data;
    const clientes = clientesRes.data;

    // Criar um mapa de clientes para busca rápida
    const clientesMap = {};
    clientes.forEach(c => clientesMap[c.id] = c);

    // Adicionar dados do cliente a cada evolução
    evolucoes = evolucoes.map(e => ({
      ...e,
      cliente: clientesMap[e.cliente_id]
    }));

    // Filtros
    if (cliente_id) {
      evolucoes = evolucoes.filter(e => e.cliente_id == cliente_id);
    }
    if (data_inicio) {
      evolucoes = evolucoes.filter(e => e.data >= data_inicio);
    }
    if (data_fim) {
      evolucoes = evolucoes.filter(e => e.data <= data_fim);
    }

    res.json(evolucoes);
  } catch (error) {
    console.error('Erro ao buscar evoluções:', error);
    res.status(500).json({ error: 'Erro ao buscar evoluções' });
  }
});

// Buscar evolução por ID
router.get('/:id', async (req, res) => {
  try {
    const evolucaoRes = await axios.get(
      `${JSON_SERVER_URL}/evolucoes/${req.params.id}`
    );

    const evolucao = evolucaoRes.data;

    // Buscar dados do cliente se houver cliente_id
    if (evolucao.cliente_id) {
      const clienteRes = await axios.get(
        `${JSON_SERVER_URL}/clientes/${evolucao.cliente_id}`
      );
      evolucao.cliente = clienteRes.data;
    }

    res.json(evolucao);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Evolução não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao buscar evolução' });
  }
});

// Criar nova evolução
router.post('/', async (req, res) => {
  try {
    const novaEvolucao = {
      ...req.body,
      created_at: new Date().toISOString()
    };

    const response = await axios.post(
      `${JSON_SERVER_URL}/evolucoes`,
      novaEvolucao
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar evolução:', error);
    res.status(500).json({ error: 'Erro ao criar evolução' });
  }
});

// Atualizar evolução
router.put('/:id', async (req, res) => {
  try {
    const evolucaoAtualizada = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/evolucoes/${req.params.id}`,
      evolucaoAtualizada
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Evolução não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar evolução' });
  }
});

// Deletar evolução
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/evolucoes/${req.params.id}`);
    res.json({ message: 'Evolução removida com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Evolução não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar evolução' });
  }
});

module.exports = router;
