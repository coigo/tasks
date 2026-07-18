package ports

import (
	"context"
	"tasks/internal/repository"
)

type IProjetoRepository interface {
	GetProjeto(ctx context.Context, id int32 ) (repository.Projeto, error)
}