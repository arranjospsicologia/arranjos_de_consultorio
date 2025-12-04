-- Schema para PostgreSQL/Supabase
-- Execute este script para criar as tabelas em um banco de dados real

-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    data_nascimento DATE,
    data_inicio DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'alta')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    tipo_sessao VARCHAR(50) DEFAULT 'individual' CHECK (tipo_sessao IN ('individual', 'casal', 'grupo', 'familiar')),
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado', 'falta')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela financeira
CREATE TABLE financeiro (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    forma_pagamento VARCHAR(50) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia', 'a_definir')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de evoluções clínicas
CREATE TABLE evolucoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_cliente ON agendamentos(cliente_id);
CREATE INDEX idx_financeiro_data ON financeiro(data);
CREATE INDEX idx_financeiro_cliente ON financeiro(cliente_id);
CREATE INDEX idx_evolucoes_cliente ON evolucoes(cliente_id);
CREATE INDEX idx_clientes_status ON clientes(status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_updated_at BEFORE UPDATE ON financeiro
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evolucoes_updated_at BEFORE UPDATE ON evolucoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views úteis para estatísticas

-- View de resumo mensal financeiro
CREATE VIEW resumo_financeiro_mensal AS
SELECT 
    DATE_TRUNC('month', data) as mes,
    COUNT(*) as total_sessoes,
    SUM(valor) as receita_total,
    SUM(CASE WHEN pago THEN valor ELSE 0 END) as receita_recebida,
    SUM(CASE WHEN NOT pago THEN valor ELSE 0 END) as receita_pendente
FROM financeiro
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- View de clientes ativos com estatísticas
CREATE VIEW clientes_estatisticas AS
SELECT 
    c.id,
    c.nome,
    c.status,
    COUNT(DISTINCT a.id) as total_sessoes,
    MAX(a.data) as ultima_sessao,
    SUM(f.valor) as total_pago
FROM clientes c
LEFT JOIN agendamentos a ON c.id = a.cliente_id
LEFT JOIN financeiro f ON c.id = f.cliente_id AND f.pago = TRUE
GROUP BY c.id, c.nome, c.status;

-- Inserir usuário admin padrão (senha: 123456)
-- Nota: A senha deve ser hasheada no backend antes de inserir
INSERT INTO usuarios (nome, email, senha_hash) VALUES
('Administrador', 'admin@arranjos.com', '$2a$10$8Z9Q3Z9Q3Z9Q3Z9Q3Z9Q3O');
