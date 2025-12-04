const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// Dashboard geral
router.get('/dashboard', async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    const mesAtual = hoje.substring(0, 7);

    // Buscar dados
    const [clientesRes, agendamentosRes, financeiroRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/clientes`),
      axios.get(`${JSON_SERVER_URL}/agendamentos`),
      axios.get(`${JSON_SERVER_URL}/financeiro`)
    ]);

    const clientes = clientesRes.data;
    const agendamentos = agendamentosRes.data;
    const financeiro = financeiroRes.data;

    // Estatísticas gerais
    const dashboard = {
      clientes: {
        total: clientes.length,
        ativos: clientes.filter(c => c.status === 'ativo').length,
        inativos: clientes.filter(c => c.status === 'inativo').length,
        alta: clientes.filter(c => c.status === 'alta').length
      },
      agendamentos: {
        total: agendamentos.length,
        hoje: agendamentos.filter(a => a.data === hoje).length,
        mes_atual: agendamentos.filter(a => a.data.startsWith(mesAtual)).length,
        por_status: {
          agendado: agendamentos.filter(a => a.status === 'agendado').length,
          presente: agendamentos.filter(a => a.status === 'presente').length,
          cancelado: agendamentos.filter(a => a.status === 'cancelado').length,
          falta_justificada: agendamentos.filter(a => a.status === 'falta_justificada').length,
          falta_cobrada: agendamentos.filter(a => a.status === 'falta_cobrada').length,
          cancelado_terapeuta: agendamentos.filter(a => a.status === 'cancelado_terapeuta').length,
          cancelado_feriado: agendamentos.filter(a => a.status === 'cancelado_feriado').length
        }
      },
      financeiro: {
        mes_atual: {
          receita_total: financeiro
            .filter(f => f.data.startsWith(mesAtual))
            .reduce((sum, f) => sum + parseFloat(f.valor), 0),
          receita_recebida: financeiro
            .filter(f => f.data.startsWith(mesAtual) && f.pago)
            .reduce((sum, f) => sum + parseFloat(f.valor), 0),
          receita_pendente: financeiro
            .filter(f => f.data.startsWith(mesAtual) && !f.pago)
            .reduce((sum, f) => sum + parseFloat(f.valor), 0)
        },
        total: {
          receita_total: financeiro.reduce((sum, f) => sum + parseFloat(f.valor), 0),
          receita_recebida: financeiro
            .filter(f => f.pago)
            .reduce((sum, f) => sum + parseFloat(f.valor), 0),
          receita_pendente: financeiro
            .filter(f => !f.pago)
            .reduce((sum, f) => sum + parseFloat(f.valor), 0)
        }
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({ error: 'Erro ao gerar dashboard' });
  }
});

// Estatísticas mensais (últimos 6 meses)
router.get('/mensais', async (req, res) => {
  try {
    const [agendamentosRes, financeiroRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos`),
      axios.get(`${JSON_SERVER_URL}/financeiro`)
    ]);

    const agendamentos = agendamentosRes.data;
    const financeiro = financeiroRes.data;

    // Gerar últimos 6 meses
    const meses = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesAno = data.toISOString().substring(0, 7);
      meses.push(mesAno);
    }

    const estatisticas = meses.map(mes => {
      const agendamentosMes = agendamentos.filter(a => a.data.startsWith(mes));
      const financeiroMes = financeiro.filter(f => f.data.startsWith(mes));

      return {
        mes,
        mes_nome: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        total_sessoes: agendamentosMes.length,
        sessoes_realizadas: agendamentosMes.filter(a => a.status === 'presente').length,
        receita_total: financeiroMes.reduce((sum, f) => sum + parseFloat(f.valor), 0),
        receita_recebida: financeiroMes.filter(f => f.pago).reduce((sum, f) => sum + parseFloat(f.valor), 0)
      };
    });

    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao gerar estatísticas mensais:', error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas mensais' });
  }
});

