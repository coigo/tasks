package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"tasks/internal/utils"
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

func (s *RelatorioService) Home(ctx context.Context) (map[string]interface{}, error) {
	porSituacao, err := s.tarefaRepository.CountTarefasBySituacao(ctx)
	if err != nil {
		return nil, err
	}
	porTipo, err := s.tarefaRepository.CountTarefasByTipo(ctx)
	if err != nil {
		return nil, err
	}
	porResponsavel, err := s.tarefaRepository.CountTarefasResponsavel(ctx)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"por_situacao":    utils.EnsureList(porSituacao),
		"por_tipo":        utils.EnsureList(porTipo),
		"por_responsavel": utils.EnsureList(porResponsavel),
	}, nil
}