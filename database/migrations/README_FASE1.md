# Migração Fase 1 - Banco de Dados e Modelos

## Resumo

Esta migração implementa a **Fase 1** do PROJETO-ALTERAR.md, reestruturando o banco de dados para suportar todas as funcionalidades planejadas do sistema.

## Data

**Criada em:** 2025-12-03
**Versão:** 1.0
**Status:** Pronta para execução

---

## O que esta migração faz?

### Novas Tabelas

1. **configuracoes_usuario**
   - Configurações de exibição da agenda (intervalos, dias, horários)
   - Dados pessoais (nome completo, CRP)
   - Dados bancários (banco, agência, conta, CPF/CNPJ)

2. **servicos**
   - Catálogo de serviços oferecidos
   - Duração e valor padrão de cada serviço
   - Ordem de exibição

3. **meios_pagamento**
   - Meios de pagamento aceitos
   - Taxas percentuais por meio

4. **historico_taxas**
   - Histórico de alterações de taxas
   - Data de vigência

5. **clientes_membros**
   - Membros de clientes tipo casal/família
   - Dados de cada membro

6. **historico_valores_cliente**
   - Histórico de alterações de valores acordados
   - Data de vigência e motivo

### Alterações em Tabelas Existentes

#### Tabela: clientes
- `cpf` - CPF do cliente
- `endereco` - Endereço completo
- `aniversario` - Data de aniversário (apenas mês/dia)
- `sexo` - Sexo do cliente
- `tipo_cliente` - Individual, casal, família, grupo, outro
- `servico_id` - Referência ao serviço padrão
- `valor_acordado` - Valor acordado com o cliente
- `tipo_cobranca` - Por sessão ou fixo mensal
- `data_encerramento` - Data de encerramento do atendimento

#### Tabela: agendamentos
- `servico_id` - Referência ao serviço
- `valor_sessao` - Valor da sessão
- `status_presenca` - P, F, FC, D, T, R (Presente, Falta Justificada, etc.)
- `pago` - Se a sessão foi paga
- `nota_fiscal_emitida` - Se a NF foi emitida
- `recorrencia_id` - Identificador de grupo de recorrência
- `reagendado_de_data` - Data original se foi reagendado

#### Tabela: financeiro
- `tipo_registro` - Receita de sessão, outra receita, ou despesa
- `descricao` - Descrição do registro
- `meio_pagamento_id` - Referência ao meio de pagamento
- `taxa_percentual` - Taxa aplicada
- `valor_taxa` - Valor da taxa calculado
- `valor_liquido` - Valor líquido após taxa

### Novos Índices

Índices adicionados para melhorar a performance:
- `idx_agendamentos_recorrencia`
- `idx_agendamentos_servico`
- `idx_clientes_servico`
- `idx_clientes_tipo`
- `idx_financeiro_tipo`
- `idx_financeiro_meio_pagamento`
- `idx_clientes_membros_cliente`
- `idx_historico_valores_cliente`
- `idx_historico_taxas_meio`

---

## Pré-requisitos

- PostgreSQL 12 ou superior
- Backup completo do banco de dados atual
- Acesso de superusuário ao banco de dados

---

## Instruções de Execução

### 1. Fazer Backup (OBRIGATÓRIO!)

