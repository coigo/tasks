package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type RelatorioService struct {
	tarefaRepository ports.ITarefaRepository
}

func NewRelatorioService(repo ports.ITarefaRepository) *RelatorioService {
	return &RelatorioService{tarefaRepository: repo}
}

func (s *RelatorioService) TarefasMovimentadasNoPeriodo(ctx context.Context, dataInicio, dataFim time.Time, responsavelID int32) ([]repository.ListTarefasMovimentadasNoPeriodoRow, error) {
	if dataInicio.IsZero() || dataFim.IsZero() {
		return nil, fmt.Errorf("data inicio e data fim sao obrigatorias")
	}

	params := repository.ListTarefasMovimentadasNoPeriodoParams{
		DataInicio:    pgtype.Timestamp{Time: dataInicio, Valid: true},
		DataFim:       pgtype.Timestamp{Time: dataFim, Valid: true},
		ResponsavelID: responsavelID,
	}

	return s.tarefaRepository.ListTarefasMovimentadasNoPeriodo(ctx, params)
}
