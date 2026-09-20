-- +goose Up
CREATE TABLE projetos_detalhes_chunks (
    id SERIAL PRIMARY KEY,
    projeto_id INT NOT NULL,
    content TEXT NOT NULL,
    header_path TEXT,
    ordem INT NOT NULL,
    pesquisa tsvector,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
);

CREATE INDEX idx_projetos_detalhes_chunks_projeto ON projetos_detalhes_chunks(projeto_id);
CREATE INDEX idx_projetos_detalhes_chunks_pesquisa ON projetos_detalhes_chunks USING GIN (pesquisa);

-- +goose Down
DROP INDEX IF EXISTS idx_projetos_detalhes_chunks_pesquisa;
DROP INDEX IF EXISTS idx_projetos_detalhes_chunks_projeto;
DROP TABLE IF EXISTS projetos_detalhes_chunks;
