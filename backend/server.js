require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const agendamentosRoutes = require('./routes/agendamentos');
const financeiroRoutes = require('./routes/financeiro');
const estatisticasRoutes = require('./routes/estatisticas');
const evolucoesRoutes = require('./routes/evolucoes');
const configuracoesRoutes = require('./routes/configuracoes');
const servicosRoutes = require('./routes/servicos');
const meiosPagamentoRoutes = require('./routes/meios-pagamento');
const acompanharRoutes = require('./routes/acompanhar');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/estatisticas', estatisticasRoutes);
app.use('/api/evolucoes', evolucoesRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/meios-pagamento', meiosPagamentoRoutes);
app.use('/api/acompanhar', acompanharRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API Arranjos de Consultório funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🧠 Arranjos de Consultório - Backend   ║
║                                           ║
║   Servidor rodando na porta ${PORT}        ║
║   Ambiente: ${process.env.NODE_ENV}       ║
║                                           ║
║   Rotas disponíveis:                      ║
║   - GET  /api/health                      ║
║   - POST /api/auth/login                  ║
║   - GET  /api/clientes                    ║
║   - GET  /api/agendamentos                ║
║   - GET  /api/financeiro                  ║
║   - GET  /api/estatisticas                ║
║   - GET  /api/evolucoes                   ║
║   - GET  /api/configuracoes               ║
║   - GET  /api/servicos                    ║
║   - GET  /api/meios-pagamento             ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
