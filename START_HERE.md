# 👋 COMECE AQUI!

## Bem-vindo ao Arranjos de Consultório! 🧠

Este é um **sistema completo para gerenciar consultórios** de psicologia e terapia.

## 🚀 Para Começar em 3 Minutos

### 1️⃣ Instalar dependências
```bash
# Backend
cd backend
npm install

# Frontend (em outro terminal)
cd frontend
npm install
```

### 2️⃣ Executar o projeto
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 3️⃣ Acessar e usar
- Abra http://localhost:3000
- Login: `admin@arranjos.com`
- Senha: `123456`

**Pronto! 🎉** O sistema está rodando!

---

## 📚 Documentação Completa

### 🎯 Essenciais (Leia Primeiro)
1. **[RESUMO_PROJETO.md](./RESUMO_PROJETO.md)** - O que foi criado
2. **[INSTALACAO.md](./INSTALACAO.md)** - Como instalar passo a passo
3. **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** - Comandos úteis

### 📖 Complementares
4. **[INDICE.md](./INDICE.md)** - Navegação completa do projeto
5. **[MIGRACAO.md](./MIGRACAO.md)** - Migrar para produção
6. **[README.md](./README.md)** - Documentação técnica completa

---

## ✨ O Que Este Sistema Faz?

- ✅ **Agenda Semanal** - Organize todos os atendimentos
- ✅ **Gestão de Clientes** - Cadastro completo de pacientes
- ✅ **Controle Financeiro** - Receitas e pagamentos
- ✅ **Estatísticas** - Gráficos e análises
- ✅ **Dashboard** - Visão geral do consultório

---

## 🆘 Problemas?

### Porta já em uso?
```bash
# Windows
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Erro ao instalar?
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Mais ajuda?
Consulte **[INSTALACAO.md](./INSTALACAO.md)** - Seção "Solução de Problemas"

---

## 📁 Estrutura Resumida

```
arranjos-consultorio/
├── 📄 Documentação (você está aqui!)
├── 📁 backend/          # API Node.js
├── 📁 frontend/         # App React
└── 📁 database/         # Dados
```

---

## 🎓 Próximos Passos

Depois de rodar o sistema:

1. ✅ Explore a interface
2. ✅ Crie novos clientes
3. ✅ Agende atendimentos
4. ✅ Veja as estatísticas
5. 🔄 Considere migrar para banco real ([MIGRACAO.md](./MIGRACAO.md))
6. 🚀 Faça deploy online

---

## 💡 Dica Rápida

**Mantenha 2 terminais abertos:**
- Terminal 1: Backend (`cd backend && npm run dev`)
- Terminal 2: Frontend (`cd frontend && npm start`)

---

## 🎯 Atalho Rápido

| Comando | O que faz |
|---------|-----------|
| `cd backend && npm run dev` | Inicia API |
| `cd frontend && npm start` | Inicia interface |
| `Ctrl + C` | Para o servidor |

---

## 📞 Recursos

- 📖 [Documentação React](https://react.dev)
- 🔧 [Documentação Express](https://expressjs.com)
- 📊 [Documentação Chart.js](https://www.chartjs.org)

---

**🎉 Você está pronto para começar!**

Abra os próximos arquivos na ordem:
1. RESUMO_PROJETO.md
2. INSTALACAO.md  
3. COMANDOS_RAPIDOS.md

**Desenvolvido com ❤️ para facilitar a vida de psicólogos e terapeutas.**
