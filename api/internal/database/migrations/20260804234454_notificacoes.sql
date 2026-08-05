-- +goose Up
ALTER TABLE usuarios
    ADD COLUMN notificacoes JSONB DEFAULT '[]'::JSONB;

-- +goose Down
ALTER TABLE usuarios
    DROP COLUMN notificacoes;
