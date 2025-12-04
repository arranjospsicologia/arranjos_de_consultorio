import React, { useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';
import './Clientes.css';

const API_URL = 'http://localhost:3001';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('alfabetica');
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [statusFiltro, ordenacao]);

  const carregarDados = async () => {
    try {
      // Carregar serviços
      const servicosRes = await axios.get(`${API_URL}/servicos?ativo=true&_sort=ordem&_order=asc`);
      setServicos(servicosRes.data);

      // Carregar clientes com ordenação
      const params = {
        ordenacao: ordenacao
      };
      if (statusFiltro !== 'todos') {
        params.status = statusFiltro;
      }

      const response = await api.get('/clientes', { params });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (cliente.email && cliente.email.toLowerCase().includes(filtro.toLowerCase())) ||
    (cliente.telefone && cliente.telefone.includes(filtro))
  );

  const abrirModal = (cliente = null) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setClienteSelecionado(null);
    setModalAberto(false);
  };

  const salvarCliente = async (dados) => {
    try {
      if (clienteSelecionado) {
        await api.put(`/clientes/${clienteSelecionado.id}`, dados);
      } else {
        await api.post('/clientes', dados);
      }
      carregarDados();
      fecharModal();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const excluirCliente = async (id) => {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;

    try {
      await api.delete(`/clientes/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert('Erro ao excluir cliente');
    }
  };

  // Função para verificar se é aniversário esta semana
  const isAniversarioEstaSemana = (aniversario) => {
    if (!aniversario) return false;

    const hoje = new Date();
    const [mes, dia] = aniversario.split('-').map(Number);
    const dataAniversario = new Date(hoje.getFullYear(), mes - 1, dia);

    // Calcular início e fim da semana
    const diaAtual = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - diaAtual);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);

    return dataAniversario >= inicioSemana && dataAniversario <= fimSemana;
  };

  if (loading) {
    return <div className="loading">Carregando clientes...</div>;
  }

  return (
    <div className="clientes-page fade-in">
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p className="text-muted">Gerencie seus pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Novo Cliente
        </button>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          className="input"
          placeholder="Buscar por nome, email ou telefone..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <select
          className="input"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="alta">Alta</option>
        </select>

        <select
          className="input"
          value={ordenacao}
          onChange={(e) => setOrdenacao(e.target.value)}
        >
          <option value="alfabetica">Ordem Alfabética</option>
          <option value="entrada">Data de Entrada</option>
          <option value="registro">Data de Registro</option>
          <option value="aniversario">Aniversário</option>
        </select>
      </div>

      <div className="clientes-grid">
        {clientesFiltrados.map(cliente => (
          <div key={cliente.id} className="cliente-card">
            <div className="cliente-header">
              <h3>
                {cliente.nome}
                {isAniversarioEstaSemana(cliente.aniversario) && (
                  <span className="birthday-icon" title="Aniversário esta semana!">🎂</span>
                )}
              </h3>
              <span className={`badge badge-${
                cliente.status === 'ativo' ? 'success' :
                cliente.status === 'alta' ? 'primary' : 'warning'
              }`}>
                {cliente.status}
              </span>
            </div>

            <div className="cliente-info">
              {cliente.tipo_cliente && cliente.tipo_cliente !== 'individual' && (
                <p className="cliente-tipo">
                  {cliente.tipo_cliente === 'casal' && '👫 Casal'}
                  {cliente.tipo_cliente === 'familia' && '👨‍👩‍👧‍👦 Família'}
                  {cliente.tipo_cliente === 'grupo' && '👥 Grupo'}
                  {cliente.tipo_cliente === 'outro' && '👤 Outro'}
                </p>
              )}
              {cliente.telefone && (
                <p>📱 {cliente.telefone}</p>
              )}
              {cliente.email && (
                <p>✉️ {cliente.email}</p>
              )}
              <p className="text-sm text-muted">
                Cliente desde {new Date(cliente.data_inicio).toLocaleDateString('pt-BR')}
              </p>
              {cliente.valor_acordado && (
                <p className="text-sm">
                  💰 Valor: R$ {Number(cliente.valor_acordado).toFixed(2)}
                  {cliente.tipo_cobranca === 'fixo_mensal' && ' (mensal)'}
                </p>
              )}
            </div>

            {cliente.observacoes && (
              <p className="cliente-obs">{cliente.observacoes}</p>
            )}

            <div className="cliente-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => abrirModal(cliente)}
              >
                Editar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => excluirCliente(cliente.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {clientesFiltrados.length === 0 && (
        <div className="empty-state">
          <p>Nenhum cliente encontrado</p>
        </div>
      )}

      {modalAberto && (
        <ModalCliente
          cliente={clienteSelecionado}
          servicos={servicos}
          onSalvar={salvarCliente}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
};

const ModalCliente = ({ cliente, servicos, onSalvar, onFechar }) => {
  const [dados, setDados] = useState({
    nome: cliente?.nome || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    cpf: cliente?.cpf || '',
    endereco: cliente?.endereco || '',
    data_nascimento: cliente?.data_nascimento || '',
    aniversario: cliente?.aniversario || '',
    sexo: cliente?.sexo || 'não informado',
    tipo_cliente: cliente?.tipo_cliente || 'individual',
    servico_id: cliente?.servico_id || '',
    valor_acordado: cliente?.valor_acordado || '',
    tipo_cobranca: cliente?.tipo_cobranca || 'por_sessao',
    data_inicio: cliente?.data_inicio || new Date().toISOString().split('T')[0],
    status: cliente?.status || 'ativo',
    observacoes: cliente?.observacoes || ''
  });

  const [membros, setMembros] = useState([]);
  const [showMembrosForm, setShowMembrosForm] = useState(false);
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    papel: ''
  });

  useEffect(() => {
    if (cliente && cliente.id) {
      carregarMembros();
    }

    // Ao selecionar um serviço, preencher valor padrão
    if (dados.servico_id && !cliente) {
      const servicoSelecionado = servicos.find(s => s.id === parseInt(dados.servico_id));
      if (servicoSelecionado) {
        setDados(prev => ({ ...prev, valor_acordado: servicoSelecionado.valor_padrao }));
      }
    }
  }, [dados.servico_id]);

  const carregarMembros = async () => {
    if (!cliente || !cliente.id) return;

    try {
      const response = await axios.get(`${API_URL}/clientes_membros?cliente_id=${cliente.id}`);
      setMembros(response.data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const adicionarMembro = async () => {
    if (!novoMembro.nome) {
      alert('Nome do membro é obrigatório');
      return;
    }

    if (cliente && cliente.id) {
      // Salvar no backend
      try {
        await axios.post(`${API_URL}/clientes/${cliente.id}/membros`, novoMembro);
        carregarMembros();
        setNovoMembro({ nome: '', cpf: '', telefone: '', email: '', papel: '' });
        setShowMembrosForm(false);
      } catch (error) {
        console.error('Erro ao adicionar membro:', error);
        alert('Erro ao adicionar membro');
      }
    } else {
      // Adicionar temporariamente (será salvo junto com o cliente)
      setMembros([...membros, { ...novoMembro, id: Date.now() }]);
      setNovoMembro({ nome: '', cpf: '', telefone: '', email: '', papel: '' });
      setShowMembrosForm(false);
    }
  };

  const removerMembro = async (membroId) => {
    if (!window.confirm('Deseja remover este membro?')) return;

    if (cliente && cliente.id) {
      try {
        await axios.delete(`${API_URL}/clientes/${cliente.id}/membros/${membroId}`);
        carregarMembros();
      } catch (error) {
        console.error('Erro ao remover membro:', error);
        alert('Erro ao remover membro');
      }
    } else {
      setMembros(membros.filter(m => m.id !== membroId));
    }
  };

  const handleServicoChange = (servicoId) => {
    const servicoSelecionado = servicos.find(s => s.id === parseInt(servicoId));
    if (servicoSelecionado) {
      setDados({
        ...dados,
        servico_id: servicoId,
        valor_acordado: servicoSelecionado.valor_padrao
      });
    } else {
      setDados({ ...dados, servico_id: servicoId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(dados);
  };

  const mostrarSecaoMembros = dados.tipo_cliente !== 'individual';

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button className="modal-close" onClick={onFechar}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Informações Básicas */}
          <div className="form-section">
            <h4>Informações Básicas</h4>

            <div className="form-group">
              <label className="label">Nome *</label>
              <input
                type="text"
                className="input"
                value={dados.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Tipo de Cliente *</label>
                <select
                  className="input"
                  value={dados.tipo_cliente}
                  onChange={(e) => setDados({ ...dados, tipo_cliente: e.target.value })}
                >
                  <option value="individual">Individual</option>
                  <option value="casal">Casal</option>
                  <option value="familia">Família</option>
                  <option value="grupo">Grupo</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Sexo</label>
                <select
                  className="input"
                  value={dados.sexo}
                  onChange={(e) => setDados({ ...dados, sexo: e.target.value })}
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="não informado">Não informado</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">CPF</label>
                <input
                  type="text"
                  className="input"
                  value={dados.cpf}
                  onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="form-group">
                <label className="label">Telefone</label>
                <input
                  type="tel"
                  className="input"
                  value={dados.telefone}
                  onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={dados.email}
                onChange={(e) => setDados({ ...dados, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="label">Endereço</label>
              <textarea
                className="input"
                rows="2"
                value={dados.endereco}
                onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Data de Nascimento</label>
                <input
                  type="date"
                  className="input"
                  value={dados.data_nascimento}
                  onChange={(e) => setDados({ ...dados, data_nascimento: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="label">Aniversário (Mês/Dia)</label>
                <input
                  type="text"
                  className="input"
                  value={dados.aniversario}
                  onChange={(e) => setDados({ ...dados, aniversario: e.target.value })}
                  placeholder="MM-DD (ex: 03-15)"
                />
                <small className="text-muted">Formato: MM-DD para alertas de aniversário</small>
              </div>
            </div>
          </div>

          {/* Membros (apenas se não for individual) */}
          {mostrarSecaoMembros && (
            <div className="form-section">
              <div className="section-header-inline">
                <h4>Membros {dados.tipo_cliente === 'casal' ? 'do Casal' : 'da Família/Grupo'}</h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowMembrosForm(!showMembrosForm)}
                >
                  + Adicionar Membro
                </button>
              </div>

              {showMembrosForm && (
                <div className="membros-form">
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        className="input"
                        placeholder="Nome do membro *"
                        value={novoMembro.nome}
                        onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="input"
                        placeholder="Papel (ex: esposo, filho)"
                        value={novoMembro.papel}
                        onChange={(e) => setNovoMembro({ ...novoMembro, papel: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        className="input"
                        placeholder="CPF"
                        value={novoMembro.cpf}
                        onChange={(e) => setNovoMembro({ ...novoMembro, cpf: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        className="input"
                        placeholder="Telefone"
                        value={novoMembro.telefone}
                        onChange={(e) => setNovoMembro({ ...novoMembro, telefone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="email"
                        className="input"
                        placeholder="Email"
                        value={novoMembro.email}
                        onChange={(e) => setNovoMembro({ ...novoMembro, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={adicionarMembro}
                  >
                    Salvar Membro
                  </button>
                </div>
              )}

              {membros.length > 0 && (
                <div className="membros-list">
                  {membros.map(membro => (
                    <div key={membro.id} className="membro-item">
                      <div>
                        <strong>{membro.nome}</strong>
                        {membro.papel && <span className="text-muted"> ({membro.papel})</span>}
                        {membro.telefone && <p className="text-sm">{membro.telefone}</p>}
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removerMembro(membro.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Serviço e Valores */}
          <div className="form-section">
            <h4>Serviço e Valores</h4>

            <div className="form-group">
              <label className="label">Serviço</label>
              <select
                className="input"
                value={dados.servico_id}
                onChange={(e) => handleServicoChange(e.target.value)}
              >
                <option value="">Selecione um serviço...</option>
                {servicos.map(servico => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome} ({servico.duracao_minutos} min - R$ {Number(servico.valor_padrao).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Valor Acordado (R$)</label>
                <input
                  type="number"
                  className="input"
                  value={dados.valor_acordado}
                  onChange={(e) => setDados({ ...dados, valor_acordado: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="label">Tipo de Cobrança</label>
                <select
                  className="input"
                  value={dados.tipo_cobranca}
                  onChange={(e) => setDados({ ...dados, tipo_cobranca: e.target.value })}
                >
                  <option value="por_sessao">Por Sessão</option>
                  <option value="fixo_mensal">Fixo Mensal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Outras Informações */}
          <div className="form-section">
            <h4>Outras Informações</h4>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Data de Início *</label>
                <input
                  type="date"
                  className="input"
                  value={dados.data_inicio}
                  onChange={(e) => setDados({ ...dados, data_inicio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Status</label>
                <select
                  className="input"
                  value={dados.status}
                  onChange={(e) => setDados({ ...dados, status: e.target.value })}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Observações</label>
              <textarea
                className="input"
                rows="4"
                value={dados.observacoes}
                onChange={(e) => setDados({ ...dados, observacoes: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Clientes;
