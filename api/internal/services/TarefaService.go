package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type TarefaService struct {
	tarefaRepository ports.ITarefaRepository
}

func NewTarefaService(repo ports.ITarefaRepository) *TarefaService {
	return &TarefaService{tarefaRepository: repo}
}

func (s *TarefaService) Criar(ctx context.Context, titulo, descricao string, projetoID, criadoPorID, responsavelID, situacaoID, tipoID int32) (*repository.CreateTarefaRow, error) {
	if titulo == "" {
		return nil, fmt.Errorf("titulo e obrigatorio")
	}

	ano := int32(time.Now().Year())
	maxNumeroRaw, err := s.tarefaRepository.GetMaxNumeroTarefaByAno(ctx, ano)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar proximo numero: %w", err)
	}

	var maxNumero int32
	switch v := maxNumeroRaw.(type) {
	case int32:
		maxNumero = v
	case int64:
		maxNumero = int32(v)
	case int:
		maxNumero = int32(v)
	}
	numero := maxNumero + 1

	descricaoText := pgtype.Text{String: descricao, Valid: descricao != ""}

	tarefa, err := s.tarefaRepository.CreateTarefa(ctx, repository.CreateTarefaParams{
		Numero:        numero,
		Ano:           ano,
		Titulo:        titulo,
		Descricao:     descricaoText,
		ProjetoID:     projetoID,
		CriadoPorID:   criadoPorID,
		ResponsavelID: responsavelID,
		SituacaoID:    situacaoID,
		TipoID:        tipoID,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar tarefa: %w", err)
	}
	return &tarefa, nil
}

func (s *TarefaService) BuscarPorId(ctx context.Context, id int32) (*repository.GetTarefaByIdRow, error) {
	tarefa, err := s.tarefaRepository.GetTarefaById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("tarefa nao encontrada: %w", err)
	}
	return &tarefa, nil
}

func (s *TarefaService) Listar(ctx context.Context, responsavelID, situacaoID, tipoID, projetoID int32, busca string, incluirEncerradas bool) ([]repository.ListTarefasRow, error) {
	params := repository.ListTarefasParams{
		ResponsavelID:     responsavelID,
		SituacaoID:        situacaoID,
		TipoID:            tipoID,
		ProjetoID:         projetoID,
		Busca:             busca,
		IncluirEncerradas: incluirEncerradas,
	}
	return s.tarefaRepository.ListTarefas(ctx, params)
}

func (s *TarefaService) Atualizar(ctx context.Context, id int32, titulo, descricao string, projetoID, responsavelID, situacaoID, tipoID int32) (*repository.UpdateTarefaRow, error) {
	if titulo == "" {
		return nil, fmt.Errorf("titulo e obrigatorio")
	}

	tarefa, err := s.tarefaRepository.UpdateTarefa(ctx, repository.UpdateTarefaParams{
		ID:            id,
		Titulo:        titulo,
		Descricao:     pgtype.Text{String: descricao, Valid: descricao != ""},
		ProjetoID:     projetoID,
		ResponsavelID: responsavelID,
		SituacaoID:    situacaoID,
		TipoID:        tipoID,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar tarefa: %w", err)
	}
	return &tarefa, nil
}

func (s *TarefaService) Remover(ctx context.Context, id int32) error {
	return s.tarefaRepository.DeleteTarefa(ctx, id)
}

func (s *TarefaService) Mover(ctx context.Context, tarefaID, novaSituacaoID int32) error {
	if err := s.tarefaRepository.UpdateSituacaoTarefa(ctx, repository.UpdateSituacaoTarefaParams{
		ID:         tarefaID,
		SituacaoID: novaSituacaoID,
	}); err != nil {
		return fmt.Errorf("erro ao mover tarefa: %w", err)
	}
	return nil
}

func (s *TarefaService) Metricas(ctx context.Context, dataInicio, dataFim time.Time) (map[string]interface{}, error) {
	totalProjetos, err := s.tarefaRepository.CountProjetosCriadosNoPeriodo(ctx, repository.CountProjetosCriadosNoPeriodoParams{
		DataInicio: pgtype.Timestamp{Time: dataInicio, Valid: true},
		DataFim:    pgtype.Timestamp{Time: dataFim, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	tarefasAbertas, err := s.tarefaRepository.CountTarefasAbertasNoPeriodo(ctx, repository.CountTarefasAbertasNoPeriodoParams{
		DataInicio: pgtype.Timestamp{Time: dataInicio, Valid: true},
		DataFim:    pgtype.Timestamp{Time: dataFim, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	tarefasEncerradas, err := s.tarefaRepository.CountTarefasEncerradasNoPeriodo(ctx, repository.CountTarefasEncerradasNoPeriodoParams{
		DataInicio: pgtype.Timestamp{Time: dataInicio, Valid: true},
		DataFim:    pgtype.Timestamp{Time: dataFim, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"total_projetos":     totalProjetos,
		"tarefas_abertas":    tarefasAbertas,
		"tarefas_encerradas": tarefasEncerradas,
	}, nil
}

