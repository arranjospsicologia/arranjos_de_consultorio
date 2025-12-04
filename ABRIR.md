# Como Abrir e Rodar o Site

## Passos Rápidos

### 1. Abrir dois terminais

**Terminal 1 - Backend (JSON Server + API):**
```bash
cd "C:\Users\bcari\OneDrive\Desktop\Socorro Claude\arranjos-consultorio\backend"
npm run dev:all
```

**Terminal 2 - Frontend (Interface):**
```bash
cd "C:\Users\bcari\OneDrive\Desktop\Socorro Claude\arranjos-consultorio\frontend"
npm start
```

### 2. Acessar o site

O navegador abrirá automaticamente em:
- **Site**: http://localhost:3000
- **Login**: admin@arranjos.com
- **Senha**: 123456

---

## Informações Técnicas

### Portas Utilizadas
- **Frontend**: Porta 3000
- **Backend API**: Porta 3002
- **JSON Server (Banco de Dados)**: Porta 3001

### O que cada terminal faz
- **Terminal 1**: Roda o JSON Server (banco de dados) e o Backend (API)
- **Terminal 2**: Roda o Frontend (interface React)

---

## Solução de Problemas

### Erro: "Porta já em uso" (EADDRINUSE)

Se aparecer erro dizendo que a porta 3001 ou 3002 já está em uso:

**1. Encontrar os processos:**
```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

**2. Matar os processos:**
```powershell
Stop-Process -Id PID -Force
```
(Substitua `PID` pelo número que apareceu no comando anterior)

**Ou use este atalho rápido:**
```powershell
# Matar todos os processos Node.js
Stop-Process -Name node -Force
```

### Erro: "npm não encontrado"

Certifique-se de que o Node.js está instalado:
```bash
node --version
npm --version
```

Se não estiver instalado, baixe em: https://nodejs.org/

### Erro: "package.json não encontrado"

Verifique se você está na pasta correta:
```bash
# Deve estar em uma destas pastas:
# Para backend: arranjos-consultorio/backend
# Para frontend: arranjos-consultorio/frontend
```

---

## Parar os Servidores

Para parar os servidores, pressione `Ctrl + C` em cada terminal.

---

## Primeira Vez Usando?

Se for a primeira vez rodando o projeto, você precisa instalar as dependências primeiro:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

Depois disso, volte para os passos rápidos no topo deste arquivo.

---

## Resumo dos Comandos

| Ação | Comando |
|------|---------|
| Iniciar Backend | `cd backend && npm run dev:all` |
| Iniciar Frontend | `cd frontend && npm start` |
| Parar servidores | `Ctrl + C` |
| Matar processos Node | `Stop-Process -Name node -Force` |
| Verificar portas em uso | `netstat -ano \| findstr :3001` |

---

## Estrutura do Projeto

```
arranjos-consultorio/
├── backend/          # API Node.js + JSON Server
├── frontend/         # Interface React
├── database/         # Dados (db.json)
└── ABRIR.md         # Este arquivo
```

---

**Desenvolvido com ❤️ para facilitar a vida de psicólogos e terapeutas.**
