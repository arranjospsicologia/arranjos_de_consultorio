# 🚀 Guia Completo de Instalação - Arranjos de Consultório

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** versão 16 ou superior ([Download](https://nodejs.org))
- **npm** (vem com Node.js) ou **yarn**
- Um editor de código (recomendado: VS Code)

## 🔧 Passo a Passo de Instalação

### 1. Navegue até a pasta do projeto
```bash
cd arranjos-consultorio
```

### 2. Instale as dependências do Backend

```bash
cd backend
npm install
```

**Pacotes que serão instalados:**
- express (framework web)
- cors (habilita CORS)
- jsonwebtoken (autenticação JWT)
- bcryptjs (hash de senhas)
- dotenv (variáveis de ambiente)
- axios (requisições HTTP)
- nodemon (desenvolvimento - reinicia servidor automaticamente)
- json-server (simula banco de dados)

### 3. Instale as dependências do Frontend

```bash
cd ../frontend
npm install
```

**Pacotes que serão instalados:**
- react e react-dom (biblioteca React)
- react-router-dom (roteamento)
- axios (requisições HTTP)
- chart.js e react-chartjs-2 (gráficos)
- date-fns (manipulação de datas)
- react-scripts (ferramentas de build)

## ▶️ Como Executar o Projeto

Você precisará de **2 terminais abertos** ao mesmo tempo.

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Você verá uma mensagem como:
```
╔═══════════════════════════════════════════╗
║   🧠 Arranjos de Consultório - Backend   ║
║   Servidor rodando na porta 3001          ║
╚═══════════════════════════════════════════╝
```

O backend estará disponível em: **http://localhost:3001**

### Terminal 2: Frontend

Em outro terminal:
```bash
cd frontend
npm start
```

O navegador abrirá automaticamente em: **http://localhost:3000**

## 🔐 Acesso ao Sistema

Use as seguintes credenciais para fazer login:

- **Email:** `admin@arranjos.com`
- **Senha:** `123456`

## 🗂️ Estrutura de Arquivos

```
arranjos-consultorio/
│
├── backend/                    # Servidor Node.js
│   ├── routes/                # Rotas da API
│   │   ├── auth.js           # Login e autenticação
│   │   ├── clientes.js       # CRUD de clientes
│   │   ├── agendamentos.js   # CRUD de agendamentos
│   │   ├── financeiro.js     # CRUD financeiro
│   │   ├── evolucoes.js      # CRUD de evoluções
│   │   └── estatisticas.js   # Estatísticas e dashboard
│   ├── middlewares/          # Middlewares
│   │   └── auth.js          # Verificação JWT
│   ├── server.js            # Servidor principal
│   ├── package.json         # Dependências
│   └── .env                 # Configurações
│
├── frontend/                  # Aplicação React
│   ├── public/              
│   │   └── index.html       # HTML base
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   └── Layout.js   # Layout principal
│   │   ├── contexts/        # Context API
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Páginas
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Clientes.js
│   │   │   ├── Agenda.js
│   │   │   ├── Financeiro.js
│   │   │   └── Estatisticas.js
│   │   ├── services/        # Serviços
│   │   │   └── api.js      # Configuração Axios
│   │   ├── App.js          # App principal
│   │   ├── index.js        # Entry point
│   │   └── index.css       # Estilos globais
│   └── package.json        # Dependências
│
└── database/                 # Dados
    ├── db.json              # Banco JSON Server
    └── schema.sql           # Schema PostgreSQL
```

## 🔄 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/validate` - Validar token

### Clientes
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/:id` - Buscar cliente
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Excluir cliente

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/semana/:data` - Agendamentos da semana
- `GET /api/agendamentos/:id` - Buscar agendamento
- `POST /api/agendamentos` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Excluir agendamento

### Financeiro
- `GET /api/financeiro` - Listar registros
- `GET /api/financeiro/resumo/mensal` - Resumo mensal
- `POST /api/financeiro` - Criar registro
- `PUT /api/financeiro/:id` - Atualizar registro
- `DELETE /api/financeiro/:id` - Excluir registro

### Estatísticas
- `GET /api/estatisticas/dashboard` - Dashboard geral
- `GET /api/estatisticas/mensais` - Estatísticas mensais
- `GET /api/estatisticas/top-clientes` - Top clientes
- `GET /api/estatisticas/tipos-sessao` - Distribuição por tipo

## 🛠️ Solução de Problemas

### Porta 3000 ou 3001 já em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Erro "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS
Certifique-se de que o backend está rodando na porta 3001 e o frontend na 3000.

### Dados não aparecem
Verifique se o arquivo `database/db.json` existe e tem conteúdo.

## 📦 Build para Produção

### Frontend
```bash
cd frontend
npm run build
```

Isso criará uma pasta `build/` otimizada para produção.

### Backend
O backend está pronto para produção. Configure as variáveis de ambiente adequadamente.

## 🚀 Próximos Passos

1. ✅ Sistema rodando localmente
2. 📝 Adicionar mais clientes e agendamentos de teste
3. 🗄️ Migrar para banco de dados real (ver README.md principal)
4. 🌐 Fazer deploy online
5. 🔐 Implementar hash de senha real com bcrypt
6. 📧 Adicionar notificações por email
7. 📱 Otimizar para mobile

## 💡 Dicas

- **Backup**: O arquivo `db.json` contém todos os dados. Faça backup regularmente!
- **Desenvolvimento**: Use `npm run dev` no backend para reiniciar automaticamente
- **Testes**: Adicione dados de teste para experimentar todas as funcionalidades
- **Documentação**: Consulte o README.md principal para informações sobre migração

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se as portas 3000 e 3001 estão livres
3. Certifique-se de executar `npm install` em ambas as pastas
4. Confirme que os dois servidores estão rodando simultaneamente

---

**Desenvolvido com ❤️ para psicólogos e terapeutas**
