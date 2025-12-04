-- =====================================================
-- MIGRAÇÃO FASE 1: BANCO DE DADOS E MODELOS
-- =====================================================
-- Data: 2025-12-03
-- Descrição: Reestruturação do banco de dados para suportar
--            todas as funcionalidades do sistema
-- =====================================================

-- IMPORTANTE: Fazer backup antes de executar este script!

-- =====================================================
-- 1.1 - TABELA: configuracoes_usuario
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracoes_usuario (
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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_usuario_updated_at
BEFORE UPDATE ON configuracoes_usuario
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 1.2 - TABELA: servicos
-- =====================================================

CREATE TABLE IF NOT EXISTS servicos (
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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON servicos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir serviços padrão (para usuário id=1)
INSERT INTO servicos (usuario_id, nome, duracao_minutos, valor_padrao, ordem) VALUES
(1, 'Atendimento Individual', 60, 200.00, 1),
(1, 'Atendimento de Casal', 75, 240.00, 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 1.3 - TABELA: meios_pagamento
-- =====================================================

CREATE TABLE IF NOT EXISTS meios_pagamento (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    taxa_percentual DECIMAL(5, 2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_meios_pagamento_updated_at
BEFORE UPDATE ON meios_pagamento
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir meios de pagamento padrão (para usuário id=1)
INSERT INTO meios_pagamento (usuario_id, nome, taxa_percentual) VALUES
(1, 'Dinheiro', 0.00),
(1, 'Pix', 0.00),
(1, 'Transferência', 0.00),
(1, 'Crédito', 4.50),
(1, 'Picpay', 3.99)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 1.4 - TABELA: historico_taxas
-- =====================================================

CREATE TABLE IF NOT EXISTS historico_taxas (
    id SERIAL PRIMARY KEY,
    meio_pagamento_id INTEGER REFERENCES meios_pagamento(id) ON DELETE CASCADE,
    taxa_anterior DECIMAL(5, 2),
    taxa_nova DECIMAL(5, 2),
    data_vigencia DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 1.5 - ALTERAÇÕES NA TABELA: clientes
-- =====================================================

-- Adicionar novos campos à tabela clientes
DO $$
BEGIN
    -- CPF
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='cpf') THEN
        ALTER TABLE clientes ADD COLUMN cpf VARCHAR(14);
    END IF;

    -- Endereço
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='endereco') THEN
        ALTER TABLE clientes ADD COLUMN endereco TEXT;
    END IF;

    -- Aniversário
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='aniversario') THEN
        ALTER TABLE clientes ADD COLUMN aniversario DATE;
        COMMENT ON COLUMN clientes.aniversario IS 'Apenas mês/dia para alertas de aniversário';
    END IF;

    -- Sexo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='sexo') THEN
        ALTER TABLE clientes ADD COLUMN sexo VARCHAR(20)
        CHECK (sexo IN ('masculino', 'feminino', 'outro', 'não informado'));
    END IF;

    -- Tipo de Cliente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='tipo_cliente') THEN
        ALTER TABLE clientes ADD COLUMN tipo_cliente VARCHAR(30) DEFAULT 'individual'
        CHECK (tipo_cliente IN ('individual', 'casal', 'família', 'grupo', 'outro'));
    END IF;

    -- Serviço ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='servico_id') THEN
        ALTER TABLE clientes ADD COLUMN servico_id INTEGER
        REFERENCES servicos(id) ON DELETE SET NULL;
    END IF;

    -- Valor Acordado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='valor_acordado') THEN
        ALTER TABLE clientes ADD COLUMN valor_acordado DECIMAL(10, 2);
    END IF;

    -- Tipo de Cobrança
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='tipo_cobranca') THEN
        ALTER TABLE clientes ADD COLUMN tipo_cobranca VARCHAR(20) DEFAULT 'por_sessao'
        CHECK (tipo_cobranca IN ('por_sessao', 'fixo_mensal'));
    END IF;

    -- Data de Encerramento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='clientes' AND column_name='data_encerramento') THEN
        ALTER TABLE clientes ADD COLUMN data_encerramento DATE;
        COMMENT ON COLUMN clientes.data_encerramento IS 'Data em que o cliente encerrou os atendimentos';
    END IF;
END $$;

