-- +goose Up
ALTER TABLE tarefas ADD COLUMN pesquisa tsvector;
CREATE INDEX idx_tarefas_pesquisa ON tarefas USING GIN (pesquisa);

-- +goose Down
DROP INDEX IF EXISTS idx_tarefas_pesquisa;
ALTER TABLE tarefas DROP COLUMN IF EXISTS pesquisa;
