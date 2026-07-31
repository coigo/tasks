-- +goose Up
-- Create usuarios table
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projetos table
CREATE TABLE projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletado_em TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tarefas_situacoes table
CREATE TABLE tarefas_situacoes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    encerra_tarefa BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tarefas_tipo table
CREATE TABLE tarefas_tipo (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tarefas table
CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    numero INT NOT NULL,
    ano INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    projeto_id INT NOT NULL,
    criado_por_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    situacao_id INT NOT NULL,
    tipo_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_mov_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (situacao_id) REFERENCES tarefas_situacoes(id),
    FOREIGN KEY (tipo_id) REFERENCES tarefas_tipo(id)
);

-- Create tarefas_movimentacoes table
CREATE TABLE tarefas_movimentacoes (
    id SERIAL PRIMARY KEY,
    tarefa_id INT NOT NULL,
    situacao_id INT NOT NULL,
    descricao TEXT,
    criado_por_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    FOREIGN KEY (situacao_id) REFERENCES tarefas_situacoes(id),
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
);

-- Create tarefas_anexos table
CREATE TABLE tarefas_anexos (
    id SERIAL PRIMARY KEY,
    tarefa_id INT NOT NULL,
    uuid VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    local VARCHAR(255) NOT NULL,
    tamanho BIGINT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX idx_tarefas_criado_por ON tarefas(criado_por_id);
CREATE INDEX idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX idx_tarefas_situacao ON tarefas(situacao_id);
CREATE INDEX idx_tarefas_tipo ON tarefas(tipo_id);
CREATE INDEX idx_tarefas_numero_ano ON tarefas(numero, ano);
CREATE INDEX idx_tarefas_movimentacoes_tarefa ON tarefas_movimentacoes(tarefa_id);
CREATE INDEX idx_tarefas_anexos_tarefa ON tarefas_anexos(tarefa_id);

-- +goose Down
-- Drop indexes
DROP INDEX IF EXISTS idx_tarefas_anexos_tarefa;
DROP INDEX IF EXISTS idx_tarefas_movimentacoes_tarefa;
DROP INDEX IF EXISTS idx_tarefas_numero_ano;
DROP INDEX IF EXISTS idx_tarefas_tipo;
DROP INDEX IF EXISTS idx_tarefas_situacao;
DROP INDEX IF EXISTS idx_tarefas_responsavel;
DROP INDEX IF EXISTS idx_tarefas_criado_por;
DROP INDEX IF EXISTS idx_tarefas_projeto;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS tarefas_anexos;
DROP TABLE IF EXISTS tarefas_movimentacoes;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS tarefas_tipo;
DROP TABLE IF EXISTS tarefas_situacoes;
DROP TABLE IF EXISTS projetos;
DROP TABLE IF EXISTS usuarios;
