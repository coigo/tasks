-- +goose Up
DROP TABLE IF EXISTS tarefas_movimentacoes;

ALTER TABLE tarefas DROP COLUMN IF EXISTS ultima_mov_em;

CREATE TABLE tarefas_historico (
    id SERIAL PRIMARY KEY,
    tarefa_id INT NOT NULL,
    campo VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_novo TEXT,
    criado_por_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_tarefas_historico_tarefa ON tarefas_historico(tarefa_id);

-- +goose Down
DROP INDEX IF EXISTS idx_tarefas_historico_tarefa;
DROP TABLE IF EXISTS tarefas_historico;
ALTER TABLE tarefas ADD COLUMN ultima_mov_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE tarefas_movimentacoes (
    id SERIAL PRIMARY KEY,
    tarefa_id INT NOT NULL,
    situacao_id INT NOT NULL,
    descricao TEXT,
    criado_por_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
    FOREIGN KEY (situacao_id) REFERENCES tarefas_situacoes(id),
    FOREIGN KEY (criado_por_id) REFERENCES usuarios(id)
);