```bash
# Backup completo do banco de dados
pg_dump -U seu_usuario -d arranjos_consultorio -F c -b -v -f backup_antes_fase1_$(date +%Y%m%d_%H%M%S).backup

# OU backup em formato SQL
pg_dump -U seu_usuario -d arranjos_consultorio > backup_antes_fase1_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Executar a Migração

**Opção A: Via psql (recomendado)**

```bash
psql -U seu_usuario -d arranjos_consultorio -f database/migrations/fase1_banco_dados_modelos.sql
```

**Opção B: Via cliente GUI (pgAdmin, DBeaver, etc.)**

1. Abra o arquivo `fase1_banco_dados_modelos.sql`
2. Conecte ao banco de dados
3. Execute o script completo
4. Verifique as mensagens de sucesso

### 3. Verificar a Execução

Ao final da execução, você deve ver mensagens como:

```
NOTICE:  ====================================
NOTICE:  VERIFICAÇÃO DAS TABELAS CRIADAS:
NOTICE:  ====================================
NOTICE:  ✓ Tabela configuracoes_usuario criada com sucesso
NOTICE:  ✓ Tabela servicos criada com sucesso
NOTICE:  ✓ Tabela meios_pagamento criada com sucesso
NOTICE:  ✓ Tabela historico_taxas criada com sucesso
NOTICE:  ✓ Tabela clientes_membros criada com sucesso
NOTICE:  ✓ Tabela historico_valores_cliente criada com sucesso
NOTICE:  ====================================
NOTICE:  Migração Fase 1 concluída!
NOTICE:  ====================================
```

### 4. Testar o Banco de Dados

Execute estas queries para verificar:

```sql
-- Verificar novas tabelas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('configuracoes_usuario', 'servicos', 'meios_pagamento',
                    'historico_taxas', 'clientes_membros', 'historico_valores_cliente');

-- Verificar novos campos em clientes
SELECT column_name FROM information_schema.columns
WHERE table_name = 'clientes'
AND column_name IN ('cpf', 'endereco', 'aniversario', 'sexo', 'tipo_cliente',
                     'servico_id', 'valor_acordado', 'tipo_cobranca', 'data_encerramento');

-- Verificar serviços padrão
SELECT * FROM servicos;

-- Verificar meios de pagamento padrão
SELECT * FROM meios_pagamento;
```

---

## Dados Padrão Inseridos

### Serviços (para usuário id=1)
- Atendimento Individual (60 min, R$ 200,00)
- Atendimento de Casal (75 min, R$ 240,00)

### Meios de Pagamento (para usuário id=1)
- Dinheiro (0% taxa)
- Pix (0% taxa)
- Transferência (0% taxa)
- Crédito (4.50% taxa)
- Picpay (3.99% taxa)

---

## Rollback (Reverter Migração)

**⚠️ ATENÇÃO: O rollback remove todas as alterações e DADOS criados pela migração!**

Se precisar reverter a migração:

```bash
psql -U seu_usuario -d arranjos_consultorio -f database/migrations/fase1_rollback.sql
```

---

## Próximos Passos

Após executar esta migração com sucesso:

1. ✅ Atualizar o arquivo `database/schema.sql` com a versão atualizada
2. ⏭️ Seguir para **Fase 2**: Sistema de Configurações
3. ⏭️ Implementar rotas backend para as novas tabelas
4. ⏭️ Criar componentes frontend para utilizar as novas funcionalidades

---

## Troubleshooting

### Erro: "column already exists"

Se você já executou parte da migração anteriormente, os comandos `IF NOT EXISTS` e `DO $$` garantem que não haverá erros. A migração pode ser executada múltiplas vezes com segurança.

### Erro: "relation does not exist"

Certifique-se de que o schema original foi executado primeiro:

```bash
psql -U seu_usuario -d arranjos_consultorio -f database/schema.sql
```

### Erro de permissões

Certifique-se de ter privilégios suficientes:

```sql
GRANT ALL PRIVILEGES ON DATABASE arranjos_consultorio TO seu_usuario;
```

---

## Suporte

Em caso de problemas:

1. Verifique os logs do PostgreSQL
2. Execute o rollback se necessário
3. Restaure o backup
4. Revise o arquivo de migração

---

## Checklist de Execução

- [ ] Backup do banco de dados realizado
- [ ] Backup testado e validado
- [ ] Ambiente de desenvolvimento testado primeiro
- [ ] Migração executada com sucesso
- [ ] Verificações pós-migração realizadas
- [ ] Testes de integridade executados
- [ ] Documentação atualizada
- [ ] Equipe notificada das mudanças

---

**Última atualização:** 2025-12-03
**Autor:** Claude Code
**Versão:** 1.0
