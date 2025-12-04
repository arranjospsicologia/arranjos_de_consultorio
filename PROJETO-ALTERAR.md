# PROJETO-ALTERAR.md
# Plano de Implementação para Sistema Completo de Arranjos de Consultório

## RESUMO EXECUTIVO

Este documento detalha todas as alterações necessárias para transformar o sistema atual em conformidade com as especificações do PROJETO-COMPLETO.md. As implementações estão organizadas em fases para facilitar o desenvolvimento incremental.

---

## ÍNDICE

1. [Fase 1 - Banco de Dados e Modelos](#fase-1---banco-de-dados-e-modelos)
2. [Fase 2 - Sistema de Configurações](#fase-2---sistema-de-configurações)
3. [Fase 3 - Aprimoramento do Módulo de Clientes](#fase-3---aprimoramento-do-módulo-de-clientes)
4. [Fase 4 - Aprimoramento da Agenda](#fase-4---aprimoramento-da-agenda)
5. [Fase 5 - Nova Página: Acompanhar](#fase-5---nova-página-acompanhar)
6. [Fase 6 - Aprimoramento do Financeiro](#fase-6---aprimoramento-do-financeiro)
7. [Fase 7 - Aprimoramento de Estatísticas](#fase-7---aprimoramento-de-estatísticas)
8. [Fase 8 - Melhorias de UX e Funcionalidades Finais](#fase-8---melhorias-de-ux-e-funcionalidades-finais)

---

## FASE 1 - BANCO DE DADOS E MODELOS

### Objetivo
Reestruturar o banco de dados para suportar todas as funcionalidades do sistema.

### 1.1 - Nova Tabela: configuracoes_usuario

**Descrição:** Armazenar todas as configurações do usuário/consultório.

```sql
CREATE TABLE configuracoes_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,

    -- Configurações de exibição da agenda
    intervalo_agenda INTEGER DEFAULT 15 CHECK (intervalo_agenda IN (10, 15, 30, 60)),
    dias_trabalho JSONB DEFAULT '["1","2","3","4","5"]'::jsonb, -- 0=domingo, 1=segunda...
    hora_inicio_trabalho TIME DEFAULT '08:00',
    hora_fim_trabalho TIME DEFAULT '20:00',

    -- Dados pessoais
    nome_completo VARCHAR(255),
    crp VARCHAR(50),

    -- Dados bancários
    banco VARCHAR(100),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    cpf_cnpj VARCHAR(18),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id)
);
```

### 1.2 - Nova Tabela: servicos

**Descrição:** Catálogo de serviços oferecidos pelo consultório.

```sql
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    valor_padrao DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir serviços padrão
INSERT INTO servicos (usuario_id, nome, duracao_minutos, valor_padrao, ordem) VALUES
(1, 'Atendimento Individual', 60, 200.00, 1),
(1, 'Atendimento de Casal', 75, 240.00, 2);
```

### 1.3 - Nova Tabela: meios_pagamento

**Descrição:** Meios de pagamento aceitos e suas taxas.

```sql
CREATE TABLE meios_pagamento (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    taxa_percentual DECIMAL(5, 2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir meios padrão
INSERT INTO meios_pagamento (usuario_id, nome, taxa_percentual) VALUES
(1, 'Dinheiro', 0.00),
(1, 'Pix', 0.00),
(1, 'Transferência', 0.00),
(1, 'Crédito', 4.50),
(1, 'Picpay', 3.99);
```

### 1.4 - Nova Tabela: historico_taxas

**Descrição:** Histórico de alterações de taxas de pagamento.

```sql
CREATE TABLE historico_taxas (
    id SERIAL PRIMARY KEY,
    meio_pagamento_id INTEGER REFERENCES meios_pagamento(id) ON DELETE CASCADE,
    taxa_anterior DECIMAL(5, 2),
    taxa_nova DECIMAL(5, 2),
    data_vigencia DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.5 - Alterações na Tabela: clientes

**Descrição:** Adicionar campos necessários.

```sql
-- Adicionar novos campos
ALTER TABLE clientes ADD COLUMN cpf VARCHAR(14);
ALTER TABLE clientes ADD COLUMN endereco TEXT;
ALTER TABLE clientes ADD COLUMN aniversario DATE; -- sem ano, apenas mês/dia para alertas
ALTER TABLE clientes ADD COLUMN sexo VARCHAR(20) CHECK (sexo IN ('masculino', 'feminino', 'outro', 'não informado'));
ALTER TABLE clientes ADD COLUMN tipo_cliente VARCHAR(30) DEFAULT 'individual' CHECK (tipo_cliente IN ('individual', 'casal', 'família', 'grupo', 'outro'));
ALTER TABLE clientes ADD COLUMN servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL;
ALTER TABLE clientes ADD COLUMN valor_acordado DECIMAL(10, 2);
ALTER TABLE clientes ADD COLUMN tipo_cobranca VARCHAR(20) DEFAULT 'por_sessao' CHECK (tipo_cobranca IN ('por_sessao', 'fixo_mensal'));
ALTER TABLE clientes ADD COLUMN data_encerramento DATE; -- quando o cliente encerrou atendimentos
```

### 1.6 - Nova Tabela: clientes_membros

**Descrição:** Para clientes do tipo casal/família com múltiplos membros.

```sql
CREATE TABLE clientes_membros (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(255),
    papel VARCHAR(50), -- ex: "esposo", "esposa", "filho", etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.7 - Nova Tabela: historico_valores_cliente

**Descrição:** Histórico de alterações de valores acordados com clientes.

```sql
CREATE TABLE historico_valores_cliente (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    valor_anterior DECIMAL(10, 2),
    valor_novo DECIMAL(10, 2),
    data_vigencia DATE NOT NULL,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.8 - Alterações na Tabela: agendamentos

**Descrição:** Adicionar campos para status detalhado e funcionalidades avançadas.

```sql
-- Remover constraint antiga de status
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;

-- Adicionar novos campos
ALTER TABLE agendamentos ADD COLUMN servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL;
ALTER TABLE agendamentos ADD COLUMN valor_sessao DECIMAL(10, 2);
ALTER TABLE agendamentos ADD COLUMN status_presenca VARCHAR(5) CHECK (status_presenca IN ('P', 'F', 'FC', 'D', 'T', 'R'));
-- P=Presente, F=Falta Justificada, FC=Falta Cobrada, D=Data Comemorativa, T=Cancelado Terapeuta, R=Reagendado
ALTER TABLE agendamentos ADD COLUMN pago BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN nota_fiscal_emitida BOOLEAN DEFAULT FALSE;
ALTER TABLE agendamentos ADD COLUMN recorrencia_id VARCHAR(50); -- Identificador de grupo de recorrência
ALTER TABLE agendamentos ADD COLUMN reagendado_de_data DATE; -- Se foi reagendado, qual era a data original

-- Atualizar constraint de status
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_status_check
CHECK (status IN ('agendado', 'realizado', 'cancelado', 'presente', 'falta_justificada', 'falta_cobrada', 'cancelado_terapeuta', 'cancelado_feriado'));
```

### 1.9 - Alterações na Tabela: financeiro

**Descrição:** Adicionar campos para despesas e outras receitas.

```sql
ALTER TABLE financeiro ADD COLUMN tipo_registro VARCHAR(30) DEFAULT 'receita_sessao'
CHECK (tipo_registro IN ('receita_sessao', 'receita_outra', 'despesa'));
ALTER TABLE financeiro ADD COLUMN descricao VARCHAR(255);
ALTER TABLE financeiro ADD COLUMN meio_pagamento_id INTEGER REFERENCES meios_pagamento(id) ON DELETE SET NULL;
ALTER TABLE financeiro ADD COLUMN taxa_percentual DECIMAL(5, 2) DEFAULT 0.00;
ALTER TABLE financeiro ADD COLUMN valor_taxa DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE financeiro ADD COLUMN valor_liquido DECIMAL(10, 2);

-- Remover constraint antiga de forma_pagamento se existir
ALTER TABLE financeiro DROP CONSTRAINT IF EXISTS financeiro_forma_pagamento_check;
```

### 1.10 - Índices Adicionais

```sql
CREATE INDEX idx_agendamentos_recorrencia ON agendamentos(recorrencia_id);
CREATE INDEX idx_agendamentos_servico ON agendamentos(servico_id);
CREATE INDEX idx_clientes_servico ON clientes(servico_id);
CREATE INDEX idx_clientes_tipo ON clientes(tipo_cliente);
CREATE INDEX idx_financeiro_tipo ON financeiro(tipo_registro);
```

---

## FASE 2 - SISTEMA DE CONFIGURAÇÕES

### Objetivo
Criar a página de Configurações completa com todas as seções.

### 2.1 - Backend: Rotas de Configurações

**Arquivo:** `backend/routes/configuracoes.js`

```javascript
const express = require('express');
const router = express.Router();
// Implementar:
// GET /api/configuracoes - Buscar configurações do usuário
// PUT /api/configuracoes - Atualizar configurações do usuário
// POST /api/configuracoes/primeira-configuracao - Setup inicial
```

### 2.2 - Backend: Rotas de Serviços

**Arquivo:** `backend/routes/servicos.js`

```javascript
const express = require('express');
const router = express.Router();
// Implementar CRUD completo:
// GET /api/servicos - Listar serviços
// POST /api/servicos - Criar serviço
// PUT /api/servicos/:id - Atualizar serviço
// DELETE /api/servicos/:id - Excluir serviço
// PUT /api/servicos/reordenar - Reordenar serviços
```

### 2.3 - Backend: Rotas de Meios de Pagamento

**Arquivo:** `backend/routes/meios-pagamento.js`

```javascript
const express = require('express');
const router = express.Router();
// Implementar:
// GET /api/meios-pagamento - Listar meios
// POST /api/meios-pagamento - Criar meio
// PUT /api/meios-pagamento/:id - Atualizar meio
// PUT /api/meios-pagamento/:id/taxa - Atualizar taxa (com data de vigência)
// DELETE /api/meios-pagamento/:id - Excluir meio
// GET /api/meios-pagamento/:id/historico - Histórico de taxas
```

### 2.4 - Frontend: Página de Configurações

**Arquivo:** `frontend/src/pages/Configuracoes.js`

**Seções a implementar:**

1. **Configurar Serviços**
   - Tabela editável com serviços
   - Colunas: Nome, Duração (dropdown: 15, 30, 45, 60, 75, 90, 105, 120 min ou personalizado), Valor Padrão
   - Botão adicionar novo serviço
   - Drag-and-drop para reordenar
   - Valores padrão já preenchidos

2. **Configurar Exibição da Agenda**
   - Intervalo de blocos: 10, 15, 30 ou 60 minutos (radio buttons)
   - Dias de trabalho: checkboxes de domingo a sábado (padrão todos marcados)
   - Horários de trabalho: hora início e hora fim (padrão: 00:00 - 23:59)

3. **Configurar Meios de Pagamento**
   - Tabela com: Nome, Taxa (%), Ativo
   - Ao editar taxa, pedir data de vigência
   - Valores padrão já preenchidos
   - Botão para ver histórico de alterações

4. **Configurar Conta Bancária**
   - Campos: Banco, Agência, Conta, CPF/CNPJ

5. **Configurar Dados Pessoais**
   - Campos: Nome Completo, CRP
   - Exibido em notas fiscais futuras

### 2.5 - Frontend: Rota de Configurações

**Arquivo:** `frontend/src/App.js`

```javascript
// Adicionar rota:
<Route path="configuracoes" element={<Configuracoes />} />
```

### 2.6 - Frontend: Botão de Configurações no Layout

**Arquivo:** `frontend/src/components/Layout.js`

```javascript
// Adicionar botão de configurações no canto oposto das abas principais
// Ícone de engrenagem, levando para /configuracoes
```

### 2.7 - Fluxo de Primeira Configuração

**Descrição:** Quando usuário acessa pela primeira vez, exibir modal convidando a configurar o sistema.

- Verificar se configurações existem
- Se não, exibir modal com botão "Configurar Agora"
- Redirecionar para /configuracoes

---

## FASE 3 - APRIMORAMENTO DO MÓDULO DE CLIENTES

### Objetivo
Adicionar todos os campos e funcionalidades faltantes no módulo de Clientes.

### 3.1 - Backend: Atualizar Rotas de Clientes

**Arquivo:** `backend/routes/clientes.js`

**Adicionar/modificar:**

```javascript
// GET /api/clientes?ordenacao=alfabetica|entrada|registro|aniversario
// POST /api/clientes - Incluir novos campos
// PUT /api/clientes/:id - Incluir atualização de valor com histórico
// PUT /api/clientes/:id/valor - Atualizar valor acordado (com data de vigência)
// GET /api/clientes/:id/historico-valores - Histórico de valores
// POST /api/clientes/:id/membros - Adicionar membro (para casais/famílias)
// DELETE /api/clientes/:id/membros/:membroId - Remover membro
```

### 3.2 - Frontend: Atualizar Modal de Cliente

**Arquivo:** `frontend/src/pages/Clientes.js`

**Campos a adicionar:**

1. Tipo de Cliente (radio: Individual, Casal, Família, Grupo, Outro)
2. Se tipo != Individual: Seção para adicionar membros
   - Nome, CPF, Telefone, Email, Papel (ex: esposo, filho)
   - Botão adicionar/remover membros
3. CPF
4. Endereço
5. Aniversário (mês/dia, sem ano)
6. Sexo (dropdown: Masculino, Feminino, Outro, Não informado)
7. Serviço (dropdown buscado de /api/servicos)
   - Ao selecionar serviço, preencher automaticamente duração e valor padrão
8. Valor Acordado (editável)
9. Tipo de Cobrança (radio: Por Sessão, Fixo Mensal)

### 3.3 - Frontend: Adicionar Ordenações

**Arquivo:** `frontend/src/pages/Clientes.js`

```javascript
// Adicionar dropdown de ordenação:
// - Alfabética (padrão)
// - Ordem de entrada (data_inicio)
// - Ordem de registro (created_at)
// - Data de aniversário (apenas mês/dia)
```

### 3.4 - Frontend: Modal de Edição de Valor

**Descrição:** Ao editar valor de um cliente existente, perguntar "A partir de qual data?"

- Input de data
- Salvar no histórico de valores
- Atualizar agendamentos futuros com novo valor

### 3.5 - Frontend: Exibir Ícone de Aniversariante

**Descrição:** Na lista de clientes, exibir ícone de bolo ao lado do nome se aniversário for esta semana.

---

## FASE 4 - APRIMORAMENTO DA AGENDA

### Objetivo
Implementar agendamentos recorrentes, edição em lote, drag-and-drop, status de presença e pagamento.

### 4.1 - Backend: Rotas de Agendamentos Recorrentes

**Arquivo:** `backend/routes/agendamentos.js`

**Adicionar/modificar:**

```javascript
// POST /api/agendamentos/recorrente - Criar série de agendamentos
// Parâmetros: cliente_id, data_inicio, hora_inicio, hora_fim, servico_id, valor_sessao,
//             frequencia ('semanal', 'quinzenal'), quantidade (máx 32)
// Retorna: array de agendamentos criados com mesmo recorrencia_id

// PUT /api/agendamentos/recorrente/:recorrenciaId - Atualizar série a partir de data
// Parâmetros: data_inicio, novos_valores
// Atualiza todos os agendamentos com recorrencia_id >= data_inicio

// DELETE /api/agendamentos/recorrente/:recorrenciaId - Cancelar série a partir de data
// Parâmetros: data_inicio
// Cancela todos >= data_inicio e registra encerramento do cliente

// PUT /api/agendamentos/:id/mover - Mover agendamento (drag-and-drop)
// Parâmetros: nova_data, nova_hora_inicio
// Marca como reagendado

// PUT /api/agendamentos/:id/status-presenca - Atualizar P, F, FC, etc
// PUT /api/agendamentos/:id/pagamento - Marcar como pago/não pago
// PUT /api/agendamentos/:id/nota-fiscal - Marcar NF emitida
```

### 4.2 - Frontend: Modal de Novo Agendamento

**Arquivo:** `frontend/src/pages/Agenda.js`

**Adicionar campos:**

1. Frequência de Repetição (radio: Apenas esta consulta, Toda semana, A cada duas semanas)
2. Número de Consultas (input numérico, padrão 10, máximo 32)
   - Só exibir se frequência != "Apenas esta consulta"
3. Serviço (dropdown)
   - Ao selecionar, buscar valor padrão
4. Valor desta Sessão (editável)

**Comportamento ao salvar:**
- Se "Apenas esta consulta": criar 1 agendamento
- Se recorrente: chamar endpoint /api/agendamentos/recorrente

### 4.3 - Frontend: Modal de Edição de Agendamento Existente

**Arquivo:** `frontend/src/pages/Agenda.js`

**Ao abrir agendamento existente:**

1. Exibir dados: Cliente, Serviço, Valor
2. Permitir editar Serviço e Valor
3. Ao editar, perguntar:
   - "Alterar apenas esta consulta?"
   - "Alterar todas as consultas a partir desta data?"
4. Botão "Cancelar Consulta"
   - Perguntar:
     - "Cancelar apenas esta?"
     - "Cancelar todas a partir desta data?"
   - Se cancelar todas: registrar encerramento do cliente

### 4.4 - Frontend: Status de Presença (P, F, FC, D, T)

**Arquivo:** `frontend/src/pages/Agenda.js`

**Para agendamentos passados (data < hoje):**

1. Ao lado direito do bloco do agendamento, exibir botões pequenos:
   - Botão "P" (Presente)
   - Botão "F" (Falta Justificada)
   - Botão "FC" (Falta Cobrada)
   - Botão "..." (dropdown com: D=Data Comemorativa, T=Cancelado Terapeuta)

2. Ao clicar em um botão, atualizar status_presenca via API

3. Colorir bloco de acordo com status

### 4.5 - Frontend: Botão de Pagamento ($)

**Arquivo:** `frontend/src/pages/Agenda.js`

**Para agendamentos passados:**

1. Abaixo dos botões de status, exibir botão "$"
2. Estado inicial: levemente apagado (cinza)
3. Ao clicar: fica verde claro (pago)
4. Ao clicar novamente: volta para cinza (não pago)
5. Sincronizar com campo `pago` na tabela agendamentos

### 4.6 - Frontend: Drag and Drop

**Arquivo:** `frontend/src/pages/Agenda.js`

**Implementação:**

- Usar biblioteca react-dnd ou similar
- Permitir arrastar blocos de agendamento entre células
- Ao soltar:
  - Calcular nova data e hora
  - Chamar /api/agendamentos/:id/mover
  - Marcar status_presenca = 'R' (Reagendado)
  - Registrar data original em reagendado_de_data

### 4.7 - Frontend: Calendário de Navegação

**Arquivo:** `frontend/src/pages/Agenda.js`

**Adicionar:**
- Botão de calendário ao lado dos botões de navegação
- Ao clicar: abrir date picker
- Permitir selecionar ano/mês/dia
- Ao selecionar: navegar para aquela semana

### 4.8 - Frontend: Configurações Dinâmicas da Agenda

**Arquivo:** `frontend/src/pages/Agenda.js`

**Modificar:**
- Buscar configurações do usuário de /api/configuracoes
- Aplicar:
  - Intervalo de blocos (10, 15, 30, 60 min)
  - Dias de trabalho (exibir apenas dias configurados)
  - Horários de trabalho (exibir apenas horários configurados)

---

## FASE 5 - NOVA PÁGINA: ACOMPANHAR

### Objetivo
Criar página para acompanhamento semanal de clientes.

### 5.1 - Backend: Rotas de Acompanhar

**Arquivo:** `backend/routes/acompanhar.js`

```javascript
const express = require('express');
const router = express.Router();

// GET /api/acompanhar/semana/:data
// Retorna:
// - Clientes agendados nesta semana OU nas últimas 2 semanas mas não nesta
// - Para cada cliente:
//   - Dados do cliente
//   - Agendamentos da semana com status_presenca, valor_sessao, pago, nota_fiscal_emitida
//   - Total devido (sessões realizadas não pagas)

// PUT /api/acompanhar/agendamento/:id
// Atualizar status_presenca, pago, nota_fiscal_emitida de um agendamento
```

### 5.2 - Frontend: Página Acompanhar

**Arquivo:** `frontend/src/pages/Acompanhar.js`

**Layout:**

1. **Cabeçalho:**
   - Título: "Acompanhar"
   - Navegação de semana (< Semana Anterior | Semana Atual | Próxima Semana >)
   - Dropdown de ordenação:
     - Ordem dos atendimentos (data/hora)
     - Ordem alfabética

2. **Tabela de Clientes:**

**Colunas:**
- Nome do Cliente
- Segunda (data) - com status P/F/FC/etc
- Terça (data) - com status P/F/FC/etc
- Quarta (data) - com status P/F/FC/etc
- Quinta (data) - com status P/F/FC/etc
- Sexta (data) - com status P/F/FC/etc
- Sábado (data) - com status P/F/FC/etc
- Domingo (data) - com status P/F/FC/etc
- Valor Sessão (editável)
- $ (checkbox pago)
- NF (checkbox nota fiscal emitida)
- Dívida Total

**Comportamento:**
- Células de dias mostram P/F/FC se houver agendamento naquele dia
- Células editáveis (clicar para alterar status)
- Valor Sessão pode variar por semana se foi alterado
- Dívida Total: soma de sessões realizadas e não pagas

3. **Filtros:**
   - Exibir apenas clientes com dívida
   - Exibir apenas clientes sem NF emitida

### 5.3 - Frontend: Adicionar Rota e Menu

**Arquivo:** `frontend/src/App.js`
```javascript
<Route path="acompanhar" element={<Acompanhar />} />
```

**Arquivo:** `frontend/src/components/Layout.js`
```javascript
// Adicionar aba [Acompanhar] na navegação principal
```

---

## FASE 6 - APRIMORAMENTO DO FINANCEIRO

### Objetivo
Adicionar controle de despesas, outras receitas e cálculo de taxas.

### 6.1 - Backend: Atualizar Rotas Financeiro

**Arquivo:** `backend/routes/financeiro.js`

**Adicionar/modificar:**

```javascript
// POST /api/financeiro/despesa - Registrar despesa
// Parâmetros: data, valor, descricao, forma_pagamento

// POST /api/financeiro/receita-outra - Registrar outra receita
// Parâmetros: data, valor, descricao, forma_pagamento

// GET /api/financeiro/resumo/mensal - Retornar resumo mensal
// Incluir: receitas sessões, outras receitas, despesas, líquido

// Ao criar/atualizar registro com meio_pagamento_id:
// - Buscar taxa do meio de pagamento na data do registro
// - Calcular valor_taxa = valor * (taxa_percentual / 100)
// - Calcular valor_liquido = valor - valor_taxa
```

### 6.2 - Frontend: Página Financeiro

**Arquivo:** `frontend/src/pages/Financeiro.js`

**Adicionar:**

1. **Botões de Ação:**
   - "+ Nova Despesa"
   - "+ Outra Receita"

2. **Cards de Resumo:**
   - Receita de Sessões
   - Outras Receitas
   - Total Receitas
   - Despesas
   - Líquido (Receitas - Despesas)

3. **Tabela de Registros:**
   - Colunas: Data, Tipo (Sessão/Outra Receita/Despesa), Cliente (se aplicável), Descrição, Valor, Taxa, Valor Líquido, Status Pagamento
   - Filtros: Tipo de registro, Status de pagamento

4. **Modais:**
   - Modal de Nova Despesa: data, valor, descrição, forma de pagamento
   - Modal de Nova Receita: data, valor, descrição, forma de pagamento

---

## FASE 7 - APRIMORAMENTO DE ESTATÍSTICAS

### Objetivo
Implementar visualizações completas de estatísticas.

### 7.1 - Backend: Rotas de Estatísticas

**Arquivo:** `backend/routes/estatisticas.js`

**Adicionar/modificar:**

```javascript
// GET /api/estatisticas/mes/:ano/:mes
// Retorna:
// - Produção total (soma de todas as sessões realizadas, independente de pago)
// - Receita total (soma das sessões pagas)
// - Despesas totais
// - Média ponderada por atendimento (receita / nº de atendimentos)
// - Média ponderada por hora ocupada (contando F, FC, R)

// GET /api/estatisticas/periodo
// Parâmetros: data_inicio, data_fim (2 a 12 meses)
// Retorna: array mensal com os mesmos dados acima
```

### 7.2 - Frontend: Página Estatísticas

**Arquivo:** `frontend/src/pages/Estatisticas.js`

**Layout:**

1. **Seletor de Período:**
   - Modo: Mês Único | Período
   - Se Mês Único: seletor de mês/ano
   - Se Período: data início e data fim (validar 2-12 meses)

2. **Cards de Resumo:**
   - Produção Total do Mês/Período
   - Receita Total do Mês/Período
   - Despesas Totais
   - Média por Atendimento
   - Média por Hora Ocupada

3. **Gráficos:**
   - Gráfico de linha: Produção x Receita ao longo dos meses
   - Gráfico de barras: Despesas por mês
   - Gráfico de pizza: Distribuição de status de presença (P, F, FC, etc)

4. **Tabela Detalhada (para períodos):**
   - Linhas: cada mês
   - Colunas: Produção, Receita, Despesas, Líquido, Média Atendimento, Média Hora

---

## FASE 8 - MELHORIAS DE UX E FUNCIONALIDADES FINAIS

### Objetivo
Polimento final da interface e pequenas funcionalidades.

### 8.1 - Sistema de Notificações

**Implementar:**
- Toast notifications para ações (sucesso, erro)
- Biblioteca: react-toastify ou similar

### 8.2 - Loading States

**Implementar:**
- Skeletons para carregamento de tabelas
- Spinners para ações

### 8.3 - Validações de Formulário

**Implementar:**
- Validação de CPF
- Validação de campos obrigatórios
- Feedback visual de erros

### 8.4 - Confirmações de Ações Destrutivas

**Implementar:**
- Modais de confirmação para exclusões
- Confirmações para ações em lote

### 8.5 - Exportação de Dados

**Implementar:**
- Botão para exportar estatísticas em PDF
- Botão para exportar financeiro em CSV/Excel

### 8.6 - Acessibilidade

**Implementar:**
- Atributos ARIA
- Navegação por teclado
- Contraste adequado

### 8.7 - Responsividade

**Implementar:**
- Adaptar agenda para mobile (visualização diária)
- Adaptar tabelas para mobile (cards expansíveis)

### 8.8 - Testes

**Implementar:**
- Testes unitários dos componentes principais
- Testes de integração das APIs

---

## DECISÕES TÉCNICAS A CONSIDERAR

### 1. Biblioteca de Drag and Drop para Agenda

**Opções:**

**A) react-dnd**
- Vantagens: Flexível, bem mantida, muitos exemplos
- Desvantagens: Curva de aprendizado média, mais verboso

**B) react-beautiful-dnd**
- Vantagens: API mais simples, acessibilidade built-in, animações suaves
- Desvantagens: Focado em listas, pode precisar customização para calendário

**C) @dnd-kit**
- Vantagens: Moderna, performática, TypeScript first, acessível
- Desvantagens: Menos exemplos disponíveis, relativamente nova

**Recomendação:** @dnd-kit pela modernidade e performance.

---

### 2. Biblioteca de Gráficos para Estatísticas

**Opções:**

**A) Chart.js + react-chartjs-2**
- Vantagens: Popular, fácil de usar, boa documentação, leve
- Desvantagens: Limitado para gráficos complexos

**B) Recharts**
- Vantagens: Componentes React nativos, customizável, responsivo
- Desvantagens: Pode ser menos performático com muitos dados

**C) Victory**
- Vantagens: Modular, muitos tipos de gráficos, animações
- Desvantagens: Bundle maior

**Recomendação:** Chart.js para simplicidade e performance.

---

### 3. Geração de PDF para Exportações

**Opções:**

**A) jsPDF**
- Vantagens: Simples, leve, controle total do layout
- Desvantagens: Requer construção manual do PDF

**B) react-pdf**
- Vantagens: Componentes React para gerar PDF, sintaxe familiar
- Desvantagens: Bundle maior, menos controle fino

**C) html2canvas + jsPDF**
- Vantagens: Converte HTML direto para PDF, fácil
- Desvantagens: Resultado pode perder qualidade, tamanho do arquivo

**Recomendação:** jsPDF para controle e qualidade.

---

### 4. Validação de Formulários

**Opções:**

**A) React Hook Form + Yup**
- Vantagens: Performance (uncontrolled), validação schema-based, menos re-renders
- Desvantagens: Sintaxe diferente do padrão React

**B) Formik + Yup**
- Vantagens: Popular, bem documentado, fácil de aprender
- Desvantagens: Mais re-renders, pode ser mais lento

**C) Validação Manual**
- Vantagens: Controle total, sem dependências extras
- Desvantagens: Muito código boilerplate, difícil de manter

**Recomendação:** React Hook Form + Yup para performance e manutenibilidade.

---

### 5. Gerenciamento de Estado Global

**Opções:**

**A) Context API (atual)**
- Vantagens: Nativo do React, sem dependências
- Desvantagens: Re-renders desnecessários se não otimizado, pode ficar complexo

**B) Redux Toolkit**
- Vantagens: Padrão da indústria, DevTools, middleware, estruturado
- Desvantagens: Boilerplate, curva de aprendizado

**C) Zustand**
- Vantagens: Simples, leve, menos boilerplate que Redux
- Desvantagens: Menos recursos que Redux

**D) Recoil**
- Vantagens: Moderno, integração nativa com React, átomo-based
- Desvantagens: Menos maduro, ainda em desenvolvimento

**Recomendação:** Context API está suficiente para o escopo atual. Se crescer, migrar para Zustand.

---

### 6. Date Picker para Calendário de Navegação

**Opções:**

**A) react-datepicker**
- Vantagens: Simples, leve, customizável
- Desvantagens: Design básico

**B) Material-UI DatePicker**
- Vantagens: Design profissional, muitos recursos
- Desvantagens: Requer instalar todo MUI, bundle maior

**C) react-day-picker**
- Vantagens: Flexível, leve, boas opções de customização
- Desvantagens: Menos recursos prontos

**Recomendação:** react-datepicker para simplicidade.

---

### 7. Notificações (Toasts)

**Opções:**

**A) react-toastify**
- Vantagens: Popular, fácil de usar, muitas opções de customização
- Desvantagens: Bundle médio

**B) react-hot-toast**
- Vantagens: Muito leve, API simples, bonito por padrão
- Desvantagens: Menos opções de customização

**C) notistack (se usar MUI)**
- Vantagens: Integração com Material-UI, empilhamento de notificações
- Desvantagens: Requer MUI

**Recomendação:** react-hot-toast pela leveza e simplicidade.

---

## CRONOGRAMA ESTIMADO

**Fase 1:** 3-5 dias (banco de dados e modelos)
**Fase 2:** 4-6 dias (sistema de configurações)
**Fase 3:** 3-4 dias (aprimoramento de clientes)
**Fase 4:** 5-7 dias (aprimoramento da agenda - parte mais complexa)
**Fase 5:** 3-4 dias (página acompanhar)
**Fase 6:** 2-3 dias (aprimoramento financeiro)
**Fase 7:** 3-4 dias (aprimoramento estatísticas)
**Fase 8:** 3-5 dias (melhorias UX e testes)

**Total:** 26-38 dias de desenvolvimento

---

## PRIORIZAÇÃO SUGERIDA

### Prioridade Alta (MVP completo):
- Fase 1 (banco de dados)
- Fase 2 (configurações)
- Fase 3 (clientes completos)
- Fase 4 (agenda com recorrência e status)

### Prioridade Média (funcionalidades importantes):
- Fase 5 (acompanhar)
- Fase 6 (financeiro completo)
- Fase 7 (estatísticas)

### Prioridade Baixa (polimento):
- Fase 8 (UX e melhorias)

---

## OBSERVAÇÕES IMPORTANTES

1. **Backup:** Antes de iniciar alterações no banco de dados, fazer backup completo.

2. **Migrações:** Todas as alterações de banco devem ser versionadas e reversíveis.

3. **Testes:** Testar cada fase isoladamente antes de passar para a próxima.

4. **Dados de Exemplo:** Manter dados de exemplo atualizados conforme novas tabelas são criadas.

5. **Documentação:** Atualizar README.md após cada fase implementada.

6. **Git:** Criar branches separadas para cada fase.

7. **Validação:** Validar com usuário final após Fases 1-4 (MVP) antes de continuar.

---

## PRÓXIMOS PASSOS

1. Revisar este documento e aprovar o plano
2. Configurar ambiente de desenvolvimento
3. Criar backup do banco de dados atual
4. Iniciar Fase 1 (Banco de Dados e Modelos)
5. Testar cada fase isoladamente
6. Documentar decisões tomadas durante implementação

---

**Documento criado em:** 2025-12-03
**Versão:** 1.0
**Status:** Aguardando aprovação
