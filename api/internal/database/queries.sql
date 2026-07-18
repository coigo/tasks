-- name: GetProjeto :one
SELECT * FROM projetos
WHERE id = $1 limit 1;