-- =====================================================
-- 1.6 - TABELA: clientes_membros
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes_membros (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    email VARCHAR(255),
    papel VARCHAR(50), -- ex: "esposo", "esposa", "filho", etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE clientes_membros IS 'Membros de clientes do tipo casal/família';

-- =====================================================
-- 1.7 - TABELA: historico_valores_cliente
-- =====================================================

CREATE TABLE IF NOT EXISTS historico_valores_cliente (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    valor_anterior DECIMAL(10, 2),
    valor_novo DECIMAL(10, 2),
    data_vigencia DATE NOT NULL,
    motivo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE historico_valores_cliente IS 'Histórico de alterações de valores acordados com clientes';

-- =====================================================
-- 1.8 - ALTERAÇÕES NA TABELA: agendamentos
-- =====================================================

-- Remover constraint antiga de status se existir
DO $$
BEGIN
    ALTER TABLE agendamentos DROP CONSTRAINT IF EXISTS agendamentos_status_check;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Adicionar novos campos à tabela agendamentos
DO $$
BEGIN
    -- Serviço ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='servico_id') THEN
        ALTER TABLE agendamentos ADD COLUMN servico_id INTEGER
        REFERENCES servicos(id) ON DELETE SET NULL;
    END IF;

    -- Valor da Sessão
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='valor_sessao') THEN
        ALTER TABLE agendamentos ADD COLUMN valor_sessao DECIMAL(10, 2);
    END IF;

    -- Status de Presença
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='status_presenca') THEN
        ALTER TABLE agendamentos ADD COLUMN status_presenca VARCHAR(5)
        CHECK (status_presenca IN ('P', 'F', 'FC', 'D', 'T', 'R'));
        COMMENT ON COLUMN agendamentos.status_presenca IS 'P=Presente, F=Falta Justificada, FC=Falta Cobrada, D=Data Comemorativa, T=Cancelado Terapeuta, R=Reagendado';
    END IF;

    -- Pago
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='pago') THEN
        ALTER TABLE agendamentos ADD COLUMN pago BOOLEAN DEFAULT FALSE;
    END IF;

    -- Nota Fiscal Emitida
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='nota_fiscal_emitida') THEN
        ALTER TABLE agendamentos ADD COLUMN nota_fiscal_emitida BOOLEAN DEFAULT FALSE;
    END IF;

    -- Recorrência ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='recorrencia_id') THEN
        ALTER TABLE agendamentos ADD COLUMN recorrencia_id VARCHAR(50);
        COMMENT ON COLUMN agendamentos.recorrencia_id IS 'Identificador de grupo de recorrência';
    END IF;

    -- Reagendado De Data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='agendamentos' AND column_name='reagendado_de_data') THEN
        ALTER TABLE agendamentos ADD COLUMN reagendado_de_data DATE;
        COMMENT ON COLUMN agendamentos.reagendado_de_data IS 'Data original se o agendamento foi reagendado';
    END IF;
END $$;

-- Atualizar constraint de status com novos valores
ALTER TABLE agendamentos ADD CONSTRAINT agendamentos_status_check
CHECK (status IN ('agendado', 'realizado', 'cancelado', 'presente',
                   'falta_justificada', 'falta_cobrada', 'cancelado_terapeuta',
                   'cancelado_feriado'));

-- =====================================================
-- 1.9 - ALTERAÇÕES NA TABELA: financeiro
-- =====================================================

-- Remover constraint antiga de forma_pagamento se existir
DO $$
BEGIN
    ALTER TABLE financeiro DROP CONSTRAINT IF EXISTS financeiro_forma_pagamento_check;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Adicionar novos campos à tabela financeiro
DO $$
BEGIN
    -- Tipo de Registro
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='tipo_registro') THEN
        ALTER TABLE financeiro ADD COLUMN tipo_registro VARCHAR(30) DEFAULT 'receita_sessao'
        CHECK (tipo_registro IN ('receita_sessao', 'receita_outra', 'despesa'));
    END IF;

    -- Descrição
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='descricao') THEN
        ALTER TABLE financeiro ADD COLUMN descricao VARCHAR(255);
    END IF;

    -- Meio de Pagamento ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='meio_pagamento_id') THEN
        ALTER TABLE financeiro ADD COLUMN meio_pagamento_id INTEGER
        REFERENCES meios_pagamento(id) ON DELETE SET NULL;
    END IF;

    -- Taxa Percentual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='taxa_percentual') THEN
        ALTER TABLE financeiro ADD COLUMN taxa_percentual DECIMAL(5, 2) DEFAULT 0.00;
    END IF;

    -- Valor da Taxa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='valor_taxa') THEN
        ALTER TABLE financeiro ADD COLUMN valor_taxa DECIMAL(10, 2) DEFAULT 0.00;
    END IF;

    -- Valor Líquido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='financeiro' AND column_name='valor_liquido') THEN
        ALTER TABLE financeiro ADD COLUMN valor_liquido DECIMAL(10, 2);
    END IF;
END $$;

-- =====================================================
-- 1.10 - ÍNDICES ADICIONAIS
-- =====================================================

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_recorrencia ON agendamentos(recorrencia_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON agendamentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_clientes_servico ON clientes(servico_id);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes(tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo ON financeiro(tipo_registro);
CREATE INDEX IF NOT EXISTS idx_financeiro_meio_pagamento ON financeiro(meio_pagamento_id);
CREATE INDEX IF NOT EXISTS idx_clientes_membros_cliente ON clientes_membros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_valores_cliente ON historico_valores_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_historico_taxas_meio ON historico_taxas(meio_pagamento_id);

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 1
-- =====================================================

-- Verificar se as tabelas foram criadas
DO $$
DECLARE
    tabelas_criadas TEXT[];
    tabela TEXT;
BEGIN
    tabelas_criadas := ARRAY[
        'configuracoes_usuario',
        'servicos',
        'meios_pagamento',
        'historico_taxas',
        'clientes_membros',
        'historico_valores_cliente'
    ];

    RAISE NOTICE '====================================';
    RAISE NOTICE 'VERIFICAÇÃO DAS TABELAS CRIADAS:';
    RAISE NOTICE '====================================';

    FOREACH tabela IN ARRAY tabelas_criadas
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables
                   WHERE table_name = tabela) THEN
            RAISE NOTICE '✓ Tabela % criada com sucesso', tabela;
        ELSE
            RAISE NOTICE '✗ ERRO: Tabela % não foi criada', tabela;
        END IF;
    END LOOP;

    RAISE NOTICE '====================================';
    RAISE NOTICE 'Migração Fase 1 concluída!';
    RAISE NOTICE '====================================';
END $$;
