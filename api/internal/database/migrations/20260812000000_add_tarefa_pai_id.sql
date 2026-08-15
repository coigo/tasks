-- +goose Up
ALTER TABLE tarefas ADD COLUMN tarefa_pai_id INTEGER NULL;
ALTER TABLE tarefas ADD CONSTRAINT fk_tarefas_tarefa_pai
    FOREIGN KEY (tarefa_pai_id) REFERENCES tarefas(id) ON DELETE CASCADE;
CREATE INDEX idx_tarefas_tarefa_pai ON tarefas(tarefa_pai_id);

-- +goose Down
DROP INDEX IF EXISTS idx_tarefas_tarefa_pai;
ALTER TABLE tarefas DROP CONSTRAINT IF EXISTS fk_tarefas_tarefa_pai;
ALTER TABLE tarefas DROP COLUMN IF EXISTS tarefa_pai_id;
