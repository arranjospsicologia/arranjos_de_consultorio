import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { addDays, startOfWeek, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Acompanhar.css';

const Acompanhar = () => {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordenacao, setOrdenacao] = useState('atendimentos'); // 'atendimentos' ou 'alfabetica'
  const [filtroDevedor, setFiltroDevedor] = useState(false);
  const [filtroSemNF, setFiltroSemNF] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [dataAtual]);

  const carregarDados = async () => {
    try {
      const dataISO = format(dataAtual, 'yyyy-MM-dd');
      const response = await api.get(`/acompanhar/semana/${dataISO}`);

      let clientesOrdenados = response.data.clientes || [];

      // Aplicar ordenação
      if (ordenacao === 'alfabetica') {
        clientesOrdenados.sort((a, b) =>
          a.cliente.nome.localeCompare(b.cliente.nome)
        );
      } else {
        // Ordenar por data/hora dos atendimentos
        clientesOrdenados.sort((a, b) => {
          const primeiroAgendamentoA = Object.values(a.agendamentosPorDia)
            .flat()
            .sort((x, y) => `${x.data} ${x.hora_inicio}`.localeCompare(`${y.data} ${y.hora_inicio}`))[0];

          const primeiroAgendamentoB = Object.values(b.agendamentosPorDia)
            .flat()
            .sort((x, y) => `${x.data} ${x.hora_inicio}`.localeCompare(`${y.data} ${y.hora_inicio}`))[0];

          if (!primeiroAgendamentoA) return 1;
          if (!primeiroAgendamentoB) return -1;

          return `${primeiroAgendamentoA.data} ${primeiroAgendamentoA.hora_inicio}`.localeCompare(
            `${primeiroAgendamentoB.data} ${primeiroAgendamentoB.hora_inicio}`
          );
        });
      }

      setClientes(clientesOrdenados);
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

  const navegarData = (dias) => {
    setDataAtual(addDays(dataAtual, dias));
  };

  const atualizarStatusPresenca = async (agendamentoId, novoStatus) => {
    try {
      await api.put(`/acompanhar/agendamento/${agendamentoId}`, {
        status_presenca: novoStatus
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status de presença');
    }
  };

  const togglePagamento = async (agendamentoId, pagoAtual) => {
    try {
      await api.put(`/acompanhar/agendamento/${agendamentoId}`, {
        pago: !pagoAtual
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      alert('Erro ao atualizar pagamento');
    }
  };

  const toggleNotaFiscal = async (agendamentoId, nfAtual) => {
    try {
      await api.put(`/acompanhar/agendamento/${agendamentoId}`, {
        nota_fiscal_emitida: !nfAtual
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error);
      alert('Erro ao atualizar nota fiscal');
    }
  };

  const clientesFiltrados = clientes.filter(item => {
    if (filtroDevedor && item.totalDevido <= 0) return false;
    if (filtroSemNF) {
      const temAgendamentoSemNF = Object.values(item.agendamentosPorDia)
        .flat()
        .some(ag => (ag.status === 'realizado' || ag.status_presenca === 'P') && !ag.nota_fiscal_emitida);
      if (!temAgendamentoSemNF) return false;
    }
    return true;
  });

  if (loading) return <div className="loading">Carregando...</div>;

  const dias = semanaAtual();

  return (
    <div className="acompanhar-page fade-in">
      <div className="page-header">
        <div>
          <h2>Acompanhar</h2>
          <p className="text-muted">Acompanhamento semanal de clientes</p>
        </div>
      </div>

      <div className="acompanhar-controls">
        <div className="navegacao-semana">
          <button className="btn btn-secondary" onClick={() => navegarData(-7)}>
            ← Semana Anterior
          </button>
          <span className="periodo-atual">
            {format(dias[0], "dd 'de' MMMM", { locale: ptBR })} - {format(dias[6], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button className="btn btn-secondary" onClick={() => navegarData(7)}>
            Próxima Semana →
          </button>
        </div>

        <div className="filtros-ordenacao">
          <select
            className="select"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
          >
            <option value="atendimentos">Ordem dos Atendimentos</option>
            <option value="alfabetica">Ordem Alfabética</option>
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filtroDevedor}
              onChange={(e) => setFiltroDevedor(e.target.checked)}
            />
            Apenas com dívida
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filtroSemNF}
              onChange={(e) => setFiltroSemNF(e.target.checked)}
            />
            Apenas sem NF
          </label>
        </div>
      </div>

      {clientesFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum cliente encontrado para esta semana</p>
        </div>
      ) : (
        <div className="tabela-acompanhar-container">
          <table className="tabela-acompanhar">
            <thead>
              <tr>
                <th className="col-cliente">Cliente</th>
                {dias.map(dia => (
                  <th key={dia.toString()} className="col-dia">
                    <div className="dia-header">
                      <div className="dia-nome">{format(dia, 'EEE', { locale: ptBR })}</div>
                      <div className="dia-data">{format(dia, 'dd/MM')}</div>
                    </div>
                  </th>
                ))}
                <th className="col-valor">Valor</th>
                <th className="col-pago">$</th>
                <th className="col-nf">NF</th>
                <th className="col-divida">Dívida</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(item => (
                <tr key={item.cliente.id}>
                  <td className="col-cliente">
                    <div className="cliente-nome">{item.cliente.nome}</div>
                  </td>

                  {dias.map(dia => {
                    const diaStr = format(dia, 'yyyy-MM-dd');
                    const agendamentos = item.agendamentosPorDia[diaStr] || [];

                    return (
                      <td key={dia.toString()} className="col-dia">
                        {agendamentos.map(ag => (
                          <div key={ag.id} className="agendamento-dia">
                            <div className="status-dropdown">
                              <select
                                value={ag.status_presenca || ''}
                                onChange={(e) => atualizarStatusPresenca(ag.id, e.target.value)}
                                className={`status-select status-${ag.status_presenca || 'none'}`}
                              >
                                <option value="">-</option>
                                <option value="P">P</option>
                                <option value="F">F</option>
                                <option value="FC">FC</option>
                                <option value="D">D</option>
                                <option value="T">T</option>
                                <option value="R">R</option>
                              </select>
                            </div>
                            <div className="horario">{ag.hora_inicio}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}

                  <td className="col-valor">
                    {(() => {
                      const valores = Object.values(item.agendamentosPorDia)
                        .flat()
                        .map(ag => ag.valor_sessao)
                        .filter(v => v);

                      if (valores.length === 0) return '-';

                      const valorUnico = valores.every(v => v === valores[0]);
                      if (valorUnico) {
                        return `R$ ${parseFloat(valores[0]).toFixed(2)}`;
                      } else {
                        return 'Variado';
                      }
                    })()}
                  </td>

                  <td className="col-pago">
                    {Object.values(item.agendamentosPorDia)
                      .flat()
                      .filter(ag => ag.status === 'realizado' || ag.status_presenca === 'P')
                      .map(ag => (
                        <button
                          key={ag.id}
                          className={`toggle-btn ${ag.pago ? 'active' : ''}`}
                          onClick={() => togglePagamento(ag.id, ag.pago)}
                          title={ag.pago ? 'Pago' : 'Não pago'}
                        >
                          $
                        </button>
                      ))}
                  </td>

                  <td className="col-nf">
                    {Object.values(item.agendamentosPorDia)
                      .flat()
                      .filter(ag => ag.status === 'realizado' || ag.status_presenca === 'P')
                      .map(ag => (
                        <button
                          key={ag.id}
                          className={`toggle-btn ${ag.nota_fiscal_emitida ? 'active' : ''}`}
                          onClick={() => toggleNotaFiscal(ag.id, ag.nota_fiscal_emitida)}
                          title={ag.nota_fiscal_emitida ? 'NF emitida' : 'NF não emitida'}
                        >
                          NF
                        </button>
                      ))}
                  </td>

                  <td className="col-divida">
                    {item.totalDevido > 0 ? (
                      <span className="divida-valor">R$ {item.totalDevido.toFixed(2)}</span>
                    ) : (
                      <span className="divida-zero">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Acompanhar;
