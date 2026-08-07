-- +goose Up
ALTER TABLE tarefas ADD COLUMN inicio_previsto DATE NULL;
ALTER TABLE tarefas ADD COLUMN prazo DATE NULL;

-- +goose Down
ALTER TABLE tarefas DROP COLUMN inicio_previsto;
ALTER TABLE tarefas DROP COLUMN prazo;
