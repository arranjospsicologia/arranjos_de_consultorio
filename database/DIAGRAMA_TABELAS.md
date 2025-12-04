# Diagrama de Relacionamento - Banco de Dados

## Versão 2.0 - Fase 1 Completa

Este documento apresenta o relacionamento entre todas as tabelas do sistema após a implementação da Fase 1.

---

## Estrutura Geral

```
usuarios (1) ──┬── (1) configuracoes_usuario
               │
               ├── (N) servicos
               │
               └── (N) meios_pagamento ── (N) historico_taxas
```

```
servicos (1) ──┬── (N) clientes
               │
               └── (N) agendamentos
```

```
clientes (1) ──┬── (N) clientes_membros
               │
               ├── (N) historico_valores_cliente
               │
               ├── (N) agendamentos
               │
               ├── (N) financeiro
               │
               └── (N) evolucoes
```

```
agendamentos (1) ──┬── (1) financeiro
                   │
                   └── (1) evolucoes
```

```
meios_pagamento (1) ── (N) financeiro
```

---

## Tabelas Detalhadas

### 🔐 usuarios
```
┌─────────────────────────┐
│ usuarios                │
├─────────────────────────┤
│ id (PK)                 │
│ nome                    │
│ email (UNIQUE)          │
│ senha_hash              │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `1:1` com `configuracoes_usuario`
- `1:N` com `servicos`
- `1:N` com `meios_pagamento`

---

### ⚙️ configuracoes_usuario
```
┌───────────────────────────┐
│ configuracoes_usuario     │
├───────────────────────────┤
│ id (PK)                   │
│ usuario_id (FK, UNIQUE)   │
│ intervalo_agenda          │
│ dias_trabalho (JSON)      │
│ hora_inicio_trabalho      │
│ hora_fim_trabalho         │
│ nome_completo             │
│ crp                       │
│ banco                     │
│ agencia                   │
│ conta                     │
│ cpf_cnpj                  │
│ created_at                │
│ updated_at                │
└───────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `usuarios` (usuario_id)

**Constraints:**
- `intervalo_agenda` IN (10, 15, 30, 60)
- `usuario_id` UNIQUE

---

### 📋 servicos
```
┌─────────────────────────┐
│ servicos                │
├─────────────────────────┤
│ id (PK)                 │
│ usuario_id (FK)         │
│ nome                    │
│ duracao_minutos         │
│ valor_padrao            │
│ ativo                   │
│ ordem                   │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `usuarios` (usuario_id)
- `1:N` com `clientes` (servico_id)
- `1:N` com `agendamentos` (servico_id)

---

### 💳 meios_pagamento
```
┌─────────────────────────┐
│ meios_pagamento         │
├─────────────────────────┤
│ id (PK)                 │
│ usuario_id (FK)         │
│ nome                    │
│ taxa_percentual         │
│ ativo                   │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `usuarios` (usuario_id)
- `1:N` com `historico_taxas` (meio_pagamento_id)
- `1:N` com `financeiro` (meio_pagamento_id)

---

### 📊 historico_taxas
```
┌─────────────────────────┐
│ historico_taxas         │
├─────────────────────────┤
│ id (PK)                 │
│ meio_pagamento_id (FK)  │
│ taxa_anterior           │
│ taxa_nova               │
│ data_vigencia           │
│ created_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `meios_pagamento` (meio_pagamento_id)

---

### 👥 clientes
```
┌─────────────────────────┐
│ clientes                │
├─────────────────────────┤
│ id (PK)                 │
│ nome                    │
│ telefone                │
│ email                   │
│ data_nascimento         │
│ data_inicio             │
│ status                  │
│ observacoes             │
│ cpf                     │ ← NOVO
│ endereco                │ ← NOVO
│ aniversario             │ ← NOVO
│ sexo                    │ ← NOVO
│ tipo_cliente            │ ← NOVO
│ servico_id (FK)         │ ← NOVO
│ valor_acordado          │ ← NOVO
│ tipo_cobranca           │ ← NOVO
│ data_encerramento       │ ← NOVO
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `servicos` (servico_id)
- `1:N` com `clientes_membros` (cliente_id)
- `1:N` com `historico_valores_cliente` (cliente_id)
- `1:N` com `agendamentos` (cliente_id)
- `1:N` com `financeiro` (cliente_id)
- `1:N` com `evolucoes` (cliente_id)

