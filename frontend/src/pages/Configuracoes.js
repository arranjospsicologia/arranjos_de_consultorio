import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Configuracoes.css';

const Configuracoes = () => {
  // Estados
  const [activeTab, setActiveTab] = useState('servicos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Estados para Serviços
  const [servicos, setServicos] = useState([]);
  const [editingServico, setEditingServico] = useState(null);
  const [showModalServico, setShowModalServico] = useState(false);
  const [novoServico, setNovoServico] = useState({
    nome: '',
    duracao_minutos: 60,
    valor_padrao: 0,
    ativo: true
  });

  // Estados para Meios de Pagamento
  const [meiosPagamento, setMeiosPagamento] = useState([]);
  const [editingMeio, setEditingMeio] = useState(null);
  const [showModalMeio, setShowModalMeio] = useState(false);
  const [novoMeio, setNovoMeio] = useState({
    nome: '',
    taxa_percentual: 0,
    ativo: true
  });

  // Estados para Configurações da Agenda
  const [configAgenda, setConfigAgenda] = useState({
    intervalo_agenda: 15,
    dias_trabalho: ['1', '2', '3', '4', '5'],
    hora_inicio_trabalho: '08:00',
    hora_fim_trabalho: '20:00'
  });

  // Estados para Dados Pessoais e Bancários
  const [dadosPessoais, setDadosPessoais] = useState({
    nome_completo: '',
    crp: '',
    banco: '',
    agencia: '',
    conta: '',
    cpf_cnpj: ''
  });

  const [configId, setConfigId] = useState(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar serviços
      const servicosRes = await api.get('/servicos');
      setServicos(servicosRes.data);

      // Carregar meios de pagamento
      const meiosRes = await api.get('/meios-pagamento');
      setMeiosPagamento(meiosRes.data);

      // Carregar configurações do usuário
      const configRes = await api.get('/configuracoes');
      if (configRes.data) {
        const config = configRes.data;
        setConfigId(config.id);
        setConfigAgenda({
          intervalo_agenda: config.intervalo_agenda || 15,
          dias_trabalho: config.dias_trabalho || ['1', '2', '3', '4', '5'],
          hora_inicio_trabalho: config.hora_inicio_trabalho || '08:00',
          hora_fim_trabalho: config.hora_fim_trabalho || '20:00'
        });
        setDadosPessoais({
          nome_completo: config.nome_completo || '',
          crp: config.crp || '',
          banco: config.banco || '',
          agencia: config.agencia || '',
          conta: config.conta || '',
          cpf_cnpj: config.cpf_cnpj || ''
        });
      }
    } catch (err) {
      setError('Erro ao carregar configurações: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Funções de Serviços
  const abrirModalServico = (servico = null) => {
    if (servico) {
      setEditingServico(servico);
      setNovoServico(servico);
    } else {
      setEditingServico(null);
      setNovoServico({
        nome: '',
        duracao_minutos: 60,
        valor_padrao: 0,
        ativo: true
      });
    }
    setShowModalServico(true);
  };

  const fecharModalServico = () => {
    setShowModalServico(false);
    setEditingServico(null);
    setNovoServico({
      nome: '',
      duracao_minutos: 60,
      valor_padrao: 0,
      ativo: true
    });
  };

  const salvarServico = async () => {
    try {
      if (!novoServico.nome || !novoServico.duracao_minutos || !novoServico.valor_padrao) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }

      if (editingServico) {
        // Atualizar
        await api.put(`/servicos/${editingServico.id}`, novoServico);
        setSuccessMessage('Serviço atualizado com sucesso!');
      } else {
        // Criar novo
        await api.post('/servicos', novoServico);
        setSuccessMessage('Serviço criado com sucesso!');
      }

      fecharModalServico();
      carregarDados();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao salvar serviço: ' + (err.response?.data?.error || err.message));
    }
  };

  const excluirServico = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    try {
      await api.delete(`/servicos/${id}`);
      setSuccessMessage('Serviço excluído com sucesso!');
      carregarDados();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao excluir serviço: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleAtivoServico = async (servico) => {
    try {
      await api.put(`/servicos/${servico.id}`, {
        ...servico,
        ativo: !servico.ativo
      });
      carregarDados();
    } catch (err) {
      setError('Erro ao atualizar status do serviço: ' + (err.response?.data?.error || err.message));
    }
  };

  // Funções de Meios de Pagamento
  const abrirModalMeio = (meio = null) => {
    if (meio) {
      setEditingMeio(meio);
      setNovoMeio(meio);
    } else {
      setEditingMeio(null);
      setNovoMeio({
        nome: '',
        taxa_percentual: 0,
        ativo: true
      });
    }
    setShowModalMeio(true);
  };

  const fecharModalMeio = () => {
    setShowModalMeio(false);
    setEditingMeio(null);
    setNovoMeio({
      nome: '',
      taxa_percentual: 0,
      ativo: true
    });
  };

  const salvarMeio = async () => {
    try {
      if (!novoMeio.nome) {
        setError('Preencha o nome do meio de pagamento');
        return;
      }

      if (editingMeio) {
        // Atualizar
        await api.put(`/meios-pagamento/${editingMeio.id}`, novoMeio);
        setSuccessMessage('Meio de pagamento atualizado com sucesso!');
      } else {
        // Criar novo
        await api.post('/meios-pagamento', novoMeio);
        setSuccessMessage('Meio de pagamento criado com sucesso!');
      }

      fecharModalMeio();
      carregarDados();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao salvar meio de pagamento: ' + (err.response?.data?.error || err.message));
    }
  };

  const excluirMeio = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este meio de pagamento?')) {
      return;
    }

    try {
      await api.delete(`/meios-pagamento/${id}`);
      setSuccessMessage('Meio de pagamento excluído com sucesso!');
      carregarDados();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Erro ao excluir meio de pagamento: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleAtivoMeio = async (meio) => {
    try {
      await api.put(`/meios-pagamento/${meio.id}`, {
        ...meio,
        ativo: !meio.ativo
      });
      carregarDados();
    } catch (err) {
      setError('Erro ao atualizar status do meio de pagamento: ' + (err.response?.data?.error || err.message));
    }
  };

  // Função para salvar configurações da agenda
  const salvarConfigAgenda = async () => {
    try {
      const configData = {
        ...configAgenda,
        ...dadosPessoais
      };

      await api.put('/configuracoes', configData);
      setSuccessMessage('Configurações salvas com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
      carregarDados();
    } catch (err) {
      setError('Erro ao salvar configurações: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleDiaTrabalho = (dia) => {
    const dias = [...configAgenda.dias_trabalho];
    const index = dias.indexOf(dia);
    if (index > -1) {
      dias.splice(index, 1);
    } else {
      dias.push(dia);
    }
    setConfigAgenda({ ...configAgenda, dias_trabalho: dias.sort() });
  };

  // Renderização das abas
  const renderServicos = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>Configurar Serviços</h2>
        <button className="btn btn-primary" onClick={() => abrirModalServico()}>
          + Adicionar Serviço
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Duração (min)</th>
            <th>Valor Padrão</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map(servico => (
            <tr key={servico.id}>
              <td>{servico.nome}</td>
              <td>{servico.duracao_minutos}</td>
              <td>R$ {Number(servico.valor_padrao).toFixed(2)}</td>
              <td>
                <span
                  className={`badge ${servico.ativo ? 'badge-success' : 'badge-secondary'}`}
                  onClick={() => toggleAtivoServico(servico)}
                  style={{ cursor: 'pointer' }}
                >
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => abrirModalServico(servico)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => excluirServico(servico.id)}
                  style={{ marginLeft: '5px' }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {servicos.length === 0 && (
        <p className="text-center text-muted">Nenhum serviço cadastrado</p>
      )}
    </div>
  );

  const renderMeiosPagamento = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>Configurar Meios de Pagamento</h2>
        <button className="btn btn-primary" onClick={() => abrirModalMeio()}>
          + Adicionar Meio de Pagamento
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Taxa (%)</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {meiosPagamento.map(meio => (
            <tr key={meio.id}>
              <td>{meio.nome}</td>
              <td>{Number(meio.taxa_percentual).toFixed(2)}%</td>
              <td>
                <span
                  className={`badge ${meio.ativo ? 'badge-success' : 'badge-secondary'}`}
                  onClick={() => toggleAtivoMeio(meio)}
                  style={{ cursor: 'pointer' }}
                >
                  {meio.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => abrirModalMeio(meio)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => excluirMeio(meio.id)}
                  style={{ marginLeft: '5px' }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {meiosPagamento.length === 0 && (
        <p className="text-center text-muted">Nenhum meio de pagamento cadastrado</p>
      )}
    </div>
  );

  const renderConfigAgenda = () => (
    <div className="config-section">
      <h2>Configurar Exibição da Agenda</h2>

      <div className="form-group">
        <label>Intervalo de Blocos</label>
        <div className="radio-group">
          {[10, 15, 30, 60].map(intervalo => (
            <label key={intervalo} className="radio-label">
              <input
                type="radio"
                name="intervalo"
                value={intervalo}
                checked={configAgenda.intervalo_agenda === intervalo}
                onChange={() => setConfigAgenda({ ...configAgenda, intervalo_agenda: intervalo })}
              />
              {intervalo} minutos
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Dias de Trabalho</label>
        <div className="checkbox-group">
          {[
            { value: '0', label: 'Domingo' },
            { value: '1', label: 'Segunda' },
            { value: '2', label: 'Terça' },
            { value: '3', label: 'Quarta' },
            { value: '4', label: 'Quinta' },
            { value: '5', label: 'Sexta' },
            { value: '6', label: 'Sábado' }
          ].map(dia => (
            <label key={dia.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={configAgenda.dias_trabalho.includes(dia.value)}
                onChange={() => toggleDiaTrabalho(dia.value)}
              />
              {dia.label}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Horário de Início</label>
          <input
            type="time"
            className="form-control"
            value={configAgenda.hora_inicio_trabalho}
            onChange={(e) => setConfigAgenda({ ...configAgenda, hora_inicio_trabalho: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Horário de Término</label>
          <input
            type="time"
            className="form-control"
            value={configAgenda.hora_fim_trabalho}
            onChange={(e) => setConfigAgenda({ ...configAgenda, hora_fim_trabalho: e.target.value })}
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={salvarConfigAgenda}>
        Salvar Configurações da Agenda
      </button>
    </div>
  );

  const renderDadosPessoais = () => (
    <div className="config-section">
      <h2>Dados Pessoais e Bancários</h2>

      <div className="form-group">
        <label>Nome Completo</label>
        <input
          type="text"
          className="form-control"
          value={dadosPessoais.nome_completo}
          onChange={(e) => setDadosPessoais({ ...dadosPessoais, nome_completo: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>CRP</label>
        <input
          type="text"
          className="form-control"
          value={dadosPessoais.crp}
          onChange={(e) => setDadosPessoais({ ...dadosPessoais, crp: e.target.value })}
        />
      </div>

      <h3>Dados Bancários</h3>

      <div className="form-group">
        <label>Banco</label>
        <input
          type="text"
          className="form-control"
          value={dadosPessoais.banco}
          onChange={(e) => setDadosPessoais({ ...dadosPessoais, banco: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Agência</label>
          <input
            type="text"
            className="form-control"
            value={dadosPessoais.agencia}
            onChange={(e) => setDadosPessoais({ ...dadosPessoais, agencia: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Conta</label>
          <input
            type="text"
            className="form-control"
            value={dadosPessoais.conta}
            onChange={(e) => setDadosPessoais({ ...dadosPessoais, conta: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>CPF/CNPJ</label>
        <input
          type="text"
          className="form-control"
          value={dadosPessoais.cpf_cnpj}
          onChange={(e) => setDadosPessoais({ ...dadosPessoais, cpf_cnpj: e.target.value })}
        />
      </div>

      <button className="btn btn-primary" onClick={salvarConfigAgenda}>
        Salvar Dados Pessoais e Bancários
      </button>
    </div>
  );

  return (
    <div className="configuracoes-page">
      <h1>Configurações do Sistema</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={() => setSuccessMessage(null)} className="alert-close">×</button>
        </div>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'servicos' ? 'active' : ''}`}
              onClick={() => setActiveTab('servicos')}
            >
              Serviços
            </button>
            <button
              className={`tab ${activeTab === 'meios' ? 'active' : ''}`}
              onClick={() => setActiveTab('meios')}
            >
              Meios de Pagamento
            </button>
            <button
              className={`tab ${activeTab === 'agenda' ? 'active' : ''}`}
              onClick={() => setActiveTab('agenda')}
            >
              Exibição da Agenda
            </button>
            <button
              className={`tab ${activeTab === 'pessoais' ? 'active' : ''}`}
              onClick={() => setActiveTab('pessoais')}
            >
              Dados Pessoais
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'servicos' && renderServicos()}
            {activeTab === 'meios' && renderMeiosPagamento()}
            {activeTab === 'agenda' && renderConfigAgenda()}
            {activeTab === 'pessoais' && renderDadosPessoais()}
          </div>
        </>
      )}

      {/* Modal de Serviço */}
      {showModalServico && (
        <div className="modal-overlay" onClick={fecharModalServico}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</h2>

            <div className="form-group">
              <label>Nome do Serviço*</label>
              <input
                type="text"
                className="form-control"
                value={novoServico.nome}
                onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                placeholder="Ex: Atendimento Individual"
              />
            </div>

            <div className="form-group">
              <label>Duração (minutos)*</label>
              <select
                className="form-control"
                value={novoServico.duracao_minutos}
                onChange={(e) => setNovoServico({ ...novoServico, duracao_minutos: parseInt(e.target.value) })}
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={75}>75 minutos</option>
                <option value={90}>90 minutos</option>
                <option value={105}>105 minutos</option>
                <option value={120}>120 minutos</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor Padrão (R$)*</label>
              <input
                type="number"
                className="form-control"
                value={novoServico.valor_padrao}
                onChange={(e) => setNovoServico({ ...novoServico, valor_padrao: parseFloat(e.target.value) })}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={novoServico.ativo}
                  onChange={(e) => setNovoServico({ ...novoServico, ativo: e.target.checked })}
                />
                Serviço ativo
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={fecharModalServico}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={salvarServico}>
                {editingServico ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Meio de Pagamento */}
      {showModalMeio && (
        <div className="modal-overlay" onClick={fecharModalMeio}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMeio ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}</h2>

            <div className="form-group">
              <label>Nome*</label>
              <input
                type="text"
                className="form-control"
                value={novoMeio.nome}
                onChange={(e) => setNovoMeio({ ...novoMeio, nome: e.target.value })}
                placeholder="Ex: Pix, Dinheiro, Cartão"
              />
            </div>

            <div className="form-group">
              <label>Taxa (%)</label>
              <input
                type="number"
                className="form-control"
                value={novoMeio.taxa_percentual}
                onChange={(e) => setNovoMeio({ ...novoMeio, taxa_percentual: parseFloat(e.target.value) })}
                placeholder="0.00"
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={novoMeio.ativo}
                  onChange={(e) => setNovoMeio({ ...novoMeio, ativo: e.target.checked })}
                />
                Meio de pagamento ativo
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={fecharModalMeio}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={salvarMeio}>
                {editingMeio ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
