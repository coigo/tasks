-- +goose Up
ALTER TABLE tarefas_situacoes ADD COLUMN cor VARCHAR(50) DEFAULT 'gray';

-- +goose Down
ALTER TABLE tarefas_situacoes DROP COLUMN cor;
