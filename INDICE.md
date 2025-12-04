# 📑 Índice de Navegação - Arranjos de Consultório

## 🎯 COMECE AQUI

1. **[RESUMO_PROJETO.md](./RESUMO_PROJETO.md)** ⭐
   - Visão geral completa do que foi criado
   - Lista de funcionalidades
   - Tecnologias utilizadas

2. **[INSTALACAO.md](./INSTALACAO.md)** 🚀
   - Passo a passo para instalar
   - Como executar o projeto
   - Solução de problemas comuns

3. **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** ⚡
   - Comandos do dia a dia
   - Atalhos úteis
   - Referência rápida

## 📚 DOCUMENTAÇÃO DETALHADA

### Guias Principais

- **[README.md](./README.md)** - Documentação principal do projeto
- **[MIGRACAO.md](./MIGRACAO.md)** - Como migrar para banco de dados real
- **[.gitignore](./.gitignore)** - Arquivos para ignorar no Git

## 🗂️ ESTRUTURA DO PROJETO

### Backend (API REST)

```
backend/
├── 📄 server.js              - Servidor principal Express
├── 📄 package.json           - Dependências do backend
├── 📄 .env                   - Variáveis de ambiente
├── 📄 .env.example          - Exemplo de configuração
│
├── 📁 routes/               - Rotas da API
│   ├── auth.js             - Login e autenticação JWT
│   ├── clientes.js         - CRUD de clientes
│   ├── agendamentos.js     - CRUD de agendamentos
│   ├── financeiro.js       - CRUD financeiro + resumos
│   ├── evolucoes.js        - CRUD de evoluções clínicas
│   └── estatisticas.js     - Dashboard e estatísticas
│
└── 📁 middlewares/
    └── auth.js             - Verificação de token JWT
```

**Endpoints principais:**
- `POST /api/auth/login` - Fazer login
- `GET /api/clientes` - Listar clientes
- `GET /api/agendamentos/semana/:data` - Agenda semanal
- `GET /api/financeiro/resumo/mensal` - Resumo financeiro
- `GET /api/estatisticas/dashboard` - Estatísticas gerais

### Frontend (React SPA)

```
frontend/
├── 📁 public/
│   └── index.html          - HTML base
│
├── 📁 src/
│   ├── 📄 index.js         - Entry point
│   ├── 📄 App.js           - Componente principal + rotas
│   ├── 📄 index.css        - Estilos globais
│   │
│   ├── 📁 components/       - Componentes reutilizáveis
│   │   ├── Layout.js       - Layout com navegação
│   │   └── Layout.css
│   │
│   ├── 📁 contexts/         - Context API
│   │   └── AuthContext.js  - Gerenciamento de autenticação
│   │
│   ├── 📁 services/         - Serviços
│   │   └── api.js          - Configuração Axios + interceptors
│   │
│   └── 📁 pages/           - Páginas da aplicação
│       ├── Login.js / .css        - Tela de login
│       ├── Dashboard.js / .css    - Dashboard principal
│       ├── Clientes.js / .css     - Gestão de clientes
│       ├── Agenda.js / .css       - Agenda semanal
│       ├── Financeiro.js          - Controle financeiro
│       └── Estatisticas.js        - Gráficos e análises
│
└── 📄 package.json         - Dependências do frontend
```

**Páginas acessíveis:**
- `/login` - Login
- `/` - Dashboard
- `/clientes` - Gestão de clientes
- `/agenda` - Agenda semanal
- `/financeiro` - Controle financeiro
- `/estatisticas` - Estatísticas e gráficos

### Database

```
database/
├── 📄 db.json              - Dados JSON Server (desenvolvimento)
└── 📄 schema.sql           - Schema PostgreSQL (produção)
```

## 🎨 COMPONENTES E FUNCIONALIDADES

### Por Página

#### 1. Login (`/login`)
- Formulário de autenticação
- Validação de credenciais
- Geração de token JWT
- Redirecionamento automático

#### 2. Dashboard (`/`)
- Cards com métricas principais
- Clientes ativos
- Sessões do dia/mês
- Receita mensal
- Status dos agendamentos

#### 3. Clientes (`/clientes`)
- Listagem em grid
- Busca por nome/email/telefone
- Filtro por status
- Modal de criar/editar
- Exclusão com confirmação
- Badge de status

#### 4. Agenda (`/agenda`)
- Visualização semanal (7 dias)
- Navegação entre semanas
- Criação de agendamentos
- Edição inline
- Cores por status
- Associação com clientes

#### 5. Financeiro (`/financeiro`)
- Filtro por mês
- Resumo mensal automático
- Tabela de registros
- Marcar como pago/pendente
- Total recebido/pendente

#### 6. Estatísticas (`/estatisticas`)
- Gráfico de barras (receita mensal)
- Gráfico de linhas (sessões)
- Gráfico de pizza (tipos de sessão)
- Top 10 clientes
- Últimos 6 meses

## 🔑 INFORMAÇÕES IMPORTANTES

### Credenciais Padrão
```
Email: admin@arranjos.com
Senha: 123456
```

### Portas
```
Frontend: http://localhost:3000
Backend:  http://localhost:3001
```

### Variáveis de Ambiente

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=arranjos_consultorio_secret_2025
NODE_ENV=development
JSON_SERVER_URL=http://localhost:3001
```

## 📊 ESTATÍSTICAS DO PROJETO

- **Total de arquivos:** 38
- **Linhas de código:** ~3.500+
- **Componentes React:** 7 páginas + Layout
- **Rotas API:** 6 módulos
- **Documentação:** 5 guias completos

## 🔧 TECNOLOGIAS

### Frontend
- React 18
- React Router v6
- Axios
- Chart.js
- date-fns
- CSS3

### Backend
- Node.js
- Express
- JWT
- bcryptjs
- CORS
- Axios

### Desenvolvimento
- JSON Server
- Nodemon
- React Scripts

## 📖 ORDEM DE LEITURA RECOMENDADA

Para **iniciantes:**
1. RESUMO_PROJETO.md
2. INSTALACAO.md
3. COMANDOS_RAPIDOS.md
4. Explorar o código

Para **desenvolvedores experientes:**
1. RESUMO_PROJETO.md
2. Explorar estrutura de arquivos
3. MIGRACAO.md (para produção)
4. Customizar conforme necessidade

## 🎯 PRÓXIMOS PASSOS

1. ✅ Ler a documentação
2. ✅ Instalar dependências
3. ✅ Executar o projeto
4. ✅ Testar funcionalidades
5. ✅ Personalizar conforme necessidade
6. 🔄 Migrar para banco real
7. 🚀 Deploy em produção

## 💡 DICAS

- **Backup:** Sempre faça backup do `database/db.json`
- **Desenvolvimento:** Use `npm run dev` no backend
- **Produção:** Siga o guia em MIGRACAO.md
- **Dúvidas:** Consulte COMANDOS_RAPIDOS.md

## 🆘 PRECISA DE AJUDA?

1. Verifique **INSTALACAO.md** para problemas de instalação
2. Verifique **COMANDOS_RAPIDOS.md** para comandos úteis
3. Verifique **MIGRACAO.md** para migração de banco
4. Consulte a documentação das tecnologias usadas

## 📞 RECURSOS ÚTEIS

- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [Chart.js Docs](https://www.chartjs.org)
- [MDN Web Docs](https://developer.mozilla.org)

---

**🎉 Projeto completo e pronto para uso!**

Desenvolvido com ❤️ para simplificar a gestão de consultórios de psicologia e terapia.
