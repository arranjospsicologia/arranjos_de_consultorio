const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('../middlewares/auth');

const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

router.use(authenticateToken);

// ===== ROTAS ESPECÍFICAS (devem vir antes das rotas com :id) =====

// ===== DESPESAS =====

// Listar todas as despesas
router.get('/despesas', async (req, res) => {
  try {
    const { mes } = req.query;
    const response = await axios.get(`${JSON_SERVER_URL}/despesas?_sort=data&_order=desc`);
    let despesas = response.data;

    if (mes) {
      despesas = despesas.filter(d => d.data.startsWith(mes));
    }

    res.json(despesas);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    res.status(500).json({ error: 'Erro ao buscar despesas' });
  }
});

// Criar nova despesa
router.post('/despesas', async (req, res) => {
  try {
    const { data, valor, descricao, meio_pagamento_id } = req.body;

    if (!data || !valor || !descricao) {
      return res.status(400).json({ error: 'Data, valor e descrição são obrigatórios' });
    }

    let valor_taxa = 0;
    let valor_liquido = parseFloat(valor);

    // Calcular taxa se houver meio de pagamento
    if (meio_pagamento_id) {
      try {
        const meioRes = await axios.get(`${JSON_SERVER_URL}/meios_pagamento/${meio_pagamento_id}`);
        const meio = meioRes.data;
        if (meio.taxa_percentual) {
          valor_taxa = (parseFloat(valor) * parseFloat(meio.taxa_percentual)) / 100;
          valor_liquido = parseFloat(valor) - valor_taxa;
        }
      } catch (err) {
        console.error('Erro ao buscar meio de pagamento:', err);
      }
    }

    const novaDespesa = {
      data,
      valor: parseFloat(valor),
      descricao,
      meio_pagamento_id: meio_pagamento_id || null,
      valor_taxa,
      valor_liquido,
      created_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/despesas`, novaDespesa);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro ao criar despesa' });
  }
});

// Atualizar despesa
router.put('/despesas/:id', async (req, res) => {
  try {
    const despesaAtualizada = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/despesas/${req.params.id}`,
      despesaAtualizada
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  }
});

// Deletar despesa
router.delete('/despesas/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/despesas/${req.params.id}`);
    res.json({ message: 'Despesa removida com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar despesa' });
  }
});

// ===== OUTRAS RECEITAS =====

// Listar todas as outras receitas
router.get('/outras-receitas', async (req, res) => {
  try {
    const { mes } = req.query;
    const response = await axios.get(`${JSON_SERVER_URL}/outras_receitas?_sort=data&_order=desc`);
    let receitas = response.data;

    if (mes) {
      receitas = receitas.filter(r => r.data.startsWith(mes));
    }

    res.json(receitas);
  } catch (error) {
    console.error('Erro ao buscar outras receitas:', error);
    res.status(500).json({ error: 'Erro ao buscar outras receitas' });
  }
});

// Criar outra receita
router.post('/outras-receitas', async (req, res) => {
  try {
    const { data, valor, descricao, meio_pagamento_id } = req.body;

    if (!data || !valor || !descricao) {
      return res.status(400).json({ error: 'Data, valor e descrição são obrigatórios' });
    }

    let valor_taxa = 0;
    let valor_liquido = parseFloat(valor);

    // Calcular taxa se houver meio de pagamento
    if (meio_pagamento_id) {
      try {
        const meioRes = await axios.get(`${JSON_SERVER_URL}/meios_pagamento/${meio_pagamento_id}`);
        const meio = meioRes.data;
        if (meio.taxa_percentual) {
          valor_taxa = (parseFloat(valor) * parseFloat(meio.taxa_percentual)) / 100;
          valor_liquido = parseFloat(valor) - valor_taxa;
        }
      } catch (err) {
        console.error('Erro ao buscar meio de pagamento:', err);
      }
    }

    const novaReceita = {
      data,
      valor: parseFloat(valor),
      descricao,
      meio_pagamento_id: meio_pagamento_id || null,
      valor_taxa,
      valor_liquido,
      created_at: new Date().toISOString()
    };

    const response = await axios.post(`${JSON_SERVER_URL}/outras_receitas`, novaReceita);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar outra receita:', error);
    res.status(500).json({ error: 'Erro ao criar outra receita' });
  }
});