**Constraints:**
- `status` IN ('ativo', 'inativo', 'alta')
- `sexo` IN ('masculino', 'feminino', 'outro', 'não informado')
- `tipo_cliente` IN ('individual', 'casal', 'família', 'grupo', 'outro')
- `tipo_cobranca` IN ('por_sessao', 'fixo_mensal')

---

### 👨‍👩‍👧 clientes_membros
```
┌─────────────────────────┐
│ clientes_membros        │
├─────────────────────────┤
│ id (PK)                 │
│ cliente_id (FK)         │
│ nome                    │
│ cpf                     │
│ telefone                │
│ email                   │
│ papel                   │
│ created_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `clientes` (cliente_id)

**Uso:** Armazenar membros de clientes tipo casal/família

---

### 📈 historico_valores_cliente
```
┌─────────────────────────┐
│ historico_valores_cliente│
├─────────────────────────┤
│ id (PK)                 │
│ cliente_id (FK)         │
│ valor_anterior          │
│ valor_novo              │
│ data_vigencia           │
│ motivo                  │
│ created_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `clientes` (cliente_id)

**Uso:** Rastrear mudanças de valores acordados

---

### 📅 agendamentos
```
┌─────────────────────────┐
│ agendamentos            │
├─────────────────────────┤
│ id (PK)                 │
│ cliente_id (FK)         │
│ data                    │
│ hora_inicio             │
│ hora_fim                │
│ tipo_sessao             │
│ status                  │
│ observacoes             │
│ servico_id (FK)         │ ← NOVO
│ valor_sessao            │ ← NOVO
│ status_presenca         │ ← NOVO
│ pago                    │ ← NOVO
│ nota_fiscal_emitida     │ ← NOVO
│ recorrencia_id          │ ← NOVO
│ reagendado_de_data      │ ← NOVO
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `clientes` (cliente_id)
- `N:1` com `servicos` (servico_id)
- `1:1` com `financeiro` (agendamento_id)
- `1:1` com `evolucoes` (agendamento_id)

**Constraints:**
- `tipo_sessao` IN ('individual', 'casal', 'grupo', 'familiar')
- `status` IN ('agendado', 'realizado', 'cancelado', 'falta', 'presente', 'falta_justificada', 'falta_cobrada', 'cancelado_terapeuta', 'cancelado_feriado')
- `status_presenca` IN ('P', 'F', 'FC', 'D', 'T', 'R')

**Agrupamento por recorrência:**
Agendamentos com mesmo `recorrencia_id` fazem parte da mesma série.

---

### 💰 financeiro
```
┌─────────────────────────┐
│ financeiro              │
├─────────────────────────┤
│ id (PK)                 │
│ cliente_id (FK)         │
│ agendamento_id (FK)     │
│ data                    │
│ valor                   │
│ pago                    │
│ forma_pagamento         │
│ observacoes             │
│ tipo_registro           │ ← NOVO
│ descricao               │ ← NOVO
│ meio_pagamento_id (FK)  │ ← NOVO
│ taxa_percentual         │ ← NOVO
│ valor_taxa              │ ← NOVO
│ valor_liquido           │ ← NOVO
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `clientes` (cliente_id)
- `N:1` com `agendamentos` (agendamento_id) [opcional]
- `N:1` com `meios_pagamento` (meio_pagamento_id)

**Constraints:**
- `tipo_registro` IN ('receita_sessao', 'receita_outra', 'despesa')

**Cálculo automático:**
```
valor_taxa = valor × (taxa_percentual / 100)
valor_liquido = valor - valor_taxa
```

---

### 📝 evolucoes
```
┌─────────────────────────┐
│ evolucoes               │
├─────────────────────────┤
│ id (PK)                 │
│ cliente_id (FK)         │
│ agendamento_id (FK)     │
│ data                    │
│ descricao               │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
```

**Relacionamentos:**
- `N:1` com `clientes` (cliente_id)
- `N:1` com `agendamentos` (agendamento_id) [opcional]

---

## Fluxos de Dados Principais

### 1. Criação de Agendamento Recorrente

```
1. Usuário cria agendamento recorrente
   ↓
2. Sistema gera recorrencia_id único (UUID)
   ↓
3. Sistema cria N agendamentos com:
   - Mesmo recorrencia_id
   - Datas sequenciais (semanal/quinzenal)
   - Mesmo servico_id
   - Mesmo valor_sessao
```

### 2. Cálculo de Valor de Sessão

