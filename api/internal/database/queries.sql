-- name: GetUsuarioByEmail :one
SELECT id, nome, email, senha, created_at, updated_at FROM usuarios
WHERE email = $1 limit 1;

-- name: GetUsuarioById :one
SELECT id, nome, email, senha, created_at, updated_at FROM usuarios
WHERE id = $1 limit 1;

-- name: ListUsuarios :many
SELECT id, nome, email, created_at, updated_at FROM usuarios
ORDER BY nome;

-- name: CreateUsuario :one
INSERT INTO usuarios (nome, email, senha)
VALUES ($1, $2, $3)
RETURNING id, nome, email, created_at, updated_at;

-- name: UpdateUsuario :one
UPDATE usuarios
SET nome = sqlc.arg(nome),
    email = sqlc.arg(email),
    senha = COALESCE(NULLIF(sqlc.arg(senha), ''), senha),
    updated_at = CURRENT_TIMESTAMP
WHERE id = sqlc.arg(id)
RETURNING id, nome, email, created_at, updated_at;

-- name: DeleteUsuario :exec
DELETE FROM usuarios WHERE id = $1;

-- name: GetProjetoById :one
SELECT id, nome, criado_em, deletado_em, created_at, updated_at FROM projetos
WHERE id = $1 limit 1;

-- name: ListProjetos :many
SELECT id, nome, criado_em, deletado_em, created_at, updated_at FROM projetos
WHERE deletado_em IS NULL
ORDER BY nome;

-- name: CreateProjeto :one
INSERT INTO projetos (nome)
VALUES ($1)
RETURNING id, nome, criado_em, deletado_em, created_at, updated_at;

-- name: UpdateProjeto :one
UPDATE projetos
SET nome = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, nome, criado_em, deletado_em, created_at, updated_at;

-- name: DeleteProjeto :exec
UPDATE projetos
SET deletado_em = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: GetTarefaSituacaoById :one
SELECT id, descricao, encerra_tarefa, criado_em, created_at, updated_at FROM tarefas_situacoes
WHERE id = $1 limit 1;

-- name: ListTarefaSituacoes :many
SELECT id, descricao, encerra_tarefa, criado_em, created_at, updated_at FROM tarefas_situacoes
ORDER BY descricao;

-- name: CreateTarefaSituacao :one
INSERT INTO tarefas_situacoes (descricao, encerra_tarefa)
VALUES ($1, $2)
RETURNING id, descricao, encerra_tarefa, criado_em, created_at, updated_at;

-- name: UpdateTarefaSituacao :one
UPDATE tarefas_situacoes
SET descricao = $2,
    encerra_tarefa = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, descricao, encerra_tarefa, criado_em, created_at, updated_at;

-- name: DeleteTarefaSituacao :exec
DELETE FROM tarefas_situacoes WHERE id = $1;

-- name: GetTarefaTipoById :one
SELECT id, descricao, criado_em, created_at, updated_at FROM tarefas_tipo
WHERE id = $1 limit 1;

-- name: ListTarefaTipos :many
SELECT id, descricao, criado_em, created_at, updated_at FROM tarefas_tipo
ORDER BY descricao;

-- name: CreateTarefaTipo :one
INSERT INTO tarefas_tipo (descricao)
VALUES ($1)
RETURNING id, descricao, criado_em, created_at, updated_at;

-- name: UpdateTarefaTipo :one
UPDATE tarefas_tipo
SET descricao = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, descricao, criado_em, created_at, updated_at;

-- name: DeleteTarefaTipo :exec
DELETE FROM tarefas_tipo WHERE id = $1;

-- name: GetMaxNumeroTarefaByAno :one
SELECT COALESCE(MAX(numero), 0) FROM tarefas WHERE ano = $1;

