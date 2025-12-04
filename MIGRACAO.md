# 🔄 Guia de Migração para Banco de Dados Real

Este guia mostra como migrar do JSON Server para um banco de dados de produção.

## 📊 Opções de Banco de Dados

### 1. PostgreSQL (Recomendado para produção)

**Vantagens:**
- Robusto e confiável
- Excelente para dados relacionais
- Gratuito e open source
- Suporte a consultas complexas

**Instalação e Configuração:**

#### Passo 1: Instalar PostgreSQL
- **Windows:** [Download](https://www.postgresql.org/download/windows/)
- **Mac:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

#### Passo 2: Criar Banco de Dados
```sql
CREATE DATABASE arranjos_consultorio;
```

#### Passo 3: Executar Schema
Execute o arquivo `database/schema.sql` no PostgreSQL:
```bash
psql -U postgres -d arranjos_consultorio -f database/schema.sql
```

#### Passo 4: Instalar Dependências
```bash
cd backend
npm install pg sequelize
```

#### Passo 5: Criar arquivo de configuração

Crie `backend/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'arranjos_consultorio',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'sua_senha',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false
  }
);

module.exports = sequelize;
```

#### Passo 6: Criar Models

Exemplo de model (`backend/models/Cliente.js`):
```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cliente = sequelize.define('Cliente', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefone: DataTypes.STRING,
  email: DataTypes.STRING,
  data_nascimento: DataTypes.DATEONLY,
  data_inicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ativo', 'inativo', 'alta'),
    defaultValue: 'ativo'
  },
  observacoes: DataTypes.TEXT
}, {
  tableName: 'clientes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Cliente;
```

#### Passo 7: Atualizar Controllers

Substitua chamadas do axios por queries do Sequelize:

**Antes (JSON Server):**
```javascript
const response = await axios.get(`${JSON_SERVER_URL}/clientes`);
const clientes = response.data;
```

**Depois (PostgreSQL):**
```javascript
const Cliente = require('../models/Cliente');
const clientes = await Cliente.findAll();
```

---

### 2. Supabase (Recomendado para deploy rápido)

**Vantagens:**
- PostgreSQL gerenciado
- API REST automática
- Autenticação integrada
- Gratuito até certo limite
- Fácil deploy

**Configuração:**

#### Passo 1: Criar conta em [supabase.com](https://supabase.com)

#### Passo 2: Criar novo projeto

#### Passo 3: Executar Schema
No SQL Editor do Supabase, execute o conteúdo de `database/schema.sql`

#### Passo 4: Instalar Cliente Supabase
```bash
cd backend
npm install @supabase/supabase-js
```

#### Passo 5: Configurar Supabase

Crie `backend/config/supabase.js`:
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

#### Passo 6: Atualizar .env
```env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_do_supabase
```

#### Passo 7: Atualizar Controllers

**Exemplo:**
```javascript
const supabase = require('../config/supabase');

// Listar clientes
const { data: clientes, error } = await supabase
  .from('clientes')
  .select('*');

// Criar cliente
const { data, error } = await supabase
  .from('clientes')
  .insert([{ nome: 'João', email: 'joao@email.com' }]);

// Atualizar cliente
const { data, error } = await supabase
  .from('clientes')
  .update({ status: 'inativo' })
  .eq('id', clienteId);

// Deletar cliente
const { data, error } = await supabase
  .from('clientes')
  .delete()
  .eq('id', clienteId);
```

---

### 3. MongoDB Atlas (NoSQL)

**Vantagens:**
- Flexível (sem schema rígido)
- Escalável
- Gratuito (tier básico)
- Cloud nativo

**Configuração:**

#### Passo 1: Criar conta em [mongodb.com/atlas](https://www.mongodb.com/atlas)

#### Passo 2: Criar cluster gratuito

#### Passo 3: Configurar acesso (IP whitelist + usuário)

#### Passo 4: Instalar Mongoose
```bash
cd backend
npm install mongoose
```

#### Passo 5: Criar conexão

`backend/config/database.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Erro ao conectar MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

#### Passo 6: Criar Schemas

`backend/models/Cliente.js`:
```javascript
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  telefone: String,
  email: String,
  data_nascimento: Date,
  data_inicio: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['ativo', 'inativo', 'alta'],
    default: 'ativo'
  },
  observacoes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Cliente', clienteSchema);
```

#### Passo 7: Atualizar Controllers

```javascript
const Cliente = require('../models/Cliente');

// Listar
const clientes = await Cliente.find();

// Criar
const novoCliente = new Cliente({ nome: 'João' });
await novoCliente.save();

// Atualizar
await Cliente.findByIdAndUpdate(id, dados);

// Deletar
await Cliente.findByIdAndDelete(id);
```

---

## 🔐 Segurança Adicional

### Hash de Senhas com bcrypt

Atualizar `backend/routes/auth.js`:

```javascript
const bcrypt = require('bcryptjs');

// No registro/criação de usuário
const senhaHash = await bcrypt.hash(senha, 10);

// No login
const senhaValida = await bcrypt.compare(
  password, 
  usuario.senha_hash
);
```

---

## 📤 Migração de Dados do JSON Server

### Script de Migração

Crie `backend/scripts/migrar-dados.js`:

```javascript
const fs = require('fs');
const sequelize = require('../config/database');
const Cliente = require('../models/Cliente');
const Agendamento = require('../models/Agendamento');
// ... outros models

async function migrarDados() {
  try {
    // Ler db.json
    const dbJson = JSON.parse(
      fs.readFileSync('../database/db.json', 'utf8')
    );

    // Sincronizar models
    await sequelize.sync({ force: true });

    // Migrar clientes
    await Cliente.bulkCreate(dbJson.clientes);
    
    // Migrar agendamentos
    await Agendamento.bulkCreate(dbJson.agendamentos);
    
    console.log('✅ Migração concluída!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migrarDados();
```

Executar:
```bash
node backend/scripts/migrar-dados.js
```

---

## ✅ Checklist de Migração

- [ ] Escolher banco de dados
- [ ] Instalar dependências necessárias
- [ ] Criar banco e executar schema
- [ ] Configurar conexão
- [ ] Criar models/schemas
- [ ] Atualizar todos os controllers
- [ ] Migrar dados existentes
- [ ] Testar CRUD completo
- [ ] Atualizar autenticação
- [ ] Configurar variáveis de ambiente
- [ ] Fazer backup dos dados
- [ ] Testar em produção

---

## 🚀 Recomendação

Para **produção**, recomendamos:
1. **Supabase** - Se quer deploy rápido e fácil
2. **PostgreSQL** - Se tem experiência com banco de dados e quer controle total

Para **desenvolvimento local**:
- JSON Server (já está funcionando!)

---

**Precisa de ajuda?** Consulte a documentação oficial de cada tecnologia.
