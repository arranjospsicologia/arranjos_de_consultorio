# ⚡ Comandos Rápidos - Arranjos de Consultório

## 🚀 Iniciar Projeto (Primeira Vez)

```bash
# 1. Entrar na pasta do projeto
cd arranjos-consultorio

# 2. Instalar dependências do backend
cd backend
npm install

# 3. Instalar dependências do frontend
cd ../frontend
npm install

# 4. Voltar para raiz
cd ..
```

## ▶️ Executar Projeto (Dia a Dia)

### Opção 1: Dois Terminais

**Terminal 1 - Backend:**
```bash
cd arranjos-consultorio/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd arranjos-consultorio/frontend
npm start
```

### Opção 2: Script Único (Criar este arquivo)

Crie `start.sh` (Mac/Linux) ou `start.bat` (Windows):

**Mac/Linux:**
```bash
#!/bin/bash
cd backend && npm run dev &
cd frontend && npm start
```

**Windows:**
```batch
@echo off
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm start"
```

## 🔧 Comandos Úteis

### Backend

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start

# Instalar nova dependência
npm install nome-do-pacote

# Verificar versão do Node
node --version
```

### Frontend

```bash
# Desenvolvimento
npm start

# Build para produção
npm run build

# Testes
npm test

# Verificar problemas
npm audit
```

## 🗄️ Banco de Dados

### JSON Server (Desenvolvimento)

```bash
# Iniciar JSON Server manualmente
cd database
npx json-server --watch db.json --port 3001
```

### Backup dos Dados

```bash
# Fazer backup
cp database/db.json database/db.backup.json

# Restaurar backup
cp database/db.backup.json database/db.json
```

## 🧪 Testar API

### Com curl

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arranjos.com","password":"123456"}'

# Listar clientes (com token)
curl http://localhost:3001/api/clientes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Com Navegador

- Dashboard API: http://localhost:3001/api/estatisticas/dashboard
- Health Check: http://localhost:3001/api/health

## 🐛 Solução de Problemas

### Porta em uso

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Limpar cache npm

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Reset completo

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## 📦 Build para Produção

### Frontend

```bash
cd frontend
npm run build

# A pasta build/ estará pronta para deploy
```

### Backend

```bash
cd backend

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com valores de produção

# Instalar apenas dependências de produção
npm install --production
```

## 🔄 Atualizar Dependências

```bash
# Verificar atualizações disponíveis
npm outdated

# Atualizar todas (cuidado!)
npm update

# Atualizar uma específica
npm update nome-do-pacote
```

## 🎨 Personalização Rápida

### Mudar cores (frontend/src/index.css)

```css
:root {
  --primary: #4F46E5;      /* Cor principal */
  --secondary: #10B981;    /* Cor secundária */
  --danger: #EF4444;       /* Cor de perigo */
  --warning: #F59E0B;      /* Cor de aviso */
}
```

### Mudar porta do backend (backend/.env)

```env
PORT=3001  # Mudar para outra porta
```

### Mudar porta do frontend (frontend/package.json)

```json
{
  "scripts": {
    "start": "PORT=3000 react-scripts start"
  }
}
```

## 📊 Monitoramento

### Logs do Backend

```bash
cd backend
npm run dev

# Logs aparecem no terminal
```

### Inspeção do Frontend

- Chrome DevTools: F12
- React DevTools: Instalar extensão

## 🔐 Segurança

### Gerar novo JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar resultado para backend/.env
JWT_SECRET=resultado_aqui
```

### Hash de senha com bcrypt

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('senha', 10);
console.log(hash);
```

## 📱 Acessos Rápidos

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api
- **Health Check:** http://localhost:3001/api/health
- **Login:** admin@arranjos.com / 123456

## 🎯 Atalhos do VS Code

```
Ctrl/Cmd + P     - Buscar arquivo
Ctrl/Cmd + `     - Terminal
Ctrl/Cmd + Shift + F - Buscar em tudo
Ctrl/Cmd + /     - Comentar linha
```

## 📝 Git (Controle de Versão)

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Mensagem do commit"

# Criar branch
git checkout -b nome-da-branch

# Ver status
git status

# Ver histórico
git log --oneline
```

## 🌐 Deploy Rápido

### Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel
```

### Railway (Backend)

```bash
npm install -g railway
cd backend
railway login
railway init
railway up
```

---

## 💡 Dica Final

**Salve este arquivo!** É sua referência rápida para todos os comandos que você vai precisar.

**Atalho útil:** Crie aliases no seu terminal:

```bash
# Mac/Linux (~/.bashrc ou ~/.zshrc)
alias arranjos-backend="cd ~/arranjos-consultorio/backend && npm run dev"
alias arranjos-frontend="cd ~/arranjos-consultorio/frontend && npm start"
```

Depois é só digitar `arranjos-backend` ou `arranjos-frontend` de qualquer lugar! 🚀
