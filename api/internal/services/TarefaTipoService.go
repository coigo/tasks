package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
)

type TarefaTipoService struct {
	repository ports.ITarefaTipoRepository
}

func NewTarefaTipoService(repo ports.ITarefaTipoRepository) *TarefaTipoService {
	return &TarefaTipoService{repository: repo}
}

func (s *TarefaTipoService) Criar(ctx context.Context, descricao string) (*repository.TarefasTipo, error) {
	if descricao == "" {
		return nil, fmt.Errorf("descricao e obrigatoria")
	}
	tipo, err := s.repository.CreateTarefaTipo(ctx, descricao)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar tipo: %w", err)
	}
	return &tipo, nil
}

func (s *TarefaTipoService) BuscarPorId(ctx context.Context, id int32) (*repository.TarefasTipo, error) {
	tipo, err := s.repository.GetTarefaTipoById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("tipo nao encontrado: %w", err)
	}
	return &tipo, nil
}

func (s *TarefaTipoService) Listar(ctx context.Context) ([]repository.TarefasTipo, error) {
	return s.repository.ListTarefaTipos(ctx)
}

func (s *TarefaTipoService) Atualizar(ctx context.Context, id int32, descricao string) (*repository.TarefasTipo, error) {
	if descricao == "" {
		return nil, fmt.Errorf("descricao e obrigatoria")
	}
	tipo, err := s.repository.UpdateTarefaTipo(ctx, repository.UpdateTarefaTipoParams{
		ID:        id,
		Descricao: descricao,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar tipo: %w", err)
	}
	return &tipo, nil
}

func (s *TarefaTipoService) Remover(ctx context.Context, id int32) error {
	return s.repository.DeleteTarefaTipo(ctx, id)
}
