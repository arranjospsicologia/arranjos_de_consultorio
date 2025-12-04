const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Listar todos os serviços do usuário
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    const response = await axios.get(
      `${JSON_SERVER_URL}/servicos?usuario_id=${usuarioId}&_sort=ordem&_order=asc`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// Listar apenas serviços ativos
router.get('/ativos', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    const response = await axios.get(
      `${JSON_SERVER_URL}/servicos?usuario_id=${usuarioId}&ativo=true&_sort=ordem&_order=asc`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar serviços ativos:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços ativos' });
  }
});

// Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/servicos/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar serviço' });
  }
});

// Criar novo serviço
router.post('/', async (req, res) => {
  try {
    const usuarioId = req.user.id || 1;

    // Buscar maior ordem atual
    const servicosRes = await axios.get(
      `${JSON_SERVER_URL}/servicos?usuario_id=${usuarioId}&_sort=ordem&_order=desc&_limit=1`
    );

    const maiorOrdem = servicosRes.data.length > 0 ? servicosRes.data[0].ordem : 0;

    const novoServico = {
      ...req.body,
      usuario_id: usuarioId,
      ativo: req.body.ativo !== undefined ? req.body.ativo : true,
      ordem: req.body.ordem || (maiorOrdem + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/servicos`, novoServico);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// Atualizar serviço
router.put('/:id', async (req, res) => {
  try {
    const servicoAtualizado = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/servicos/${req.params.id}`,
      servicoAtualizado
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// Reordenar serviços
router.put('/reordenar/bulk', async (req, res) => {
  try {
    const { servicos } = req.body; // Array de { id, ordem }

    if (!servicos || !Array.isArray(servicos)) {
      return res.status(400).json({ error: 'Array de serviços é obrigatório' });
    }

    // Atualizar ordem de cada serviço
    const promises = servicos.map(s =>
      axios.patch(`${JSON_SERVER_URL}/servicos/${s.id}`, {
        ordem: s.ordem,
        updated_at: new Date().toISOString()
      })
    );

    await Promise.all(promises);

    res.json({ message: 'Serviços reordenados com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar serviços:', error);
    res.status(500).json({ error: 'Erro ao reordenar serviços' });
  }
});

// Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/servicos/${req.params.id}`);
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

module.exports = router;
