-- =====================================================
-- Schema Completo - Sistema de Arranjos de Consultório
-- =====================================================
-- Versão: 2.0 - Fase 1 Completa
-- Data: 2025-12-03
-- Descrição: Schema completo com todas as funcionalidades da Fase 1
-- =====================================================

-- =====================================================
-- TABELA: usuarios
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: configuracoes_usuario
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

-- =====================================================
-- TABELA: servicos
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

-- =====================================================
-- TABELA: meios_pagamento
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

-- =====================================================
-- TABELA: historico_taxas
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
-- TABELA: clientes
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_nascimento DATE,
    data_inicio DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'alta')),
    observacoes TEXT,

    -- Novos campos da Fase 1
    cpf VARCHAR(14),
    endereco TEXT,
    aniversario DATE, -- apenas mês/dia para alertas
    sexo VARCHAR(20) CHECK (sexo IN ('masculino', 'feminino', 'outro', 'não informado')),
    tipo_cliente VARCHAR(30) DEFAULT 'individual' CHECK (tipo_cliente IN ('individual', 'casal', 'família', 'grupo', 'outro')),
    servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
    valor_acordado DECIMAL(10, 2),
    tipo_cobranca VARCHAR(20) DEFAULT 'por_sessao' CHECK (tipo_cobranca IN ('por_sessao', 'fixo_mensal')),
    data_encerramento DATE, -- quando o cliente encerrou atendimentos

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: clientes_membros
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

-- =====================================================
-- TABELA: historico_valores_cliente
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

-- =====================================================
-- TABELA: agendamentos
-- =====================================================

CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_sessao VARCHAR(50) DEFAULT 'individual' CHECK (tipo_sessao IN ('individual', 'casal', 'grupo', 'familiar')),
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado', 'falta', 'presente', 'falta_justificada', 'falta_cobrada', 'cancelado_terapeuta', 'cancelado_feriado')),
    observacoes TEXT,

    -- Novos campos da Fase 1
    servico_id INTEGER REFERENCES servicos(id) ON DELETE SET NULL,
    valor_sessao DECIMAL(10, 2),
    status_presenca VARCHAR(5) CHECK (status_presenca IN ('P', 'F', 'FC', 'D', 'T', 'R')),
    -- P=Presente, F=Falta Justificada, FC=Falta Cobrada, D=Data Comemorativa, T=Cancelado Terapeuta, R=Reagendado
    pago BOOLEAN DEFAULT FALSE,
    nota_fiscal_emitida BOOLEAN DEFAULT FALSE,
    recorrencia_id VARCHAR(50), -- Identificador de grupo de recorrência
    reagendado_de_data DATE, -- Se foi reagendado, qual era a data original

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: financeiro
-- =====================================================

CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    forma_pagamento VARCHAR(50),
    observacoes TEXT,

    -- Novos campos da Fase 1
    tipo_registro VARCHAR(30) DEFAULT 'receita_sessao' CHECK (tipo_registro IN ('receita_sessao', 'receita_outra', 'despesa')),
    descricao VARCHAR(255),
    meio_pagamento_id INTEGER REFERENCES meios_pagamento(id) ON DELETE SET NULL,
    taxa_percentual DECIMAL(5, 2) DEFAULT 0.00,
    valor_taxa DECIMAL(10, 2) DEFAULT 0.00,
    valor_liquido DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: evolucoes
-- =====================================================

CREATE TABLE IF NOT EXISTS evolucoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================

-- Índices originais
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_data ON financeiro(data);
CREATE INDEX IF NOT EXISTS idx_financeiro_cliente ON financeiro(cliente_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_cliente ON evolucoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- Novos índices da Fase 1
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
-- FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_usuario_updated_at
BEFORE UPDATE ON configuracoes_usuario
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON servicos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meios_pagamento_updated_at
BEFORE UPDATE ON meios_pagamento
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON agendamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_updated_at
BEFORE UPDATE ON financeiro
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evolucoes_updated_at
BEFORE UPDATE ON evolucoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS ÚTEIS PARA ESTATÍSTICAS
-- =====================================================

-- View de resumo mensal financeiro
CREATE OR REPLACE VIEW resumo_financeiro_mensal AS
SELECT
    DATE_TRUNC('month', data) as mes,
    COUNT(*) as total_sessoes,
    SUM(valor) as receita_total,
    SUM(CASE WHEN pago THEN valor ELSE 0 END) as receita_recebida,
    SUM(CASE WHEN NOT pago THEN valor ELSE 0 END) as receita_pendente
FROM financeiro
WHERE tipo_registro = 'receita_sessao'
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- View de clientes ativos com estatísticas
CREATE OR REPLACE VIEW clientes_estatisticas AS
SELECT
    c.id,
    c.nome,
    c.status,
    COUNT(DISTINCT a.id) as total_sessoes,
    MAX(a.data) as ultima_sessao,
    SUM(CASE WHEN f.pago THEN f.valor ELSE 0 END) as total_pago
FROM clientes c
LEFT JOIN agendamentos a ON c.id = a.cliente_id
LEFT JOIN financeiro f ON c.id = f.cliente_id AND f.pago = TRUE
GROUP BY c.id, c.nome, c.status;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir usuário admin padrão (senha: 123456)
-- Nota: A senha deve ser hasheada no backend antes de inserir
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Administrador', 'admin@arranjos.com', '$2a$10$8Z9Q3Z9Q3Z9Q3Z9Q3Z9Q3O')
ON CONFLICT (email) DO NOTHING;

-- Inserir serviços padrão (assumindo usuário id=1)
INSERT INTO servicos (usuario_id, nome, duracao_minutos, valor_padrao, ordem) VALUES
(1, 'Atendimento Individual', 60, 200.00, 1),
(1, 'Atendimento de Casal', 75, 240.00, 2)
ON CONFLICT DO NOTHING;

-- Inserir meios de pagamento padrão (assumindo usuário id=1)
INSERT INTO meios_pagamento (usuario_id, nome, taxa_percentual) VALUES
(1, 'Dinheiro', 0.00),
(1, 'Pix', 0.00),
(1, 'Transferência', 0.00),
(1, 'Crédito', 4.50),
(1, 'Picpay', 3.99)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- =====================================================

COMMENT ON TABLE configuracoes_usuario IS 'Configurações personalizadas do usuário/consultório';
COMMENT ON TABLE servicos IS 'Catálogo de serviços oferecidos pelo consultório';
COMMENT ON TABLE meios_pagamento IS 'Meios de pagamento aceitos e suas taxas';
COMMENT ON TABLE historico_taxas IS 'Histórico de alterações de taxas de pagamento';
COMMENT ON TABLE clientes_membros IS 'Membros de clientes do tipo casal/família';
COMMENT ON TABLE historico_valores_cliente IS 'Histórico de alterações de valores acordados com clientes';

COMMENT ON COLUMN clientes.aniversario IS 'Apenas mês/dia para alertas de aniversário';
COMMENT ON COLUMN clientes.data_encerramento IS 'Data em que o cliente encerrou os atendimentos';
COMMENT ON COLUMN agendamentos.status_presenca IS 'P=Presente, F=Falta Justificada, FC=Falta Cobrada, D=Data Comemorativa, T=Cancelado Terapeuta, R=Reagendado';
COMMENT ON COLUMN agendamentos.recorrencia_id IS 'Identificador de grupo de recorrência';
COMMENT ON COLUMN agendamentos.reagendado_de_data IS 'Data original se o agendamento foi reagendado';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
