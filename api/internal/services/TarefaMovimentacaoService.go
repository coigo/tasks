package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"

	"github.com/jackc/pgx/v5/pgtype"
)

type TarefaMovimentacaoService struct {
	movimentacaoRepository ports.ITarefaMovimentacaoRepository
	tarefaRepository       ports.ITarefaRepository
}

func NewTarefaMovimentacaoService(movRepo ports.ITarefaMovimentacaoRepository, tarefaRepo ports.ITarefaRepository) *TarefaMovimentacaoService {
	return &TarefaMovimentacaoService{
		movimentacaoRepository: movRepo,
		tarefaRepository:       tarefaRepo,
	}
}

func (s *TarefaMovimentacaoService) Criar(ctx context.Context, tarefaID, criadoPorID int32, situacaoID *int32, descricao string) (*repository.TarefasMovimentaco, error) {
	var situacaoIDValue int32
	if situacaoID != nil {
		situacaoIDValue = *situacaoID
	}

	movimentacao, err := s.movimentacaoRepository.CreateTarefaMovimentacao(ctx, repository.CreateTarefaMovimentacaoParams{
		TarefaID:    tarefaID,
		SituacaoID:  situacaoIDValue,
		Descricao:   pgtype.Text{String: descricao, Valid: descricao != ""},
		CriadoPorID: criadoPorID,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar movimentacao: %w", err)
	}

	if situacaoID != nil {
		if err := s.tarefaRepository.UpdateSituacaoTarefa(ctx, repository.UpdateSituacaoTarefaParams{
			ID:         tarefaID,
			SituacaoID: situacaoIDValue,
		}); err != nil {
			return nil, fmt.Errorf("erro ao atualizar situacao da tarefa: %w", err)
		}
	}

	return &movimentacao, nil
}

func (s *TarefaMovimentacaoService) BuscarPorId(ctx context.Context, id int32) (*repository.TarefasMovimentaco, error) {
	movimentacao, err := s.movimentacaoRepository.GetTarefaMovimentacaoById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("movimentacao nao encontrada: %w", err)
	}
	return &movimentacao, nil
}

func (s *TarefaMovimentacaoService) ListarPorTarefa(ctx context.Context, tarefaID int32) ([]repository.ListTarefaMovimentacoesByTarefaRow, error) {
	return s.movimentacaoRepository.ListTarefaMovimentacoesByTarefa(ctx, tarefaID)
}

func (s *TarefaMovimentacaoService) Atualizar(ctx context.Context, id int32, descricao string) (*repository.TarefasMovimentaco, error) {
	movimentacao, err := s.movimentacaoRepository.UpdateTarefaMovimentacao(ctx, repository.UpdateTarefaMovimentacaoParams{
		ID:        id,
		Descricao: pgtype.Text{String: descricao, Valid: descricao != ""},
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar movimentacao: %w", err)
	}
	return &movimentacao, nil
}

func (s *TarefaMovimentacaoService) Remover(ctx context.Context, id int32) error {
	return s.movimentacaoRepository.DeleteTarefaMovimentacao(ctx, id)
}
