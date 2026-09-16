package services

import (
	"context"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"

	"github.com/jackc/pgx/v5/pgtype"
)

type TarefaHistoricoService struct {
	historicoRepository ports.ITarefaHistoricoRepository
}

func NewTarefaHistoricoService(historicoRepo ports.ITarefaHistoricoRepository) *TarefaHistoricoService {
	return &TarefaHistoricoService{
		historicoRepository: historicoRepo,
	}
}

func (s *TarefaHistoricoService) ListarPorTarefa(ctx context.Context, tarefaID int32) ([]repository.ListTarefaHistoricoByTarefaRow, error) {
	return s.historicoRepository.ListTarefaHistoricoByTarefa(ctx, tarefaID)
}

func (s *TarefaHistoricoService) Registrar(ctx context.Context, tarefaID, criadoPorID int32, campo string, valorAnterior, valorNovo *string) error {
	var anterior, novo pgtype.Text

	if valorAnterior != nil {
		anterior = pgtype.Text{String: *valorAnterior, Valid: true}
	}
	if valorNovo != nil {
		novo = pgtype.Text{String: *valorNovo, Valid: true}
	}

	_, err := s.historicoRepository.CreateTarefaHistorico(ctx, repository.CreateTarefaHistoricoParams{
		TarefaID:      tarefaID,
		Campo:         campo,
		ValorAnterior: anterior,
		ValorNovo:     novo,
		CriadoPorID:   criadoPorID,
	})
	return err
}