```
1. Cliente tem servico_id = X
   ↓
2. Buscar servicos.valor_padrao do serviço X
   ↓
3. Se cliente tem valor_acordado, usar valor_acordado
   ↓
4. Ao criar agendamento, valor_sessao = valor definido
```

### 3. Registro Financeiro com Taxa

```
1. Sessão realizada com meio_pagamento_id = Y
   ↓
2. Buscar meios_pagamento.taxa_percentual do meio Y
   ↓
3. Calcular:
   valor_taxa = valor × (taxa_percentual / 100)
   valor_liquido = valor - valor_taxa
   ↓
4. Salvar no financeiro
```

### 4. Alteração de Valor do Cliente

```
1. Usuário altera valor_acordado de cliente
   ↓
2. Sistema cria registro em historico_valores_cliente:
   - valor_anterior = valor atual
   - valor_novo = novo valor
   - data_vigencia = data escolhida pelo usuário
   ↓
3. Atualizar clientes.valor_acordado
   ↓
4. Atualizar agendamentos.valor_sessao para agendamentos >= data_vigencia
```

---

## Índices Estratégicos

### Performance de Consultas

```sql
-- Buscar agendamentos de uma série
SELECT * FROM agendamentos WHERE recorrencia_id = ?
→ Usa: idx_agendamentos_recorrencia

-- Buscar agendamentos por serviço
SELECT * FROM agendamentos WHERE servico_id = ?
→ Usa: idx_agendamentos_servico

-- Filtrar clientes por tipo
SELECT * FROM clientes WHERE tipo_cliente = 'casal'
→ Usa: idx_clientes_tipo

-- Relatório financeiro por tipo
SELECT * FROM financeiro WHERE tipo_registro = 'despesa'
→ Usa: idx_financeiro_tipo

-- Histórico de um cliente
SELECT * FROM historico_valores_cliente WHERE cliente_id = ?
→ Usa: idx_historico_valores_cliente
```

---

## Observações Importantes

### ⚠️ Constraints de Integridade

1. **Cascata em DELETE:**
   - Deletar usuário → deleta configurações, serviços, meios de pagamento
   - Deletar cliente → deleta membros, históricos, agendamentos, financeiro, evoluções
   - Deletar serviço → define servico_id como NULL em clientes e agendamentos
   - Deletar meio de pagamento → define meio_pagamento_id como NULL em financeiro

2. **Campos Obrigatórios:**
   - clientes: nome, data_inicio
   - agendamentos: cliente_id, data, hora_inicio, hora_fim
   - financeiro: cliente_id, data, valor

3. **Valores Padrão:**
   - clientes.status = 'ativo'
   - clientes.tipo_cliente = 'individual'
   - clientes.tipo_cobranca = 'por_sessao'
   - agendamentos.status = 'agendado'
   - agendamentos.pago = FALSE
   - financeiro.tipo_registro = 'receita_sessao'

---

## Casos de Uso Especiais

### Cliente Casal com 2 Membros

```sql
-- Inserir cliente casal
INSERT INTO clientes (nome, data_inicio, tipo_cliente, servico_id)
VALUES ('João e Maria Silva', '2025-01-01', 'casal', 2);

-- Inserir membros
INSERT INTO clientes_membros (cliente_id, nome, cpf, papel)
VALUES
  (1, 'João Silva', '111.111.111-11', 'esposo'),
  (1, 'Maria Silva', '222.222.222-22', 'esposa');
```

### Série de Agendamentos Recorrentes

```sql
-- Gerar UUID para série
recorrencia_id = '550e8400-e29b-41d4-a716-446655440000'

-- Criar 10 agendamentos semanais
INSERT INTO agendamentos (cliente_id, data, hora_inicio, hora_fim,
                          servico_id, valor_sessao, recorrencia_id)
VALUES
  (1, '2025-01-06', '09:00', '10:00', 1, 200.00, recorrencia_id),
  (1, '2025-01-13', '09:00', '10:00', 1, 200.00, recorrencia_id),
  (1, '2025-01-20', '09:00', '10:00', 1, 200.00, recorrencia_id),
  -- ... até 10 agendamentos
```

### Despesa no Financeiro

```sql
INSERT INTO financeiro (cliente_id, data, valor, tipo_registro,
                        descricao, meio_pagamento_id)
VALUES (1, '2025-01-15', 500.00, 'despesa',
        'Aluguel do consultório', 1);
```

---

**Última atualização:** 2025-12-03
**Versão:** 2.0 - Fase 1