-- name: CreateTarefa :one
INSERT INTO tarefas (
    numero, ano, titulo, descricao, projeto_id,
    criado_por_id, responsavel_id, situacao_id, tipo_id
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, numero, ano, titulo, descricao, projeto_id, criado_por_id, responsavel_id, situacao_id, tipo_id, criado_em, ultima_mov_em, created_at, updated_at;

-- name: GetTarefaById :one
SELECT t.id, t.numero, t.ano, t.titulo, t.descricao, t.projeto_id,
       t.criado_por_id, t.responsavel_id, t.situacao_id, t.tipo_id,
       t.criado_em, t.ultima_mov_em, t.created_at, t.updated_at,
       p.nome AS projeto_nome,
       u_criado.nome AS criado_por_nome,
       u_resp.nome AS responsavel_nome,
       s.descricao AS situacao_descricao,
       s.encerra_tarefa AS situacao_encerra_tarefa,
       tp.descricao AS tipo_descricao
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id
JOIN usuarios u_criado ON u_criado.id = t.criado_por_id
JOIN usuarios u_resp ON u_resp.id = t.responsavel_id
JOIN tarefas_situacoes s ON s.id = t.situacao_id
JOIN tarefas_tipo tp ON tp.id = t.tipo_id
WHERE t.id = $1 limit 1;

-- name: ListTarefas :many
SELECT t.id, t.numero, t.ano, t.titulo, t.descricao, t.projeto_id,
       t.criado_por_id, t.responsavel_id, t.situacao_id, t.tipo_id,
       t.criado_em, t.ultima_mov_em, t.created_at, t.updated_at,
       p.nome AS projeto_nome,
       u_criado.nome AS criado_por_nome,
       u_resp.nome AS responsavel_nome,
       s.descricao AS situacao_descricao,
       s.encerra_tarefa AS situacao_encerra_tarefa,
       tp.descricao AS tipo_descricao
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id
JOIN usuarios u_criado ON u_criado.id = t.criado_por_id
JOIN usuarios u_resp ON u_resp.id = t.responsavel_id
JOIN tarefas_situacoes s ON s.id = t.situacao_id
JOIN tarefas_tipo tp ON tp.id = t.tipo_id
WHERE (sqlc.arg(responsavel_id) = 0 OR t.responsavel_id = sqlc.arg(responsavel_id))
  AND (sqlc.arg(situacao_id) = 0 OR t.situacao_id = sqlc.arg(situacao_id))
  AND (sqlc.arg(tipo_id) = 0 OR t.tipo_id = sqlc.arg(tipo_id))
  AND (sqlc.arg(projeto_id) = 0 OR t.projeto_id = sqlc.arg(projeto_id))
  AND (sqlc.arg(busca) = '' OR t.titulo ILIKE '%' || sqlc.arg(busca) || '%' OR t.descricao ILIKE '%' || sqlc.arg(busca) || '%')
  AND (sqlc.arg(incluir_encerradas) = TRUE OR s.encerra_tarefa = FALSE)
ORDER BY t.ultima_mov_em DESC, t.id DESC;

-- name: UpdateTarefa :one
UPDATE tarefas
SET titulo = $2,
    descricao = $3,
    projeto_id = $4,
    responsavel_id = $5,
    situacao_id = $6,
    tipo_id = $7,
    ultima_mov_em = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, numero, ano, titulo, descricao, projeto_id, criado_por_id, responsavel_id, situacao_id, tipo_id, criado_em, ultima_mov_em, created_at, updated_at;

-- name: UpdateSituacaoTarefa :exec
UPDATE tarefas
SET situacao_id = $2,
    ultima_mov_em = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1;

-- name: DeleteTarefa :exec
DELETE FROM tarefas WHERE id = $1;

-- name: CountTarefasBySituacao :many
SELECT s.id, s.descricao, s.encerra_tarefa, COUNT(t.id) AS total
FROM tarefas_situacoes s
LEFT JOIN tarefas t ON t.situacao_id = s.id
GROUP BY s.id, s.descricao, s.encerra_tarefa
ORDER BY s.descricao;

-- name: CountTarefasByTipo :many
SELECT tp.id, tp.descricao, COUNT(t.id) AS total
FROM tarefas_tipo tp
LEFT JOIN tarefas t ON t.tipo_id = tp.id
GROUP BY tp.id, tp.descricao
ORDER BY tp.descricao;

-- name: CountTarefasResponsavel :many
SELECT u.id, u.nome, COUNT(t.id) AS total
FROM usuarios u
LEFT JOIN tarefas t ON t.responsavel_id = u.id
GROUP BY u.id, u.nome
ORDER BY u.nome;

-- name: CreateTarefaMovimentacao :one
INSERT INTO tarefas_movimentacoes (tarefa_id, situacao_id, descricao, criado_por_id)
VALUES ($1, $2, $3, $4)
RETURNING id, tarefa_id, situacao_id, descricao, criado_por_id, criado_em, created_at, updated_at;

-- name: GetTarefaMovimentacaoById :one
SELECT id, tarefa_id, situacao_id, descricao, criado_por_id, criado_em, created_at, updated_at FROM tarefas_movimentacoes
WHERE id = $1 limit 1;

-- name: ListTarefaMovimentacoesByTarefa :many
SELECT m.id, m.tarefa_id, m.situacao_id, m.descricao, m.criado_por_id, m.criado_em, m.created_at, m.updated_at,
       s.descricao AS situacao_descricao,
       u.nome AS criado_por_nome
FROM tarefas_movimentacoes m
JOIN tarefas_situacoes s ON s.id = m.situacao_id
JOIN usuarios u ON u.id = m.criado_por_id
WHERE m.tarefa_id = $1
ORDER BY m.criado_em DESC;

-- name: UpdateTarefaMovimentacao :one
UPDATE tarefas_movimentacoes
SET descricao = $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id, tarefa_id, situacao_id, descricao, criado_por_id, criado_em, created_at, updated_at;

-- name: DeleteTarefaMovimentacao :exec
DELETE FROM tarefas_movimentacoes WHERE id = $1;

-- name: CreateTarefaAnexo :one
INSERT INTO tarefas_anexos (tarefa_id, uuid, nome, local, tamanho)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, tarefa_id, uuid, nome, local, tamanho, criado_em, created_at, updated_at;

-- name: ListTarefaAnexosByTarefa :many
SELECT id, tarefa_id, uuid, nome, local, tamanho, criado_em, created_at, updated_at FROM tarefas_anexos
WHERE tarefa_id = $1
ORDER BY criado_em DESC;

-- name: GetTarefaAnexoById :one
SELECT id, tarefa_id, uuid, nome, local, tamanho, criado_em, created_at, updated_at FROM tarefas_anexos
WHERE id = $1 limit 1;

-- name: DeleteTarefaAnexo :exec
DELETE FROM tarefas_anexos WHERE id = $1;

-- name: ListTarefasMovimentadasNoPeriodo :many
SELECT DISTINCT t.id, t.numero, t.ano, t.titulo, t.descricao, t.projeto_id,
       t.criado_por_id, t.responsavel_id, t.situacao_id, t.tipo_id,
       t.criado_em, t.ultima_mov_em, t.created_at, t.updated_at,
       p.nome AS projeto_nome,
       u_criado.nome AS criado_por_nome,
       u_resp.nome AS responsavel_nome,
       s.descricao AS situacao_descricao,
       s.encerra_tarefa AS situacao_encerra_tarefa,
       tp.descricao AS tipo_descricao
FROM tarefas t
JOIN projetos p ON p.id = t.projeto_id
JOIN usuarios u_criado ON u_criado.id = t.criado_por_id
JOIN usuarios u_resp ON u_resp.id = t.responsavel_id
JOIN tarefas_situacoes s ON s.id = t.situacao_id
JOIN tarefas_tipo tp ON tp.id = t.tipo_id
JOIN tarefas_movimentacoes m ON m.tarefa_id = t.id
WHERE m.criado_em BETWEEN sqlc.arg(data_inicio) AND sqlc.arg(data_fim)
  AND (sqlc.arg(responsavel_id) = 0 OR t.responsavel_id = sqlc.arg(responsavel_id))
ORDER BY t.ultima_mov_em DESC;
