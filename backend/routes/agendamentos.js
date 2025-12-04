const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Listar todos os agendamentos
router.get('/', async (req, res) => {
  try {
    const { data_inicio, data_fim, cliente_id, status } = req.query;

    // Buscar agendamentos e clientes separadamente
    const [agendamentosRes, clientesRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos?_sort=data,hora_inicio&_order=asc`),
      axios.get(`${JSON_SERVER_URL}/clientes`)
    ]);

    let agendamentos = agendamentosRes.data;
    const clientes = clientesRes.data;

    // Criar um mapa de clientes para busca rápida
    const clientesMap = {};
    clientes.forEach(c => clientesMap[c.id] = c);

    // Adicionar dados do cliente a cada agendamento
    agendamentos = agendamentos.map(a => ({
      ...a,
      cliente: clientesMap[a.cliente_id]
    }));

    // Filtros adicionais
    if (data_inicio) {
      agendamentos = agendamentos.filter(a => a.data >= data_inicio);
    }
    if (data_fim) {
      agendamentos = agendamentos.filter(a => a.data <= data_fim);
    }
    if (cliente_id) {
      agendamentos = agendamentos.filter(a => a.cliente_id == cliente_id);
    }
    if (status) {
      agendamentos = agendamentos.filter(a => a.status === status);
    }

    res.json(agendamentos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Buscar agendamentos da semana
router.get('/semana/:data', async (req, res) => {
  try {
    const dataRef = new Date(req.params.data);
    const diaSemana = dataRef.getDay();

    // Calcular início da semana (domingo)
    const inicioSemana = new Date(dataRef);
    inicioSemana.setDate(dataRef.getDate() - diaSemana);

    // Calcular fim da semana (sábado)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    const dataInicio = inicioSemana.toISOString().split('T')[0];
    const dataFim = fimSemana.toISOString().split('T')[0];

    // Buscar agendamentos e clientes separadamente
    const [agendamentosRes, clientesRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos?_sort=data,hora_inicio&_order=asc`),
      axios.get(`${JSON_SERVER_URL}/clientes`)
    ]);

    // Criar um mapa de clientes para busca rápida
    const clientesMap = {};
    clientesRes.data.forEach(c => clientesMap[c.id] = c);

    // Filtrar agendamentos da semana e adicionar dados do cliente
    const agendamentos = agendamentosRes.data
      .filter(a => a.data >= dataInicio && a.data <= dataFim)
      .map(a => ({
        ...a,
        cliente: clientesMap[a.cliente_id]
      }));

    res.json({
      inicio_semana: dataInicio,
      fim_semana: dataFim,
      agendamentos
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos da semana:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos da semana' });
  }
});

