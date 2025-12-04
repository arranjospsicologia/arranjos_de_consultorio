import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { addDays, startOfWeek, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Clientes.css';
import './Agenda.css';

const Agenda = () => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [configuracoes, setConfiguracoes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState('semana'); // 'semana' ou 'dia'
  const [dadosIniciais, setDadosIniciais] = useState(null); // Para pré-preencher modal ao clicar em horário

  // Horários de funcionamento - serão substituídos por configurações dinâmicas
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  // Inicializar horários padrão
  useEffect(() => {
    const horaInicio = configuracoes?.hora_inicio_trabalho || '08:00';
    const horaFim = configuracoes?.hora_fim_trabalho || '20:00';
    const intervalo = configuracoes?.intervalo_agenda || 30;

    const horarios = [];
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);

    let horaAtual = hInicio * 60 + mInicio;
    const horaFinal = hFim * 60 + mFim;

    while (horaAtual <= horaFinal) {
      const h = Math.floor(horaAtual / 60);
      const m = horaAtual % 60;
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      horaAtual += intervalo;
    }

    setHorariosDisponiveis(horarios);
  }, [configuracoes]);

  useEffect(() => {
    carregarDados();
  }, [dataAtual]);

  const carregarDados = async () => {
    try {
      const dataISO = format(dataAtual, 'yyyy-MM-dd');
      const [agendamentosRes, clientesRes, servicosRes, configRes] = await Promise.all([
        api.get(`/agendamentos/semana/${dataISO}`),
        api.get('/clientes', { params: { status: 'ativo' } }),
        api.get('/servicos'),
        api.get('/configuracoes').catch(() => ({ data: null }))
      ]);

      setAgendamentos(agendamentosRes.data.agendamentos || []);
      setClientes(clientesRes.data);
      setServicos(servicosRes.data);
      if (configRes.data) {
        setConfiguracoes(configRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const semanaAtual = () => {
    const inicio = startOfWeek(dataAtual, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(inicio, i));
  };

  const diasVisiveis = () => {
    return modoVisualizacao === 'semana' ? semanaAtual() : [dataAtual];
  };

  const agendamentosDoDia = (data) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    return agendamentos.filter(a => a.data === dataStr);
  };

  const agendamentoNoHorario = (data, horario) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    return agendamentos.filter(a => {
      if (a.data !== dataStr) return false;
      // Verifica se o horário está dentro do intervalo do agendamento
      return a.hora_inicio <= horario && a.hora_fim > horario;
    });
  };

  const calcularDuracaoMinutos = (horaInicio, horaFim) => {
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);
    const totalInicio = hInicio * 60 + mInicio;
    const totalFim = hFim * 60 + mFim;
    return totalFim - totalInicio;
  };

  const calcularAlturaCelulas = (horaInicio, horaFim) => {
    const duracao = calcularDuracaoMinutos(horaInicio, horaFim);
    return duracao / 30; // 30 minutos por célula
  };

  const horariosSeInterceptam = (a1, a2) => {
    return a1.hora_inicio < a2.hora_fim && a1.hora_fim > a2.hora_inicio;
  };

  const calcularPosicionamentoAgendamentos = (data) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    const agendamentosDoDia = agendamentos.filter(a => a.data === dataStr);

    if (agendamentosDoDia.length === 0) return new Map();

    // Ordenar por hora de início, depois por duração (mais longo primeiro)
    const ordenados = [...agendamentosDoDia].sort((a, b) => {
      const compareInicio = a.hora_inicio.localeCompare(b.hora_inicio);
      if (compareInicio !== 0) return compareInicio;
      const duracaoA = calcularDuracaoMinutos(a.hora_inicio, a.hora_fim);
      const duracaoB = calcularDuracaoMinutos(b.hora_inicio, b.hora_fim);
      return duracaoB - duracaoA;
    });

    const posicionamento = new Map();
    const colunas = [];

    // Primeira passagem: atribuir cada agendamento a uma coluna
    ordenados.forEach(agendamento => {
      let colunaIndex = -1;

      // Encontrar a primeira coluna disponível
      for (let i = 0; i < colunas.length; i++) {
        const conflito = colunas[i].some(a => horariosSeInterceptam(a, agendamento));
        if (!conflito) {
          colunaIndex = i;
          break;
        }
      }

      if (colunaIndex === -1) {
        colunaIndex = colunas.length;
        colunas.push([]);
      }

      colunas[colunaIndex].push(agendamento);

      posicionamento.set(agendamento.id, {
        coluna: colunaIndex,
        altura: calcularAlturaCelulas(agendamento.hora_inicio, agendamento.hora_fim)
      });
    });

    // Segunda passagem: calcular larguras e posições baseado em grupos sobrepostos
    const totalColunas = colunas.length;

    ordenados.forEach(agendamento => {
      const pos = posicionamento.get(agendamento.id);

      // Encontrar todos os agendamentos que se sobrepõem com este
      const sobrepostos = ordenados.filter(outro =>
        outro.id !== agendamento.id && horariosSeInterceptam(agendamento, outro)
      );

      // Determinar o número de colunas ocupadas no intervalo deste agendamento
      const colunasOcupadas = new Set([pos.coluna]);
      sobrepostos.forEach(outro => {
        const outroPos = posicionamento.get(outro.id);
        colunasOcupadas.add(outroPos.coluna);
      });

      const numColunasGrupo = colunasOcupadas.size > 0 ? Math.max(...Array.from(colunasOcupadas)) + 1 : 1;

      pos.largura = 100 / numColunasGrupo;
      pos.posicaoHorizontal = (100 / numColunasGrupo) * pos.coluna;
    });

    return posicionamento;
  };

  const abrirModalNovoAgendamento = (data, horario) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    const horaFim = calcularHoraFim(horario);

    setDadosIniciais({
      data: dataStr,
      hora_inicio: horario,
      hora_fim: horaFim
    });
    setAgendamentoSelecionado(null);
    setModalAberto(true);
  };

  const calcularHoraFim = (horaInicio) => {
    const [hora, minuto] = horaInicio.split(':').map(Number);
    const dataInicio = new Date(2000, 0, 1, hora, minuto);
    const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); // +1 hora
    return `${String(dataFim.getHours()).padStart(2, '0')}:${String(dataFim.getMinutes()).padStart(2, '0')}`;
  };

  const salvarAgendamento = async (dados) => {
    try {
      if (agendamentoSelecionado) {
        // Atualizar agendamento existente
        await api.put(`/agendamentos/${agendamentoSelecionado.id}`, dados);
      } else {
        // Criar novo agendamento
        if (dados.frequencia && dados.frequencia !== 'unico') {
          // Criar agendamento recorrente
          const dadosRecorrente = {
            cliente_id: dados.cliente_id,
            data_inicio: dados.data,
            hora_inicio: dados.hora_inicio,
            hora_fim: dados.hora_fim,
            servico_id: dados.servico_id,
            valor_sessao: dados.valor_sessao,
            frequencia: dados.frequencia,
            quantidade: dados.quantidade || 10,
            tipo_sessao: dados.tipo_sessao,
            observacoes: dados.observacoes
          };
          const result = await api.post('/agendamentos/recorrente', dadosRecorrente);
          alert(`${result.data.message || 'Agendamentos recorrentes criados com sucesso!'}`);
        } else {
          // Criar agendamento único
          await api.post('/agendamentos', dados);
        }
      }
      carregarDados();
      setModalAberto(false);
      setAgendamentoSelecionado(null);
      setDadosIniciais(null);
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento: ' + (error.response?.data?.error || error.message));
    }
  };

  const excluirAgendamento = async (id) => {
    if (!window.confirm('Deseja realmente excluir este agendamento?')) return;

    try {
      await api.delete(`/agendamentos/${id}`);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      alert('Erro ao excluir agendamento');
    }
  };

  const atualizarStatusPresenca = async (id, status_presenca) => {
    try {
      await api.put(`/agendamentos/${id}/status-presenca`, { status_presenca });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status de presença:', error);
      alert('Erro ao atualizar status de presença');
    }
  };

  const togglePagamento = async (id, pagoAtual) => {
    try {
      await api.put(`/agendamentos/${id}/pagamento`, { pago: !pagoAtual });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      alert('Erro ao atualizar pagamento');
    }
  };

  const navegarData = (dias) => {
    setDataAtual(addDays(dataAtual, dias));
  };

  if (loading) return <div className="loading">Carregando agenda...</div>;

  return (
    <div className="agenda-page fade-in">
      <div className="page-header">
        <div>
          <h2>Agenda</h2>
          <p className="text-muted">
            {modoVisualizacao === 'semana' ? 'Visualização semanal' : 'Visualização diária'}
          </p>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button
              className={`btn ${modoVisualizacao === 'semana' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setModoVisualizacao('semana')}
            >
              Semana
            </button>
            <button
              className={`btn ${modoVisualizacao === 'dia' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setModoVisualizacao('dia')}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      <div className="agenda-navigation">
        <button
          className="btn btn-secondary"
          onClick={() => navegarData(modoVisualizacao === 'semana' ? -7 : -1)}
        >
          ← {modoVisualizacao === 'semana' ? 'Semana Anterior' : 'Dia Anterior'}
        </button>
        <span className="periodo-atual">
          {modoVisualizacao === 'semana' ? (
            <>
              {format(semanaAtual()[0], "dd 'de' MMMM", { locale: ptBR })} - {format(semanaAtual()[6], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </>
          ) : (
            <>
              {format(dataAtual, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </>
          )}
        </span>
        <button
          className="btn btn-secondary"
          onClick={() => navegarData(modoVisualizacao === 'semana' ? 7 : 1)}
        >
          {modoVisualizacao === 'semana' ? 'Próxima Semana' : 'Próximo Dia'} →
        </button>
      </div>

      <div className="agenda-calendar">
        <div className="agenda-table" data-modo={modoVisualizacao}>
          <div className="agenda-header">
            <div className="horario-coluna"></div>
            {diasVisiveis().map(dia => (
              <div key={dia.toString()} className="dia-coluna">
                <div className="dia-nome">{format(dia, 'EEE', { locale: ptBR })}</div>
                <div className="dia-numero">{format(dia, 'dd/MM')}</div>
              </div>
            ))}
          </div>

          <div className="agenda-body">
            {horariosDisponiveis.map(horario => (
              <div key={horario} className="agenda-linha">
                <div className="horario-celula">{horario}</div>
                {diasVisiveis().map(dia => {
                  const agendamentosNaCelula = agendamentoNoHorario(dia, horario);
                  const agendamentosQueComecam = agendamentosNaCelula.filter(a => a.hora_inicio === horario);
                  const posicionamentos = calcularPosicionamentoAgendamentos(dia);
                  const temAgendamento = agendamentosNaCelula.length > 0;

                  return (
                    <div
                      key={`${dia}-${horario}`}
                      className={`dia-celula ${temAgendamento ? 'ocupado' : 'vazio'}`}
                      onClick={() => !temAgendamento && abrirModalNovoAgendamento(dia, horario)}
                    >
                      {agendamentosQueComecam.map(agendamento => {
                        const pos = posicionamentos.get(agendamento.id);
                        if (!pos) return null;

                        const alturaPx = pos.altura * 60; // 60px por célula padrão
                        const dataAgendamento = parseISO(agendamento.data);
                        const isPast = dataAgendamento < new Date();

                        return (
                          <div
                            key={agendamento.id}
                            className={`agendamento-bloco status-${agendamento.status_presenca || agendamento.status}`}
                            style={{
                              width: `${pos.largura}%`,
                              left: `${pos.posicaoHorizontal}%`,
                              height: `${alturaPx}px`
                            }}
                            title={`${agendamento.cliente?.nome || 'Cliente'} - ${agendamento.hora_inicio} às ${agendamento.hora_fim}`}
                          >
                            <div
                              className="agendamento-content"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAgendamentoSelecionado(agendamento);
                                setDadosIniciais(null);
                                setModalAberto(true);
                              }}
                            >
                              <div className="agendamento-tempo">
                                {agendamento.hora_inicio} - {agendamento.hora_fim}
                              </div>
                              <div className="agendamento-titulo">
                                {agendamento.cliente?.nome || 'Cliente não encontrado'}
                              </div>
                            </div>

                            {isPast && (
                              <div className="agendamento-actions-new" onClick={(e) => e.stopPropagation()}>
                                <div className="status-buttons-vertical">
                                  <button
                                    className={`status-btn-round ${agendamento.status_presenca === 'P' ? 'active' : ''}`}
                                    onClick={() => atualizarStatusPresenca(agendamento.id, 'P')}
                                    title="Presente"
                                  >
                                    P
                                  </button>
                                  <button
                                    className={`status-btn-round ${agendamento.status_presenca === 'F' ? 'active' : ''}`}
                                    onClick={() => atualizarStatusPresenca(agendamento.id, 'F')}
                                    title="Falta Justificada"
                                  >
                                    F
                                  </button>
                                  <button
                                    className={`status-btn-round ${agendamento.status_presenca === 'FC' ? 'active' : ''}`}
                                    onClick={() => atualizarStatusPresenca(agendamento.id, 'FC')}
                                    title="Falta Cobrada"
                                  >
                                    FC
                                  </button>
                                  <select
                                    className="status-select-round"
                                    value={agendamento.status_presenca || ''}
                                    onChange={(e) => atualizarStatusPresenca(agendamento.id, e.target.value)}
                                    title="Mais opções"
                                  >
                                    <option value="">▼</option>
                                    <option value="D">D - Data Comemorativa</option>
                                    <option value="T">T - Cancelado Terapeuta</option>
                                    <option value="R">R - Reagendado</option>
                                  </select>
                                </div>
                                <button
                                  className={`payment-btn-round ${agendamento.pago ? 'paid' : 'unpaid'}`}
                                  onClick={() => togglePagamento(agendamento.id, agendamento.pago)}
                                  title={agendamento.pago ? 'Pago' : 'Não pago'}
                                >
                                  $
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modalAberto && (
        <ModalAgendamento
          agendamento={agendamentoSelecionado}
          dadosIniciais={dadosIniciais}
          clientes={clientes}
          servicos={servicos}
          onSalvar={salvarAgendamento}
          onExcluir={excluirAgendamento}
          onFechar={() => {
            setModalAberto(false);
            setAgendamentoSelecionado(null);
            setDadosIniciais(null);
          }}
        />
      )}
    </div>
  );
};

const ModalAgendamento = ({ agendamento, dadosIniciais, clientes, servicos, onSalvar, onExcluir, onFechar }) => {
  const [dados, setDados] = useState({
    cliente_id: agendamento?.cliente_id || '',
    data: agendamento?.data || dadosIniciais?.data || format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: agendamento?.hora_inicio || dadosIniciais?.hora_inicio || '09:00',
    hora_fim: agendamento?.hora_fim || dadosIniciais?.hora_fim || '10:00',
    servico_id: agendamento?.servico_id || '',
    valor_sessao: agendamento?.valor_sessao || '',
    tipo_sessao: agendamento?.tipo_sessao || 'individual',
    status: agendamento?.status || 'agendado',
    observacoes: agendamento?.observacoes || '',
    frequencia: 'unico',
    quantidade: 10
  });

  const handleServicoChange = (servicoId) => {
    const servicoSelecionado = servicos.find(s => s.id === parseInt(servicoId));
    if (servicoSelecionado) {
      setDados({
        ...dados,
        servico_id: servicoId,
        valor_sessao: servicoSelecionado.valor_padrao
      });
    } else {
      setDados({ ...dados, servico_id: servicoId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSalvar(dados);
  };

  const handleExcluir = () => {
    if (agendamento?.id) {
      onExcluir(agendamento.id);
      onFechar();
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</h3>
          <button className="modal-close" onClick={onFechar}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="label">Cliente *</label>
            <select className="input" value={dados.cliente_id} onChange={(e) => setDados({ ...dados, cliente_id: e.target.value })} required>
              <option value="">Selecione um cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Data *</label>
              <input type="date" className="input" value={dados.data} onChange={(e) => setDados({ ...dados, data: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Tipo de Sessão</label>
              <select className="input" value={dados.tipo_sessao} onChange={(e) => setDados({ ...dados, tipo_sessao: e.target.value })}>
                <option value="individual">Individual</option>
                <option value="casal">Casal</option>
                <option value="grupo">Grupo</option>
                <option value="familiar">Familiar</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Hora Início *</label>
              <input type="time" className="input" value={dados.hora_inicio} onChange={(e) => setDados({ ...dados, hora_inicio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="label">Hora Fim *</label>
              <input type="time" className="input" value={dados.hora_fim} onChange={(e) => setDados({ ...dados, hora_fim: e.target.value })} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Serviço</label>
              <select className="input" value={dados.servico_id} onChange={(e) => handleServicoChange(e.target.value)}>
                <option value="">Selecione um serviço</option>
                {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Valor da Sessão</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={dados.valor_sessao}
                onChange={(e) => setDados({ ...dados, valor_sessao: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {!agendamento && (
            <div className="form-section">
              <h4>Recorrência</h4>
              <div className="form-group">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="frequencia"
                      value="unico"
                      checked={dados.frequencia === 'unico'}
                      onChange={(e) => setDados({ ...dados, frequencia: e.target.value })}
                    />
                    Apenas esta consulta
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="frequencia"
                      value="semanal"
                      checked={dados.frequencia === 'semanal'}
                      onChange={(e) => setDados({ ...dados, frequencia: e.target.value })}
                    />
                    Toda semana
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="frequencia"
                      value="quinzenal"
                      checked={dados.frequencia === 'quinzenal'}
                      onChange={(e) => setDados({ ...dados, frequencia: e.target.value })}
                    />
                    A cada duas semanas
                  </label>
                </div>
              </div>

              {dados.frequencia !== 'unico' && (
                <div className="form-group">
                  <label className="label">Quantidade de consultas (máx 32)</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    className="input"
                    value={dados.quantidade}
                    onChange={(e) => setDados({ ...dados, quantidade: parseInt(e.target.value) })}
                  />
                  <small>Número de agendamentos que serão criados</small>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="label">Status</label>
            <select className="input" value={dados.status} onChange={(e) => setDados({ ...dados, status: e.target.value })}>
              <option value="agendado">Agendado</option>
              <option value="presente">Presente</option>
              <option value="cancelado">Cancelado</option>
              <option value="falta_justificada">Falta Justificada</option>
              <option value="falta_cobrada">Falta Cobrada</option>
              <option value="cancelado_terapeuta">Cancelado pelo Terapeuta</option>
              <option value="cancelado_feriado">Cancelado por Feriado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Observações</label>
            <textarea className="input" rows="3" value={dados.observacoes} onChange={(e) => setDados({ ...dados, observacoes: e.target.value })} />
          </div>

          <div className="modal-actions">
            {agendamento && (
              <button type="button" className="btn btn-danger" onClick={handleExcluir}>
                Excluir
              </button>
            )}
            <div style={{ flex: 1 }}></div>
            <button type="button" className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Agenda;
// Adicionar importação do CSS no início do arquivo
