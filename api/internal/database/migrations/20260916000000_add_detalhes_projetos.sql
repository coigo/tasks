-- +goose Up
ALTER TABLE projetos ADD COLUMN IF NOT EXISTS detalhes TEXT;

-- +goose Down
ALTER TABLE projetos DROP COLUMN IF EXISTS detalhes;