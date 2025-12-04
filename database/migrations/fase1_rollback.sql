-- =====================================================
-- ROLLBACK FASE 1: BANCO DE DADOS E MODELOS
-- =====================================================
-- Data: 2025-12-03
-- Descrição: Script para reverter as alterações da Fase 1
-- ATENÇÃO: Este script remove dados! Use com cuidado!
-- =====================================================

-- IMPORTANTE: Fazer backup antes de executar este script!

BEGIN;

-- =====================================================
-- REMOVER ÍNDICES ADICIONAIS
-- =====================================================

DROP INDEX IF EXISTS idx_agendamentos_recorrencia;
DROP INDEX IF EXISTS idx_agendamentos_servico;
DROP INDEX IF EXISTS idx_clientes_servico;
DROP INDEX IF EXISTS idx_clientes_tipo;
DROP INDEX IF EXISTS idx_financeiro_tipo;
DROP INDEX IF EXISTS idx_financeiro_meio_pagamento;
DROP INDEX IF EXISTS idx_clientes_membros_cliente;
DROP INDEX IF EXISTS idx_historico_valores_cliente;
DROP INDEX IF EXISTS idx_historico_taxas_meio;

-- =====================================================
-- REMOVER CAMPOS ADICIONADOS À TABELA: financeiro
-- =====================================================

ALTER TABLE financeiro DROP COLUMN IF EXISTS tipo_registro CASCADE;
ALTER TABLE financeiro DROP COLUMN IF EXISTS descricao CASCADE;
ALTER TABLE financeiro DROP COLUMN IF EXISTS meio_pagamento_id CASCADE;
ALTER TABLE financeiro DROP COLUMN IF EXISTS taxa_percentual CASCADE;
ALTER TABLE financeiro DROP COLUMN IF EXISTS valor_taxa CASCADE;
ALTER TABLE financeiro DROP COLUMN IF EXISTS valor_liquido CASCADE;

-- Restaurar constraint antiga de forma_pagamento
ALTER TABLE financeiro DROP CONSTRAINT IF EXISTS financeiro_forma_pagamento_check;
ALTER TABLE financeiro ADD CONSTRAINT financeiro_forma_pagamento_check
CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia', 'a_definir'));

-- =====================================================
-- REMOVER CAMPOS ADICIONADOS À TABELA: agendamentos
-- =====================================================

ALTER TABLE agendamentos DROP COLUMN IF EXISTS servico_id CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS valor_sessao CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS status_presenca CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS pago CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS nota_fiscal_emitida CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS recorrencia_id CASCADE;
ALTER TABLE agendamentos DROP COLUMN IF EXISTS reagendado_de_data CASCADE;

-- Restaurar constraint antiga de status
ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_status_check
CHECK (status IN ('agendado', 'realizado', 'cancelado', 'falta'));

-- =====================================================
-- REMOVER TABELAS NOVAS
-- =====================================================

DROP TABLE IF EXISTS historico_valores_cliente CASCADE;
DROP TABLE IF EXISTS clientes_membros CASCADE;
DROP TABLE IF EXISTS historico_taxas CASCADE;
DROP TABLE IF EXISTS meios_pagamento CASCADE;
DROP TABLE IF EXISTS servicos CASCADE;
DROP TABLE IF EXISTS configuracoes_usuario CASCADE;

-- =====================================================
-- REMOVER CAMPOS ADICIONADOS À TABELA: clientes
-- =====================================================

ALTER TABLE clientes DROP COLUMN IF EXISTS cpf CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS endereco CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS aniversario CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS sexo CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS tipo_cliente CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS servico_id CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS valor_acordado CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS tipo_cobranca CASCADE;
ALTER TABLE clientes DROP COLUMN IF EXISTS data_encerramento CASCADE;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Rollback da Fase 1 concluído!';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'As seguintes tabelas foram removidas:';
    RAISE NOTICE '- configuracoes_usuario';
    RAISE NOTICE '- servicos';
    RAISE NOTICE '- meios_pagamento';
    RAISE NOTICE '- historico_taxas';
    RAISE NOTICE '- clientes_membros';
    RAISE NOTICE '- historico_valores_cliente';
    RAISE NOTICE '';
    RAISE NOTICE 'Os campos adicionados às tabelas existentes foram removidos.';
    RAISE NOTICE '====================================';
END $$;

-- Confirmar transação
COMMIT;

-- Se houver algum erro, desfazer tudo
-- ROLLBACK;
