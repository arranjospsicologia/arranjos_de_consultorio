import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import './Clientes.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Estatisticas = () => {
  const [modo, setModo] = useState('mes'); // 'mes' ou 'periodo'
  const [mesAtual, setMesAtual] = useState('');
  const [anoAtual, setAnoAtual] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [estatisticasMes, setEstatisticasMes] = useState(null);
  const [estatisticasPeriodo, setEstatisticasPeriodo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // Inicializar com mês atual
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = String(hoje.getFullYear());
    setMesAtual(mes);
    setAnoAtual(ano);

    // Inicializar período com últimos 6 meses
    const dataFimInicial = `${ano}-${mes}`;
    const inicioData = new Date(hoje);
    inicioData.setMonth(inicioData.getMonth() - 5);
    const dataInicioInicial = `${inicioData.getFullYear()}-${String(inicioData.getMonth() + 1).padStart(2, '0')}`;
    setDataInicio(dataInicioInicial);
    setDataFim(dataFimInicial);
  }, []);

  useEffect(() => {
    if (modo === 'mes' && mesAtual && anoAtual) {
      carregarEstatisticasMes();
    } else if (modo === 'periodo' && dataInicio && dataFim) {
      carregarEstatisticasPeriodo();
    }
  }, [modo, mesAtual, anoAtual, dataInicio, dataFim]);

  const carregarEstatisticasMes = async () => {
    if (!mesAtual || !anoAtual) return;

    setLoading(true);
    setErro('');
    try {
      const response = await api.get(`/estatisticas/mes/${anoAtual}/${mesAtual}`);
      setEstatisticasMes(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do mês:', error);
      setErro('Erro ao carregar estatísticas do mês');
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticasPeriodo = async () => {
    if (!dataInicio || !dataFim) return;

    setLoading(true);
    setErro('');
    try {
      const response = await api.get('/estatisticas/periodo', {
        params: { data_inicio: dataInicio, data_fim: dataFim }
      });
      setEstatisticasPeriodo(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas do período:', error);
      const mensagem = error.response?.data?.error || 'Erro ao carregar estatísticas do período';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const formatarNumero = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor || 0);
  };

  // Dados para gráfico de Produção x Receita (linha)
  const dadosProducaoReceita = modo === 'periodo' ? {
    labels: estatisticasPeriodo.map(e => e.mes_nome),
    datasets: [
      {
        label: 'Produção Total',
        data: estatisticasPeriodo.map(e => e.producao_total),
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.3
      },
      {
        label: 'Receita Total',
        data: estatisticasPeriodo.map(e => e.receita_total),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3
      }
    ]
  } : null;

  // Dados para gráfico de Despesas (barras)
  const dadosDespesas = modo === 'periodo' ? {
    labels: estatisticasPeriodo.map(e => e.mes_nome),
    datasets: [{
      label: 'Despesas',
      data: estatisticasPeriodo.map(e => e.despesas_total),
      backgroundColor: 'rgba(239, 68, 68, 0.6)',
      borderColor: 'rgb(239, 68, 68)',
      borderWidth: 1
    }]
  } : null;

  // Dados para gráfico de Status de Presença (pizza)
  const dadosStatusPresenca = estatisticasMes?.distribuicao_status ? {
    labels: ['Presente', 'Falta Justificada', 'Falta Cobrada', 'Data Comemorativa', 'Cancelado Terapeuta', 'Reagendado'],
    datasets: [{
      data: [
        estatisticasMes.distribuicao_status.P || 0,
        estatisticasMes.distribuicao_status.F || 0,
        estatisticasMes.distribuicao_status.FC || 0,
        estatisticasMes.distribuicao_status.D || 0,
        estatisticasMes.distribuicao_status.T || 0,
        estatisticasMes.distribuicao_status.R || 0
      ],
      backgroundColor: [
        '#10B981', // Verde - Presente
        '#F59E0B', // Amarelo - Falta Justificada
        '#EF4444', // Vermelho - Falta Cobrada
        '#8B5CF6', // Roxo - Data Comemorativa
        '#6B7280', // Cinza - Cancelado Terapeuta
        '#3B82F6'  // Azul - Reagendado
      ],
    }]
  } : null;

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    }
  };

  const renderCards = () => {
    const dados = modo === 'mes' ? estatisticasMes : calcularTotaisPeriodo();

    if (!dados) return null;

    return (
      <div className="grid grid-4 mb-4">
        <div className="card stat-card">
          <div className="stat-label">Produção Total</div>
          <div className="stat-value">{formatarMoeda(dados.producao_total)}</div>
          <div className="stat-description">Total de sessões realizadas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Receita Total</div>
          <div className="stat-value">{formatarMoeda(dados.receita_total)}</div>
          <div className="stat-description">Sessões pagas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Despesas Totais</div>
          <div className="stat-value">{formatarMoeda(dados.despesas_total)}</div>
          <div className="stat-description">Gastos do período</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Líquido</div>
          <div className="stat-value" style={{ color: dados.liquido >= 0 ? '#10B981' : '#EF4444' }}>
            {formatarMoeda(dados.liquido)}
          </div>
          <div className="stat-description">Receita - Despesas</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Média por Atendimento</div>
          <div className="stat-value">{formatarMoeda(dados.media_por_atendimento)}</div>
          <div className="stat-description">{dados.numero_atendimentos || 0} atendimentos</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Média por Hora Ocupada</div>
          <div className="stat-value">{formatarMoeda(dados.media_por_hora_ocupada)}</div>
          <div className="stat-description">{formatarNumero(dados.numero_horas_ocupadas)} horas</div>
        </div>
      </div>
    );
  };

  const calcularTotaisPeriodo = () => {
    if (estatisticasPeriodo.length === 0) return null;

    const totais = estatisticasPeriodo.reduce((acc, mes) => ({
      producao_total: acc.producao_total + mes.producao_total,
      receita_total: acc.receita_total + mes.receita_total,
      despesas_total: acc.despesas_total + mes.despesas_total,
      liquido: acc.liquido + mes.liquido,
      numero_atendimentos: acc.numero_atendimentos + mes.numero_atendimentos,
      numero_horas_ocupadas: acc.numero_horas_ocupadas + mes.numero_horas_ocupadas
    }), {
      producao_total: 0,
      receita_total: 0,
      despesas_total: 0,
      liquido: 0,
      numero_atendimentos: 0,
      numero_horas_ocupadas: 0
    });

    totais.media_por_atendimento = totais.numero_atendimentos > 0
      ? totais.producao_total / totais.numero_atendimentos
      : 0;

    totais.media_por_hora_ocupada = totais.numero_horas_ocupadas > 0
      ? totais.producao_total / totais.numero_horas_ocupadas
      : 0;

    return totais;
  };

  const renderTabelaPeriodo = () => {
    if (modo !== 'periodo' || estatisticasPeriodo.length === 0) return null;

    return (
      <div className="card mt-4">
        <h3>Detalhamento Mensal</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Produção</th>
                <th>Receita</th>
                <th>Despesas</th>
                <th>Líquido</th>
                <th>Média Atend.</th>
                <th>Média Hora</th>
              </tr>
            </thead>
            <tbody>
              {estatisticasPeriodo.map((mes) => (
                <tr key={mes.mes}>
                  <td>{mes.mes_nome}</td>
                  <td>{formatarMoeda(mes.producao_total)}</td>
                  <td>{formatarMoeda(mes.receita_total)}</td>
                  <td>{formatarMoeda(mes.despesas_total)}</td>
                  <td style={{ color: mes.liquido >= 0 ? '#10B981' : '#EF4444' }}>
                    {formatarMoeda(mes.liquido)}
                  </td>
                  <td>{formatarMoeda(mes.media_por_atendimento)}</td>
                  <td>{formatarMoeda(mes.media_por_hora_ocupada)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Carregando estatísticas...</div>;

  return (
    <div className="estatisticas-page fade-in">
      <div className="page-header">
        <div>
          <h2>Estatísticas</h2>
          <p className="text-muted">Análise de desempenho do consultório</p>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="card mb-4">
        <div className="form-row">
          <div className="form-group">
            <label>Modo de Visualização</label>
            <select
              className="form-control"
              value={modo}
              onChange={(e) => setModo(e.target.value)}
            >
              <option value="mes">Mês Único</option>
              <option value="periodo">Período</option>
            </select>
          </div>

          {modo === 'mes' ? (
            <>
              <div className="form-group">
                <label>Mês</label>
                <select
                  className="form-control"
                  value={mesAtual}
                  onChange={(e) => setMesAtual(e.target.value)}
                >
                  <option value="01">Janeiro</option>
                  <option value="02">Fevereiro</option>
                  <option value="03">Março</option>
                  <option value="04">Abril</option>
                  <option value="05">Maio</option>
                  <option value="06">Junho</option>
                  <option value="07">Julho</option>
                  <option value="08">Agosto</option>
                  <option value="09">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ano</label>
                <input
                  type="number"
                  className="form-control"
                  value={anoAtual}
                  onChange={(e) => setAnoAtual(e.target.value)}
                  min="2020"
                  max="2099"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Data Início (AAAA-MM)</label>
                <input
                  type="month"
                  className="form-control"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data Fim (AAAA-MM)</label>
                <input
                  type="month"
                  className="form-control"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {erro && <div className="alert alert-danger mt-2">{erro}</div>}
      </div>

      {/* Cards de Resumo */}
      {renderCards()}

      {/* Gráficos */}
      <div className="grid grid-2">
        {modo === 'periodo' && estatisticasPeriodo.length > 0 && (
          <>
            <div className="card">
              <h3>Produção x Receita (Últimos Meses)</h3>
              <div style={{ height: '300px' }}>
                <Line data={dadosProducaoReceita} options={opcoesGrafico} />
              </div>
            </div>

            <div className="card">
              <h3>Despesas por Mês</h3>
              <div style={{ height: '300px' }}>
                <Bar data={dadosDespesas} options={opcoesGrafico} />
              </div>
            </div>
          </>
        )}

        {modo === 'mes' && estatisticasMes && (
          <div className="card">
            <h3>Distribuição de Status de Presença</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={dadosStatusPresenca} options={opcoesGrafico} />
            </div>
          </div>
        )}
      </div>

      {/* Tabela Detalhada */}
      {renderTabelaPeriodo()}
    </div>
  );
};

export default Estatisticas;
