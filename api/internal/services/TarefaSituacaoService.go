package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"

	"github.com/jackc/pgx/v5/pgtype"
)

type TarefaSituacaoService struct {
	repository ports.ITarefaSituacaoRepository
}

func NewTarefaSituacaoService(repo ports.ITarefaSituacaoRepository) *TarefaSituacaoService {
	return &TarefaSituacaoService{repository: repo}
}

func (s *TarefaSituacaoService) Criar(ctx context.Context, descricao string, encerraTarefa bool) (*repository.TarefasSituaco, error) {
	if descricao == "" {
		return nil, fmt.Errorf("descricao e obrigatoria")
	}
	situacao, err := s.repository.CreateTarefaSituacao(ctx, repository.CreateTarefaSituacaoParams{
		Descricao:     descricao,
		EncerraTarefa: pgtype.Bool{Bool: encerraTarefa, Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar situacao: %w", err)
	}
	return &situacao, nil
}

func (s *TarefaSituacaoService) BuscarPorId(ctx context.Context, id int32) (*repository.TarefasSituaco, error) {
	situacao, err := s.repository.GetTarefaSituacaoById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("situacao nao encontrada: %w", err)
	}
	return &situacao, nil
}

func (s *TarefaSituacaoService) Listar(ctx context.Context) ([]repository.TarefasSituaco, error) {
	return s.repository.ListTarefaSituacoes(ctx)
}

func (s *TarefaSituacaoService) Atualizar(ctx context.Context, id int32, descricao string, encerraTarefa bool) (*repository.TarefasSituaco, error) {
	if descricao == "" {
		return nil, fmt.Errorf("descricao e obrigatoria")
	}
	situacao, err := s.repository.UpdateTarefaSituacao(ctx, repository.UpdateTarefaSituacaoParams{
		ID:            id,
		Descricao:     descricao,
		EncerraTarefa: pgtype.Bool{Bool: encerraTarefa, Valid: true},
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar situacao: %w", err)
	}
	return &situacao, nil
}

func (s *TarefaSituacaoService) Remover(ctx context.Context, id int32) error {
	return s.repository.DeleteTarefaSituacao(ctx, id)
}
