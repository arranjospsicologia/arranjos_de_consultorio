// Utilitários de exportação de dados

export const exportarParaCSV = (dados, nomeArquivo = 'dados.csv') => {
  if (!dados || dados.length === 0) {
    throw new Error('Não há dados para exportar');
  }

  // Obter cabeçalhos
  const headers = Object.keys(dados[0]);

  // Criar linhas CSV
  const linhasCSV = dados.map(linha => {
    return headers.map(header => {
      const valor = linha[header];
      // Escapar valores que contenham vírgula ou aspas
      if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"'))) {
        return `"${valor.replace(/"/g, '""')}"`;
      }
      return valor;
    }).join(',');
  });

  // Adicionar cabeçalhos
  const csv = [headers.join(','), ...linhasCSV].join('\n');

  // Criar blob e download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportarFinanceiroParaCSV = (registros) => {
  const dadosFormatados = registros.map(reg => ({
    'Data': reg.data,
    'Tipo': reg.tipo_registro === 'receita_sessao' ? 'Receita (Sessão)'
          : reg.tipo_registro === 'receita_outra' ? 'Receita (Outra)'
          : 'Despesa',
    'Cliente': reg.cliente_nome || '-',
    'Descrição': reg.descricao || '-',
    'Valor': `R$ ${parseFloat(reg.valor || 0).toFixed(2)}`,
    'Meio de Pagamento': reg.meio_pagamento_nome || '-',
    'Taxa': reg.taxa_percentual ? `${reg.taxa_percentual}%` : '0%',
    'Valor Líquido': `R$ ${parseFloat(reg.valor_liquido || reg.valor || 0).toFixed(2)}`,
    'Pago': reg.pago ? 'Sim' : 'Não',
    'NF Emitida': reg.nota_fiscal_emitida ? 'Sim' : 'Não'
  }));

  exportarParaCSV(dadosFormatados, `financeiro_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportarClientesParaCSV = (clientes) => {
  const dadosFormatados = clientes.map(cliente => ({
    'Nome': cliente.nome,
    'Email': cliente.email || '-',
    'Telefone': cliente.telefone || '-',
    'CPF': cliente.cpf || '-',
    'Tipo': cliente.tipo_cliente || 'individual',
    'Status': cliente.status,
    'Data Início': cliente.data_inicio || '-',
    'Valor Acordado': cliente.valor_acordado ? `R$ ${parseFloat(cliente.valor_acordado).toFixed(2)}` : '-',
    'Tipo Cobrança': cliente.tipo_cobranca || '-'
  }));

  exportarParaCSV(dadosFormatados, `clientes_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportarEstatisticasParaPDF = async (estatisticas, periodo) => {
  // Nota: Para implementação completa de PDF, seria necessário usar jsPDF
  // Por enquanto, vou criar uma versão simplificada que gera HTML imprimível

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Estatísticas - ${periodo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4F46E5; color: white; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        .card-title { font-size: 14px; color: #666; }
        .card-value { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Relatório de Estatísticas</h1>
      <p>Período: ${periodo}</p>
      <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>

      <div class="summary">
        <div class="card">
          <div class="card-title">Produção Total</div>
          <div class="card-value">R$ ${parseFloat(estatisticas.producao_total || 0).toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-title">Receita Total</div>
          <div class="card-value">R$ ${parseFloat(estatisticas.receita_total || 0).toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-title">Despesas Totais</div>
          <div class="card-value">R$ ${parseFloat(estatisticas.despesas_total || 0).toFixed(2)}</div>
        </div>
      </div>

      <script>
        window.print();
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