// Atualizar outra receita
router.put('/outras-receitas/:id', async (req, res) => {
  try {
    const receitaAtualizada = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/outras_receitas/${req.params.id}`,
      receitaAtualizada
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao atualizar receita' });
  }
});

// Deletar outra receita
router.delete('/outras-receitas/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/outras_receitas/${req.params.id}`);
    res.json({ message: 'Receita removida com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }
    res.status(500).json({ error: 'Erro ao deletar receita' });
  }
});

// ===== RESUMO MENSAL =====

// Resumo financeiro mensal completo
router.get('/resumo/mensal', async (req, res) => {
  try {
    const { ano, mes } = req.query;

    if (!ano || !mes) {
      return res.status(400).json({ error: 'Ano e mês são obrigatórios' });
    }

    const mesFormatado = `${ano}-${mes.padStart(2, '0')}`;

    // Buscar todos os dados em paralelo
    const [financeiroRes, despesasRes, outrasReceitasRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/financeiro`),
      axios.get(`${JSON_SERVER_URL}/despesas`),
      axios.get(`${JSON_SERVER_URL}/outras_receitas`)
    ]);

    // Filtrar por mês
    const sessoes = financeiroRes.data.filter(r => r.data.startsWith(mesFormatado));
    const despesas = despesasRes.data.filter(d => d.data.startsWith(mesFormatado));
    const outrasReceitas = outrasReceitasRes.data.filter(r => r.data.startsWith(mesFormatado));

    // Calcular receitas de sessões
    const receitaSessoes = sessoes.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    const receitaSessoesRecebida = sessoes.filter(r => r.pago).reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);

    // Calcular outras receitas
    const valorOutrasReceitas = outrasReceitas.reduce((sum, r) => sum + parseFloat(r.valor || 0), 0);
    const valorOutrasReceitasLiquido = outrasReceitas.reduce((sum, r) => sum + parseFloat(r.valor_liquido || r.valor || 0), 0);

    // Calcular despesas
    const valorDespesas = despesas.reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
    const valorDespesasLiquido = despesas.reduce((sum, d) => sum + parseFloat(d.valor_liquido || d.valor || 0), 0);

    // Totais
    const totalReceitas = receitaSessoes + valorOutrasReceitas;
    const totalReceitasRecebidas = receitaSessoesRecebida + valorOutrasReceitas;
    const totalReceitasLiquido = receitaSessoesRecebida + valorOutrasReceitasLiquido;

    const liquido = totalReceitasRecebidas - valorDespesas;
    const liquidoComTaxas = totalReceitasLiquido - valorDespesasLiquido;

    const resumo = {
      sessoes: {
        total: sessoes.length,
        valor_total: receitaSessoes,
        valor_recebido: receitaSessoesRecebida,
        valor_pendente: receitaSessoes - receitaSessoesRecebida,
        sessoes_pagas: sessoes.filter(r => r.pago).length,
        sessoes_pendentes: sessoes.filter(r => !r.pago).length
      },
      outras_receitas: {
        total: outrasReceitas.length,
        valor_total: valorOutrasReceitas,
        valor_liquido: valorOutrasReceitasLiquido
      },
      despesas: {
        total: despesas.length,
        valor_total: valorDespesas,
        valor_liquido: valorDespesasLiquido
      },
      resumo: {
        total_receitas: totalReceitas,
        total_receitas_recebidas: totalReceitasRecebidas,
        total_despesas: valorDespesas,
        liquido: liquido,
        liquido_com_taxas: liquidoComTaxas
      }
    };

    res.json(resumo);
  } catch (error) {
    console.error('Erro ao gerar resumo mensal:', error);
    res.status(500).json({ error: 'Erro ao gerar resumo mensal' });
  }
});

// ===== ROTAS GENÉRICAS (devem vir por último) =====

// Listar todos os registros financeiros
router.get('/', async (req, res) => {
  try {
    const { data_inicio, data_fim, cliente_id, pago, mes } = req.query;

    // Buscar registros financeiros e clientes separadamente
    const [financeiroRes, clientesRes] = await Promise.all([
      axios.get(`${JSON_SERVER_URL}/financeiro?_sort=data&_order=desc`),
      axios.get(`${JSON_SERVER_URL}/clientes`)
    ]);

    let registros = financeiroRes.data;
    const clientes = clientesRes.data;

    // Criar um mapa de clientes para busca rápida
    const clientesMap = {};
    clientes.forEach(c => clientesMap[c.id] = c);

    // Adicionar dados do cliente a cada registro
    registros = registros.map(r => ({
      ...r,
      cliente: clientesMap[r.cliente_id]
    }));

    // Filtros
    if (data_inicio) {
      registros = registros.filter(r => r.data >= data_inicio);
    }
    if (data_fim) {
      registros = registros.filter(r => r.data <= data_fim);
    }
    if (cliente_id) {
      registros = registros.filter(r => r.cliente_id == cliente_id);
    }
    if (pago !== undefined) {
      const pagoBoolean = pago === 'true';
      registros = registros.filter(r => r.pago === pagoBoolean);
    }
    if (mes) {
      // Formato esperado: YYYY-MM
      registros = registros.filter(r => r.data.startsWith(mes));
    }

    res.json(registros);
  } catch (error) {
    console.error('Erro ao buscar registros financeiros:', error);
    res.status(500).json({ error: 'Erro ao buscar registros financeiros' });
  }
});

// Buscar registro financeiro por ID
router.get('/:id', async (req, res) => {
  try {
    const registroRes = await axios.get(
      `${JSON_SERVER_URL}/financeiro/${req.params.id}`
    );

    const registro = registroRes.data;

    // Buscar dados do cliente se houver cliente_id
    if (registro.cliente_id) {
      const clienteRes = await axios.get(
        `${JSON_SERVER_URL}/clientes/${registro.cliente_id}`
      );
      registro.cliente = clienteRes.data;
    }

    res.json(registro);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao buscar registro' });
  }
});

// Criar novo registro financeiro
router.post('/', async (req, res) => {
  try {
    const novoRegistro = {
      ...req.body,
      pago: req.body.pago || false,
      created_at: new Date().toISOString()
    };

    const response = await axios.post(
      `${JSON_SERVER_URL}/financeiro`,
      novoRegistro
    );
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar registro financeiro:', error);
    res.status(500).json({ error: 'Erro ao criar registro financeiro' });
  }
});

// Atualizar registro financeiro
router.put('/:id', async (req, res) => {
  try {
    const registroAtualizado = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const response = await axios.put(
      `${JSON_SERVER_URL}/financeiro/${req.params.id}`,
      registroAtualizado
    );
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao atualizar registro' });
  }
});

// Deletar registro financeiro
router.delete('/:id', async (req, res) => {
  try {
    await axios.delete(`${JSON_SERVER_URL}/financeiro/${req.params.id}`);
    res.json({ message: 'Registro removido com sucesso' });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

module.exports = router;
