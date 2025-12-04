const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');
const { format, addDays, startOfWeek, endOfWeek, subWeeks, parseISO, isWithinInterval } = require('date-fns');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// GET /api/acompanhar/semana/:data
// Retorna clientes agendados na semana OU nas últimas 2 semanas mas não nesta
router.get('/semana/:data', async (req, res) => {
  try {
    const { data } = req.params;
    const dataReferencia = parseISO(data);

    // Calcular início e fim da semana de referência
    const inicioSemana = startOfWeek(dataReferencia, { weekStartsOn: 0 });
    const fimSemana = endOfWeek(dataReferencia, { weekStartsOn: 0 });

    // Calcular início das últimas 2 semanas
    const inicioUltimas2Semanas = startOfWeek(subWeeks(dataReferencia, 2), { weekStartsOn: 0 });

    // Buscar dados
    const [agendamentosRes, clientesRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos`),
      axios.get(`${JSON_SERVER_URL}/clientes`)
    ]);

    const agendamentos = agendamentosRes.data;
    const clientes = clientesRes.data;

    // Agrupar agendamentos por cliente
    const clientesMap = new Map();

    // Processar todos os agendamentos das últimas 3 semanas
    agendamentos.forEach(agendamento => {
      const dataAgendamento = parseISO(agendamento.data);

      // Verificar se está nas últimas 3 semanas
      if (dataAgendamento >= inicioUltimas2Semanas && dataAgendamento <= fimSemana) {
        const clienteId = agendamento.cliente_id;

        if (!clientesMap.has(clienteId)) {
          const cliente = clientes.find(c => c.id == clienteId);
          if (cliente && cliente.status === 'ativo') {
            clientesMap.set(clienteId, {
              cliente: cliente,
              agendamentosSemana: [],
              agendamentosUltimas2Semanas: [],
              totalDevido: 0
            });
          }
        }

        if (clientesMap.has(clienteId)) {
          const clienteData = clientesMap.get(clienteId);

          // Verificar se está na semana de referência
          if (dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana) {
            clienteData.agendamentosSemana.push(agendamento);
          } else if (dataAgendamento >= inicioUltimas2Semanas && dataAgendamento < inicioSemana) {
            clienteData.agendamentosUltimas2Semanas.push(agendamento);
          }

          // Calcular dívida (sessões realizadas não pagas)
          if (agendamento.status === 'realizado' || agendamento.status_presenca === 'P') {
            if (!agendamento.pago && agendamento.valor_sessao) {
              clienteData.totalDevido += parseFloat(agendamento.valor_sessao) || 0;
            }
          }
        }
      }
    });

    // Filtrar clientes:
    // - Que têm agendamento na semana de referência
    // - OU que tiveram nas últimas 2 semanas mas não nesta
    const clientesResultado = Array.from(clientesMap.values())
      .filter(item => {
        const temNestaSemana = item.agendamentosSemana.length > 0;
        const temNasUltimas2 = item.agendamentosUltimas2Semanas.length > 0;
        return temNestaSemana || (temNasUltimas2 && !temNestaSemana);
      })
      .map(item => {
        // Organizar agendamentos por dia da semana
        const agendamentosPorDia = {};

        for (let i = 0; i < 7; i++) {
          const dia = addDays(inicioSemana, i);
          const diaStr = format(dia, 'yyyy-MM-dd');
          agendamentosPorDia[diaStr] = item.agendamentosSemana
            .filter(a => a.data === diaStr)
            .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        }

        return {
          cliente: item.cliente,
          agendamentosPorDia: agendamentosPorDia,
          totalDevido: item.totalDevido
        };
      });

    res.json({
      inicioSemana: format(inicioSemana, 'yyyy-MM-dd'),
      fimSemana: format(fimSemana, 'yyyy-MM-dd'),
      clientes: clientesResultado
    });

  } catch (error) {
    console.error('Erro ao buscar dados de acompanhamento:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de acompanhamento' });
  }
});

// PUT /api/acompanhar/agendamento/:id
// Atualizar status_presenca, pago, nota_fiscal_emitida de um agendamento
router.put('/agendamento/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status_presenca, pago, nota_fiscal_emitida } = req.body;

    // Buscar agendamento atual
    const agendamentoRes = await axios.get(`${JSON_SERVER_URL}/agendamentos/${id}`);
    const agendamento = agendamentoRes.data;

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const updates = { ...agendamento };

    // Atualizar status_presenca se fornecido
    if (status_presenca !== undefined) {
      const statusValidos = ['P', 'F', 'FC', 'D', 'T', 'R'];
      if (!statusValidos.includes(status_presenca)) {
        return res.status(400).json({ error: 'Status de presença inválido' });
      }
      updates.status_presenca = status_presenca;

      // Se marcar como presente, atualizar status também
      if (status_presenca === 'P') {
        updates.status = 'realizado';
      }
    }

    // Atualizar pago se fornecido
    if (pago !== undefined) {
      if (typeof pago !== 'boolean') {
        return res.status(400).json({ error: 'Campo pago deve ser booleano' });
      }
      updates.pago = pago;
    }

    // Atualizar nota_fiscal_emitida se fornecido
    if (nota_fiscal_emitida !== undefined) {
      if (typeof nota_fiscal_emitida !== 'boolean') {
        return res.status(400).json({ error: 'Campo nota_fiscal_emitida deve ser booleano' });
      }
      updates.nota_fiscal_emitida = nota_fiscal_emitida;
    }

    updates.updated_at = new Date().toISOString();

    // Atualizar agendamento
    const response = await axios.put(`${JSON_SERVER_URL}/agendamentos/${id}`, updates);

    res.json(response.data);

  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

module.exports = router;
