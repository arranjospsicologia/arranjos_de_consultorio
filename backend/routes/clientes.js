const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

// Todas as rotas precisam de autenticação
router.use(authenticateToken);

// Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { status, search, ordenacao } = req.query;
    let url = `${JSON_SERVER_URL}/clientes`;

    // Filtros
    const params = [];
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += '?' + params.join('&');

    const response = await axios.get(url);
    let clientes = response.data;

    // Busca por nome (filtro local)
    if (search) {
      const searchLower = search.toLowerCase();
      clientes = clientes.filter(c =>
        c.nome.toLowerCase().includes(searchLower) ||
        (c.email && c.email.toLowerCase().includes(searchLower)) ||
        (c.telefone && c.telefone.includes(search))
      );
    }

    // Ordenação
    if (ordenacao) {
      switch (ordenacao) {
        case 'alfabetica':
          clientes.sort((a, b) => a.nome.localeCompare(b.nome));
          break;
        case 'entrada':
          clientes.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
          break;
        case 'registro':
          clientes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'aniversario':
          clientes.sort((a, b) => {
            if (!a.aniversario) return 1;
            if (!b.aniversario) return -1;
            const [mesA, diaA] = a.aniversario.split('-');
            const [mesB, diaB] = b.aniversario.split('-');
            return (parseInt(mesA) * 100 + parseInt(diaA)) - (parseInt(mesB) * 100 + parseInt(diaB));
          });
          break;
        default:
          // Padrão: alfabética
          clientes.sort((a, b) => a.nome.localeCompare(b.nome));
      }
    } else {
      // Padrão: alfabética
      clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Buscar cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/clientes/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const novoCliente = {
      ...req.body,
      status: req.body.status || 'ativo',
      created_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/clientes`, novoCliente);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const clienteAtualizado = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/clientes/${req.params.id}`,
      clienteAtualizado
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/clientes/${req.params.id}`);
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

// Atualizar valor acordado com histórico
router.put('/:id/valor', async (req, res) => {
  try {
    const { valor_acordado, data_vigencia, motivo } = req.body;

    if (!valor_acordado || !data_vigencia) {
      return res.status(400).json({ error: 'Valor e data de vigência são obrigatórios' });
    }

    // Buscar cliente atual
    const clienteRes = await axios.get(`${JSON_SERVER_URL}/clientes/${req.params.id}`);
    const clienteAtual = clienteRes.data;

    // Criar registro no histórico
    const historicoData = {
      cliente_id: parseInt(req.params.id),
      valor_anterior: clienteAtual.valor_acordado || 0,
      valor_novo: valor_acordado,
      data_vigencia: data_vigencia,
      motivo: motivo || '',
      created_at: new Date().toISOString()
    };

    await axios.post(`${JSON_SERVER_URL}/historico_valores_cliente`, historicoData);

    // Atualizar valor no cliente
    const clienteAtualizado = {
      ...clienteAtual,
      valor_acordado: valor_acordado,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/clientes/${req.params.id}`,
      clienteAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    console.error('Erro ao atualizar valor:', error);
    res.status(500).json({ error: 'Erro ao atualizar valor' });
  }
});

// Buscar histórico de valores de um cliente
router.get('/:id/historico-valores', async (req, res) => {
  try {
    const response = await axios.get(
      `${JSON_SERVER_URL}/historico_valores_cliente?cliente_id=${req.params.id}&_sort=created_at&_order=desc`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar histórico de valores:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de valores' });
  }
});

// Adicionar membro a cliente (para casais/famílias)
router.post('/:id/membros', async (req, res) => {
  try {
    const novoMembro = {
      cliente_id: parseInt(req.params.id),
      nome: req.body.nome,
      cpf: req.body.cpf || null,
      telefone: req.body.telefone || null,
      email: req.body.email || null,
      papel: req.body.papel || '', // ex: "esposo", "esposa", "filho"
      created_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/clientes_membros`, novoMembro);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
});

// Listar membros de um cliente
router.get('/:id/membros', async (req, res) => {
  try {
    const response = await axios.get(
      `${JSON_SERVER_URL}/clientes_membros?cliente_id=${req.params.id}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    res.status(500).json({ error: 'Erro ao buscar membros' });
  }
});

// Remover membro de cliente
router.delete('/:clienteId/membros/:membroId', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/clientes_membros/${req.params.membroId}`);
    res.json({ message: 'Membro removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Membro não encontrado' });
    }
    console.error('Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

module.exports = router;