// Top clientes por número de sessões
router.get('/top-clientes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [clientesRes, agendamentosRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/clientes`),
      axios.get(`${JSON_SERVER_URL}/agendamentos`)
    ]);

    const clientes = clientesRes.data;
    const agendamentos = agendamentosRes.data;

    const estatisticasClientes = clientes.map(cliente => {
      const sessoesCliente = agendamentos.filter(a => a.cliente_id === cliente.id);
      return {
        cliente_id: cliente.id,
        nome: cliente.nome,
        total_sessoes: sessoesCliente.length,
        sessoes_realizadas: sessoesCliente.filter(a => a.status === 'presente').length,
        ultima_sessao: sessoesCliente.length > 0 
          ? sessoesCliente.sort((a, b) => b.data.localeCompare(a.data))[0].data
          : null
      };
    });

    const topClientes = estatisticasClientes
      .sort((a, b) => b.total_sessoes - a.total_sessoes)
      .slice(0, limit);

    res.json(topClientes);
  } catch (error) {
    console.error('Erro ao gerar top clientes:', error);
    res.status(500).json({ error: 'Erro ao gerar top clientes' });
  }
});

// Distribuição por tipo de sessão
router.get('/tipos-sessao', async (req, res) => {
  try {
    const response = await axios.get(`${JSON_SERVER_URL}/agendamentos`);
    const agendamentos = response.data;

    const distribuicao = {};
    agendamentos.forEach(a => {
      const tipo = a.tipo_sessao || 'individual';
      distribuicao[tipo] = (distribuicao[tipo] || 0) + 1;
    });

    const resultado = Object.keys(distribuicao).map(tipo => ({
      tipo,
      quantidade: distribuicao[tipo],
      percentual: ((distribuicao[tipo] / agendamentos.length) * 100).toFixed(2)
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao gerar distribuição por tipo:', error);
    res.status(500).json({ error: 'Erro ao gerar distribuição' });
  }
});

// Estatísticas de um mês específico
router.get('/mes/:ano/:mes', async (req, res) => {
  try {
    const { ano, mes } = req.params;
    const mesFormatado = `${ano}-${mes.padStart(2, '0')}`;

    const [agendamentosRes, financeiroRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos`),
      axios.get(`${JSON_SERVER_URL}/financeiro`)
    ]);

    const agendamentos = agendamentosRes.data;
    const financeiro = financeiroRes.data;

    // Filtrar dados do mês
    const agendamentosMes = agendamentos.filter(a => a.data && a.data.startsWith(mesFormatado));
    const financeiroMes = financeiro.filter(f => f.data && f.data.startsWith(mesFormatado));

    // Sessões realizadas (P, FC, R - Presente, Falta Cobrada, Reagendado)
    const sessoesRealizadas = agendamentosMes.filter(a =>
      a.status_presenca === 'P' || a.status_presenca === 'FC'
    );

    // Horas ocupadas (contando P, F, FC, R)
    const horasOcupadas = agendamentosMes.filter(a =>
      ['P', 'F', 'FC', 'R'].includes(a.status_presenca)
    );

    // Calcular produção total (todas as sessões realizadas, independente de pago)
    const producaoTotal = sessoesRealizadas.reduce((sum, a) => {
      const valor = parseFloat(a.valor_sessao) || 0;
      return sum + valor;
    }, 0);

    // Calcular receita total (sessões pagas)
    const receitaTotal = financeiroMes
      .filter(f => f.tipo_registro === 'receita_sessao' && f.pago)
      .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

    // Calcular despesas totais
    const despesasTotal = financeiroMes
      .filter(f => f.tipo_registro === 'despesa')
      .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

    // Médias
    const numeroAtendimentos = sessoesRealizadas.length;
    const numeroHorasOcupadas = horasOcupadas.reduce((sum, a) => {
      const inicio = new Date(`2000-01-01 ${a.hora_inicio}`);
      const fim = new Date(`2000-01-01 ${a.hora_fim}`);
      const horas = (fim - inicio) / (1000 * 60 * 60);
      return sum + horas;
    }, 0);

    const mediaPorAtendimento = numeroAtendimentos > 0
      ? producaoTotal / numeroAtendimentos
      : 0;

    const mediaPorHoraOcupada = numeroHorasOcupadas > 0
      ? producaoTotal / numeroHorasOcupadas
      : 0;

    res.json({
      mes: mesFormatado,
      producao_total: producaoTotal,
      receita_total: receitaTotal,
      despesas_total: despesasTotal,
      liquido: receitaTotal - despesasTotal,
      numero_atendimentos: numeroAtendimentos,
      numero_horas_ocupadas: numeroHorasOcupadas,
      media_por_atendimento: mediaPorAtendimento,
      media_por_hora_ocupada: mediaPorHoraOcupada,
      distribuicao_status: {
        P: agendamentosMes.filter(a => a.status_presenca === 'P').length,
        F: agendamentosMes.filter(a => a.status_presenca === 'F').length,
        FC: agendamentosMes.filter(a => a.status_presenca === 'FC').length,
        D: agendamentosMes.filter(a => a.status_presenca === 'D').length,
        T: agendamentosMes.filter(a => a.status_presenca === 'T').length,
        R: agendamentosMes.filter(a => a.status_presenca === 'R').length
      }
    });
  } catch (error) {
    console.error('Erro ao gerar estatísticas do mês:', error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas do mês' });
  }
});

// Estatísticas de um período (2 a 12 meses)
router.get('/periodo', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'data_inicio e data_fim são obrigatórios' });
    }

    const inicio = new Date(data_inicio + '-01');
    const fim = new Date(data_fim + '-01');

    // Validar período (2 a 12 meses)
    const mesesDiferenca = (fim.getFullYear() - inicio.getFullYear()) * 12 +
                           (fim.getMonth() - inicio.getMonth()) + 1;

    if (mesesDiferenca < 2 || mesesDiferenca > 12) {
      return res.status(400).json({
        error: 'O período deve ter entre 2 e 12 meses',
        meses_solicitados: mesesDiferenca
      });
    }

    const [agendamentosRes, financeiroRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/agendamentos`),
      axios.get(`${JSON_SERVER_URL}/financeiro`)
    ]);

    const agendamentos = agendamentosRes.data;
    const financeiro = financeiroRes.data;

    // Gerar array de meses no período
    const meses = [];
    const dataAtual = new Date(inicio);
    while (dataAtual <= fim) {
      const mesFormatado = dataAtual.toISOString().substring(0, 7);
      meses.push(mesFormatado);
      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }

    // Calcular estatísticas para cada mês
    const estatisticas = meses.map(mes => {
      const agendamentosMes = agendamentos.filter(a => a.data && a.data.startsWith(mes));
      const financeiroMes = financeiro.filter(f => f.data && f.data.startsWith(mes));

      const sessoesRealizadas = agendamentosMes.filter(a =>
        a.status_presenca === 'P' || a.status_presenca === 'FC'
      );

      const horasOcupadas = agendamentosMes.filter(a =>
        ['P', 'F', 'FC', 'R'].includes(a.status_presenca)
      );

      const producaoTotal = sessoesRealizadas.reduce((sum, a) => {
        const valor = parseFloat(a.valor_sessao) || 0;
        return sum + valor;
      }, 0);

      const receitaTotal = financeiroMes
        .filter(f => f.tipo_registro === 'receita_sessao' && f.pago)
        .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

      const despesasTotal = financeiroMes
        .filter(f => f.tipo_registro === 'despesa')
        .reduce((sum, f) => sum + parseFloat(f.valor || 0), 0);

      const numeroAtendimentos = sessoesRealizadas.length;
      const numeroHorasOcupadas = horasOcupadas.reduce((sum, a) => {
        const inicio = new Date(`2000-01-01 ${a.hora_inicio}`);
        const fim = new Date(`2000-01-01 ${a.hora_fim}`);
        const horas = (fim - inicio) / (1000 * 60 * 60);
        return sum + horas;
      }, 0);

      const mediaPorAtendimento = numeroAtendimentos > 0
        ? producaoTotal / numeroAtendimentos
        : 0;

      const mediaPorHoraOcupada = numeroHorasOcupadas > 0
        ? producaoTotal / numeroHorasOcupadas
        : 0;

      return {
        mes,
        mes_nome: new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        producao_total: producaoTotal,
        receita_total: receitaTotal,
        despesas_total: despesasTotal,
        liquido: receitaTotal - despesasTotal,
        numero_atendimentos: numeroAtendimentos,
        numero_horas_ocupadas: numeroHorasOcupadas,
        media_por_atendimento: mediaPorAtendimento,
        media_por_hora_ocupada: mediaPorHoraOcupada
      };
    });

    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao gerar estatísticas do período:', error);
    res.status(500).json({ error: 'Erro ao gerar estatísticas do período' });
  }
});

module.exports = router;