// Buscar agendamento por ID
router.get('/:id', async (req, res) => {
  try {
    const agendamentoRes = await axios.get(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`
    );

    const agendamento = agendamentoRes.data;

    // Buscar dados do cliente se houver cliente_id
    if (agendamento.cliente_id) {
      const clienteRes = await axios.get(
        `${JSON_SERVER_URL}/clientes/${agendamento.cliente_id}`
      );
      agendamento.cliente = clienteRes.data;
    }

    res.json(agendamento);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao buscar agendamento' });
  }
});

// Criar novo agendamento
router.post('/', async (req, res) => {
  try {
    const novoAgendamento = {
      ...req.body,
      status: req.body.status || 'agendado',
      created_at: new Date().toISOString()
    };

    const response = await axios.post(
      `${JSON_SERVER_URL}/agendamentos`,
      novoAgendamento
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  try {
    const agendamentoAtualizado = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`,
      agendamentoAtualizado
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// Deletar agendamento
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/agendamentos/${req.params.id}`);
    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao deletar agendamento' });
  }
});

// Criar agendamentos recorrentes
router.post('/recorrente', async (req, res) => {
  try {
    const {
      cliente_id,
      data_inicio,
      hora_inicio,
      hora_fim,
      servico_id,
      valor_sessao,
      frequencia, // 'semanal' ou 'quinzenal'
      quantidade, // máximo 32
      tipo_sessao,
      observacoes
    } = req.body;

    if (!cliente_id || !data_inicio || !hora_inicio || !hora_fim) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    if (quantidade > 32) {
      return res.status(400).json({ error: 'Quantidade máxima é 32 agendamentos' });
    }

    const recorrencia_id = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const agendamentosCriados = [];

    const dataInicio = new Date(data_inicio);
    const incrementoDias = frequencia === 'quinzenal' ? 14 : 7;

    for (let i = 0; i < quantidade; i++) {
      const dataAgendamento = new Date(dataInicio);
      dataAgendamento.setDate(dataInicio.getDate() + (i * incrementoDias));

      const agendamento = {
        cliente_id,
        data: dataAgendamento.toISOString().split('T')[0],
        hora_inicio,
        hora_fim,
        servico_id,
        valor_sessao,
        tipo_sessao,
        status: 'agendado',
        recorrencia_id,
        observacoes: observacoes || '',
        pago: false,
        nota_fiscal_emitida: false,
        created_at: new Date().toISOString()
      };

      const response = await axios.post(`${JSON_SERVER_URL}/agendamentos`, agendamento);
      agendamentosCriados.push(response.data);
    }

    res.status(201).json({
      message: `${agendamentosCriados.length} agendamentos criados com sucesso`,
      recorrencia_id,
      agendamentos: agendamentosCriados
    });
  } catch (error) {
    console.error('Erro ao criar agendamentos recorrentes:', error);
    res.status(500).json({ error: 'Erro ao criar agendamentos recorrentes' });
  }
});

// Atualizar série de agendamentos recorrentes a partir de uma data
router.put('/recorrente/:recorrenciaId', async (req, res) => {
  try {
    const { recorrenciaId } = req.params;
    const { data_inicio, ...novosValores } = req.body;

    // Buscar todos os agendamentos com este recorrencia_id
    const response = await axios.get(
      `${JSON_SERVER_URL}/agendamentos?recorrencia_id=${recorrenciaId}`
    );

    const agendamentos = response.data;
    const agendamentosAtualizados = [];

    // Atualizar apenas os agendamentos a partir da data_inicio
    for (const agendamento of agendamentos) {
      if (agendamento.data >= data_inicio) {
        const atualizado = {
          ...agendamento,
          ...novosValores,
          updated_at: new Date().toISOString()
        };

        const updateRes = await axios.put(
          `${JSON_SERVER_URL}/agendamentos/${agendamento.id}`,
          atualizado
        );
        agendamentosAtualizados.push(updateRes.data);
      }
    }

    res.json({
      message: `${agendamentosAtualizados.length} agendamentos atualizados`,
      agendamentos: agendamentosAtualizados
    });
  } catch (error) {
    console.error('Erro ao atualizar série recorrente:', error);
    res.status(500).json({ error: 'Erro ao atualizar série recorrente' });
  }
});

// Cancelar série de agendamentos recorrentes a partir de uma data
router.delete('/recorrente/:recorrenciaId', async (req, res) => {
  try {
    const { recorrenciaId } = req.params;
    const { data_inicio } = req.query;

    if (!data_inicio) {
      return res.status(400).json({ error: 'data_inicio é obrigatório' });
    }

    // Buscar todos os agendamentos com este recorrencia_id
    const response = await axios.get(
      `${JSON_SERVER_URL}/agendamentos?recorrencia_id=${recorrenciaId}`
    );

    const agendamentos = response.data;
    const agendamentosCancelados = [];

    // Cancelar apenas os agendamentos a partir da data_inicio
    for (const agendamento of agendamentos) {
      if (agendamento.data >= data_inicio) {
        await axios.delete(`${JSON_SERVER_URL}/agendamentos/${agendamento.id}`);
        agendamentosCancelados.push(agendamento.id);
      }
    }

    // Se cancelou agendamentos, registrar encerramento no cliente
    if (agendamentosCancelados.length > 0 && agendamentos[0]) {
      const cliente_id = agendamentos[0].cliente_id;
      try {
        const clienteRes = await axios.get(`${JSON_SERVER_URL}/clientes/${cliente_id}`);
        const cliente = clienteRes.data;

        await axios.put(`${JSON_SERVER_URL}/clientes/${cliente_id}`, {
          ...cliente,
          data_encerramento: new Date().toISOString().split('T')[0],
          status: 'alta',
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.log('Cliente não encontrado ou erro ao atualizar:', err);
      }
    }

    res.json({
      message: `${agendamentosCancelados.length} agendamentos cancelados`,
      ids: agendamentosCancelados
    });
  } catch (error) {
    console.error('Erro ao cancelar série recorrente:', error);
    res.status(500).json({ error: 'Erro ao cancelar série recorrente' });
  }
});

// Mover agendamento (drag-and-drop / reagendamento)
router.put('/:id/mover', async (req, res) => {
  try {
    const { nova_data, nova_hora_inicio } = req.body;

    if (!nova_data || !nova_hora_inicio) {
      return res.status(400).json({ error: 'Nova data e hora são obrigatórias' });
    }

    // Buscar agendamento atual
    const agendamentoRes = await axios.get(`${JSON_SERVER_URL}/agendamentos/${req.params.id}`);
    const agendamento = agendamentoRes.data;

    // Calcular duração
    const [hInicio, mInicio] = agendamento.hora_inicio.split(':').map(Number);
    const [hFim, mFim] = agendamento.hora_fim.split(':').map(Number);
    const duracaoMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);

    // Calcular nova hora fim
    const [novaHInicio, novaMInicio] = nova_hora_inicio.split(':').map(Number);
    const totalMinutos = novaHInicio * 60 + novaMInicio + duracaoMinutos;
    const novaHFim = Math.floor(totalMinutos / 60);
    const novaMFim = totalMinutos % 60;
    const nova_hora_fim = `${String(novaHFim).padStart(2, '0')}:${String(novaMFim).padStart(2, '0')}`;

    // Atualizar agendamento
    const agendamentoAtualizado = {
      ...agendamento,
      data: nova_data,
      hora_inicio: nova_hora_inicio,
      hora_fim: nova_hora_fim,
      status_presenca: 'R', // R = Reagendado
      reagendado_de_data: agendamento.data,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`,
      agendamentoAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    console.error('Erro ao mover agendamento:', error);
    res.status(500).json({ error: 'Erro ao mover agendamento' });
  }
});

// Atualizar status de presença
router.put('/:id/status-presenca', async (req, res) => {
  try {
    const { status_presenca } = req.body;

    const statusValidos = ['P', 'F', 'FC', 'D', 'T', 'R'];
    if (!statusValidos.includes(status_presenca)) {
      return res.status(400).json({
        error: 'Status de presença inválido',
        validos: statusValidos
      });
    }

    // Buscar agendamento atual
    const agendamentoRes = await axios.get(`${JSON_SERVER_URL}/agendamentos/${req.params.id}`);
    const agendamento = agendamentoRes.data;

    // Atualizar status
    const agendamentoAtualizado = {
      ...agendamento,
      status_presenca,
      status: status_presenca === 'P' ? 'realizado' : agendamento.status,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`,
      agendamentoAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    console.error('Erro ao atualizar status de presença:', error);
    res.status(500).json({ error: 'Erro ao atualizar status de presença' });
  }
});

// Atualizar status de pagamento
router.put('/:id/pagamento', async (req, res) => {
  try {
    const { pago } = req.body;

    if (typeof pago !== 'boolean') {
      return res.status(400).json({ error: 'Campo "pago" deve ser booleano' });
    }

    // Buscar agendamento atual
    const agendamentoRes = await axios.get(`${JSON_SERVER_URL}/agendamentos/${req.params.id}`);
    const agendamento = agendamentoRes.data;

    // Atualizar pagamento
    const agendamentoAtualizado = {
      ...agendamento,
      pago,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`,
      agendamentoAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

// Atualizar status de nota fiscal
router.put('/:id/nota-fiscal', async (req, res) => {
  try {
    const { nota_fiscal_emitida } = req.body;

    if (typeof nota_fiscal_emitida !== 'boolean') {
      return res.status(400).json({ error: 'Campo "nota_fiscal_emitida" deve ser booleano' });
    }

    // Buscar agendamento atual
    const agendamentoRes = await axios.get(`${JSON_SERVER_URL}/agendamentos/${req.params.id}`);
    const agendamento = agendamentoRes.data;

    // Atualizar NF
    const agendamentoAtualizado = {
      ...agendamento,
      nota_fiscal_emitida,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/agendamentos/${req.params.id}`,
      agendamentoAtualizado
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    console.error('Erro ao atualizar nota fiscal:', error);
    res.status(500).json({ error: 'Erro ao atualizar nota fiscal' });
  }
});

module.exports = router;
