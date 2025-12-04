# 🧠 Arranjos de Consultório

Sistema web completo para psicólogos e terapeutas gerenciarem atendimentos, finanças e acompanhamento clínico.

## 📋 Funcionalidades

- **Agenda**: Calendário semanal interativo com projeção automática
- **Acompanhar**: Fichas de clientes com evolução e histórico
- **Financeiro**: Controle de pagamentos e receitas
- **Estatísticas**: Gráficos e métricas sobre atendimentos

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Instalação

1. **Clone o repositório e navegue até a pasta:**
```bash
cd arranjos-consultorio
```

2. **Instale as dependências do backend:**
```bash
cd backend
npm install
```

3. **Instale as dependências do frontend:**
```bash
cd ../frontend
npm install
```

### Executar o Projeto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
O backend estará rodando em: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
O frontend estará rodando em: http://localhost:3000

### Credenciais de Acesso
- **Email**: admin@arranjos.com
- **Senha**: 123456

## 📂 Estrutura do Projeto

```
arranjos-consultorio/
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas principais
│   │   ├── services/      # Integração com API
│   │   ├── contexts/      # Context API
│   │   └── utils/         # Funções auxiliares
│   └── package.json
├── backend/               # API Node.js + Express
│   ├── routes/           # Rotas da API
│   ├── controllers/      # Lógica de negócio
│   ├── middlewares/      # Autenticação e validação
│   └── package.json
└── database/             # JSON Server (dados)
    └── db.json
```

## 🔄 Migração para Banco de Dados Real

### Opção 1: PostgreSQL

1. **Instale o PostgreSQL e crie um banco:**
```sql
CREATE DATABASE arranjos_consultorio;
```

2. **Instale dependências:**
```bash
npm install pg sequelize
```

3. **Configure a conexão** (backend/config/database.js):
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('arranjos_consultorio', 'usuario', 'senha', {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;
```

4. **Crie os modelos** (backend/models/) seguindo a estrutura do db.json

### Opção 2: Supabase (Recomendado para deploy rápido)

1. **Crie uma conta em supabase.com**

2. **Crie as tabelas via SQL Editor:**
```sql
-- Ver schema completo no arquivo database/schema.sql
```

3. **Instale o cliente:**
```bash
npm install @supabase/supabase-js
```

4. **Configure** (backend/config/supabase.js):
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

### Opção 3: MongoDB Atlas

1. **Crie cluster em mongodb.com/atlas**

2. **Instale Mongoose:**
```bash
npm install mongoose
```

3. **Conecte:**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

## 🔐 Segurança

- JWT para autenticação
- Senhas hasheadas com bcrypt
- Variáveis de ambiente para configurações sensíveis

## 📦 Deploy

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy a pasta build/
```

### Backend (Railway/Render)
```bash
cd backend
# Configure variáveis de ambiente
# Deploy via Git
```

## 🛠️ Tecnologias

- **Frontend**: React, React Router, Chart.js, Axios
- **Backend**: Node.js, Express, JWT, bcrypt
- **Banco**: JSON Server (dev) → PostgreSQL/Supabase (produção)

## 📝 Licença

MIT License - Uso livre para fins pessoais e comerciais.

## 👨‍💻 Autor

Sistema desenvolvido para psicólogos e terapeutas organizarem seus consultórios.
