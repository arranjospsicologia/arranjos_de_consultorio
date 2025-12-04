import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Financeiro.css';

const Financeiro = () => {
  const [registros, setRegistros] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [outrasReceitas, setOutrasReceitas] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [meiosPagamento, setMeiosPagamento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesAtual, setMesAtual] = useState(new Date().toISOString().substring(0, 7));

  // Modais
  const [modalDespesa, setModalDespesa] = useState(false);
  const [modalReceita, setModalReceita] = useState(false);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('todos'); // todos, sessoes, despesas, receitas

  // Formulários
  const [formDespesa, setFormDespesa] = useState({
    data: new Date().toISOString().substring(0, 10),
    valor: '',
    descricao: '',
    meio_pagamento_id: ''
  });

  const [formReceita, setFormReceita] = useState({
    data: new Date().toISOString().substring(0, 10),
    valor: '',
    descricao: '',
    meio_pagamento_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, [mesAtual]);

  const carregarDados = async () => {
    try {
      const [ano, mes] = mesAtual.split('-');
      const [registrosRes, despesasRes, receitasRes, resumoRes, meiosRes] = await Promise.all([
        api.get('/financeiro', { params: { mes: mesAtual } }),
        api.get('/financeiro/despesas', { params: { mes: mesAtual } }),
        api.get('/financeiro/outras-receitas', { params: { mes: mesAtual } }),
        api.get('/financeiro/resumo/mensal', { params: { ano, mes } }),
        api.get('/configuracoes/meios-pagamento')
      ]);

      setRegistros(registrosRes.data);
      setDespesas(despesasRes.data);
      setOutrasReceitas(receitasRes.data);
      setResumo(resumoRes.data);
      setMeiosPagamento(meiosRes.data.filter(m => m.ativo));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const alterarStatusPagamento = async (id, pago) => {
    try {
      const registro = registros.find(r => r.id === id);
      await api.put(`/financeiro/${id}`, { ...registro, pago });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const criarDespesa = async (e) => {
    e.preventDefault();
    try {
      await api.post('/financeiro/despesas', {
        ...formDespesa,
        meio_pagamento_id: formDespesa.meio_pagamento_id || null
      });
      setModalDespesa(false);
      setFormDespesa({
        data: new Date().toISOString().substring(0, 10),
        valor: '',
        descricao: '',
        meio_pagamento_id: ''
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      alert('Erro ao criar despesa: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const criarReceita = async (e) => {
    e.preventDefault();
    try {
      await api.post('/financeiro/outras-receitas', {
        ...formReceita,
        meio_pagamento_id: formReceita.meio_pagamento_id || null
      });
      setModalReceita(false);
      setFormReceita({
        data: new Date().toISOString().substring(0, 10),
        valor: '',
        descricao: '',
        meio_pagamento_id: ''
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      alert('Erro ao criar receita: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const deletarDespesa = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta despesa?')) return;
    try {
      await api.delete(`/financeiro/despesas/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      alert('Erro ao deletar despesa');
    }
  };

  const deletarReceita = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta receita?')) return;
    try {
      await api.delete(`/financeiro/outras-receitas/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      alert('Erro ao deletar receita');
    }
  };

  // Combinar todos os registros para exibição
  const getTodosRegistros = () => {
    let todos = [];

    if (filtroTipo === 'todos' || filtroTipo === 'sessoes') {
      todos = todos.concat(registros.map(r => ({
        ...r,
        tipo: 'sessao',
        tipo_label: 'Sessão',
        descricao: r.cliente?.nome || 'N/A'
      })));
    }

    if (filtroTipo === 'todos' || filtroTipo === 'despesas') {
      todos = todos.concat(despesas.map(d => ({
        ...d,
        tipo: 'despesa',
        tipo_label: 'Despesa'
      })));
    }

    if (filtroTipo === 'todos' || filtroTipo === 'receitas') {
      todos = todos.concat(outrasReceitas.map(r => ({
        ...r,
        tipo: 'receita',
        tipo_label: 'Outra Receita'
      })));
    }

    // Ordenar por data (mais recente primeiro)
    return todos.sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const getMeioPagamentoNome = (id) => {
    const meio = meiosPagamento.find(m => m.id == id);
    return meio ? meio.nome : '-';
  };

  if (loading) return <div className="loading">Carregando dados financeiros...</div>;

  return (
    <div className="financeiro-page fade-in">
      <div className="page-header">
        <div>
          <h2>Financeiro</h2>
          <p className="text-muted">Controle completo de receitas e despesas</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="month"
            className="input"
            value={mesAtual}
            onChange={(e) => setMesAtual(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button className="btn btn-danger" onClick={() => setModalDespesa(true)}>
            + Nova Despesa
          </button>
          <button className="btn btn-success" onClick={() => setModalReceita(true)}>
            + Outra Receita
          </button>
        </div>
      </div>

      {resumo && (
        <div className="stats-grid">
          <div className="stat-card stat-sessoes">
            <div className="stat-content">
              <p className="stat-label">Receita de Sessões</p>
              <p className="stat-value">R$ {resumo.sessoes.valor_total.toFixed(2)}</p>
              <p className="stat-detail">{resumo.sessoes.total} sessões | {resumo.sessoes.sessoes_pagas} pagas</p>
            </div>
          </div>

          <div className="stat-card stat-outras-receitas">
            <div className="stat-content">
              <p className="stat-label">Outras Receitas</p>
              <p className="stat-value">R$ {resumo.outras_receitas.valor_total.toFixed(2)}</p>
              <p className="stat-detail">
                {resumo.outras_receitas.total} registro{resumo.outras_receitas.total !== 1 ? 's' : ''} |
                Líquido: R$ {resumo.outras_receitas.valor_liquido.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="stat-card stat-total-receitas">
            <div className="stat-content">
              <p className="stat-label">Total Receitas</p>
              <p className="stat-value">R$ {resumo.resumo.total_receitas.toFixed(2)}</p>
              <p className="stat-detail">
                Recebido: R$ {resumo.resumo.total_receitas_recebidas.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="stat-card stat-despesas">
            <div className="stat-content">
              <p className="stat-label">Despesas</p>
              <p className="stat-value" style={{color: '#dc3545'}}>R$ {resumo.despesas.valor_total.toFixed(2)}</p>
              <p className="stat-detail">
                {resumo.despesas.total} despesa{resumo.despesas.total !== 1 ? 's' : ''} |
                Líquido: R$ {resumo.despesas.valor_liquido.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="stat-card stat-liquido">
            <div className="stat-content">
              <p className="stat-label">Líquido</p>
              <p className="stat-value" style={{color: 'var(--secondary)'}}>
                R$ {resumo.resumo.liquido.toFixed(2)}
              </p>
              <p className="stat-detail">
                Com taxas: R$ {resumo.resumo.liquido_com_taxas.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Registros do Mês</h3>
          <div className="filtro-tipo">
            <button
              className={`btn-filtro ${filtroTipo === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('todos')}
            >
              Todos
            </button>
            <button
              className={`btn-filtro ${filtroTipo === 'sessoes' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('sessoes')}
            >
              Sessões
            </button>
            <button
              className={`btn-filtro ${filtroTipo === 'receitas' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('receitas')}
            >
              Receitas
            </button>
            <button
              className={`btn-filtro ${filtroTipo === 'despesas' ? 'active' : ''}`}
              onClick={() => setFiltroTipo('despesas')}
            >
              Despesas
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Taxa</th>
                <th>Valor Líquido</th>
                <th>Meio Pagamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {getTodosRegistros().map((registro, index) => (
                <tr key={`${registro.tipo}-${registro.id}-${index}`} className={`row-${registro.tipo}`}>
                  <td>{new Date(registro.data).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge badge-${registro.tipo}`}>
                      {registro.tipo_label}
                    </span>
                  </td>
                  <td>{registro.descricao}</td>
                  <td className={registro.tipo === 'despesa' ? 'valor-negativo' : 'valor-positivo'}>
                    {registro.tipo === 'despesa' ? '-' : ''}R$ {parseFloat(registro.valor).toFixed(2)}
                  </td>
                  <td>
                    {registro.valor_taxa ? `R$ ${parseFloat(registro.valor_taxa).toFixed(2)}` : '-'}
                  </td>
                  <td>
                    {registro.valor_liquido ? (
                      <span className={registro.tipo === 'despesa' ? 'valor-negativo' : 'valor-positivo'}>
                        {registro.tipo === 'despesa' ? '-' : ''}R$ {parseFloat(registro.valor_liquido).toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{getMeioPagamentoNome(registro.meio_pagamento_id)}</td>
                  <td>
                    {registro.tipo === 'sessao' ? (
                      <span className={`badge ${registro.pago ? 'badge-success' : 'badge-warning'}`}>
                        {registro.pago ? 'Pago' : 'Pendente'}
                      </span>
                    ) : (
                      <span className="badge badge-info">-</span>
                    )}
                  </td>
                  <td>
                    {registro.tipo === 'sessao' && !registro.pago && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => alterarStatusPagamento(registro.id, true)}
                      >
                        Marcar Pago
                      </button>
                    )}
                    {registro.tipo === 'despesa' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deletarDespesa(registro.id)}
                      >
                        Excluir
                      </button>
                    )}
                    {registro.tipo === 'receita' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deletarReceita(registro.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getTodosRegistros().length === 0 && (
            <div className="empty-state">Nenhum registro neste mês</div>
          )}
        </div>
      </div>

      {/* Modal Nova Despesa */}
      {modalDespesa && (
        <div className="modal-overlay" onClick={() => setModalDespesa(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Despesa</h3>
              <button className="btn-close" onClick={() => setModalDespesa(false)}>&times;</button>
            </div>
            <form onSubmit={criarDespesa}>
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  className="input"
                  value={formDespesa.data}
                  onChange={(e) => setFormDespesa({...formDespesa, data: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formDespesa.valor}
                  onChange={(e) => setFormDespesa({...formDespesa, valor: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <input
                  type="text"
                  className="input"
                  value={formDespesa.descricao}
                  onChange={(e) => setFormDespesa({...formDespesa, descricao: e.target.value})}
                  placeholder="Ex: Material de escritório, aluguel, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Meio de Pagamento</label>
                <select
                  className="input"
                  value={formDespesa.meio_pagamento_id}
                  onChange={(e) => setFormDespesa({...formDespesa, meio_pagamento_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {meiosPagamento.map(meio => (
                    <option key={meio.id} value={meio.id}>
                      {meio.nome} {meio.taxa_percentual > 0 ? `(${meio.taxa_percentual}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalDespesa(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger">
                  Criar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Outra Receita */}
      {modalReceita && (
        <div className="modal-overlay" onClick={() => setModalReceita(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Outra Receita</h3>
              <button className="btn-close" onClick={() => setModalReceita(false)}>&times;</button>
            </div>
            <form onSubmit={criarReceita}>
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  className="input"
                  value={formReceita.data}
                  onChange={(e) => setFormReceita({...formReceita, data: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formReceita.valor}
                  onChange={(e) => setFormReceita({...formReceita, valor: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição *</label>
                <input
                  type="text"
                  className="input"
                  value={formReceita.descricao}
                  onChange={(e) => setFormReceita({...formReceita, descricao: e.target.value})}
                  placeholder="Ex: Palestra, consultoria, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Meio de Pagamento</label>
                <select
                  className="input"
                  value={formReceita.meio_pagamento_id}
                  onChange={(e) => setFormReceita({...formReceita, meio_pagamento_id: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {meiosPagamento.map(meio => (
                    <option key={meio.id} value={meio.id}>
                      {meio.nome} {meio.taxa_percentual > 0 ? `(${meio.taxa_percentual}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalReceita(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Criar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
