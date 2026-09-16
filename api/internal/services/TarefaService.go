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

type TarefaService struct {
	tarefaRepository   ports.ITarefaRepository
	projetoRepository ports.IProjetoRepository
	situacaoRepository ports.ITarefaSituacaoRepository
	usuarioRepository ports.IUsuarioRepository
	historicoService  *TarefaHistoricoService
}

func NewTarefaService(repo ports.ITarefaRepository, projeto ports.IProjetoRepository, situacao ports.ITarefaSituacaoRepository, usuario ports.IUsuarioRepository, historico *TarefaHistoricoService) *TarefaService {
	return &TarefaService{
		tarefaRepository:   repo,
		projetoRepository:  projeto,
		situacaoRepository: situacao,
		usuarioRepository:  usuario,
		historicoService:   historico,
	}
}

func (s *TarefaService) Criar(ctx context.Context, titulo, descricao string, projetoID, criadoPorID, responsavelID, situacaoID, tipoID int32, inicioPrevisto, prazo *string, tarefaPaiID *int32) (*repository.CreateTarefaRow, error) {

	projeto, err := s.projetoRepository.GetProjetoById(ctx, projetoID)
	if (err != nil) {
		return nil, fmt.Errorf("projeto nao encontrado")
	}

	situacao, err := s.situacaoRepository.GetTarefaSituacaoById(ctx, situacaoID)
	if (err != nil) {
		return nil, fmt.Errorf("situacao nao encontrada")
	}
	
	if titulo == "" {
		return nil, fmt.Errorf("titulo e obrigatorio")
	}

	if prazo != nil && inicioPrevisto != nil {
		prazoDate, _ := time.Parse("2006-01-02", *prazo)
		inicioDate, _ := time.Parse("2006-01-02", *inicioPrevisto)
		if prazoDate.Before(inicioDate) {
			return nil, fmt.Errorf("prazo deve ser maior ou igual ao inicio previsto")
		}
	}

	if tarefaPaiID != nil && *tarefaPaiID <= 0 {
		tarefaPaiID = nil
	}

	if tarefaPaiID != nil {
		if _, err := s.tarefaRepository.GetTarefaById(ctx, *tarefaPaiID); err != nil {
			return nil, fmt.Errorf("tarefa pai nao encontrada")
		}
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

	var inicioPrevistoDate pgtype.Date
	if inicioPrevisto != nil {
		inicioDate, err := time.Parse("2006-01-02", *inicioPrevisto)
		if err == nil {
			inicioPrevistoDate = pgtype.Date{Time: inicioDate, Valid: true}
		}
	}

	var prazoDate pgtype.Date
	if prazo != nil {
		prazoTime, err := time.Parse("2006-01-02", *prazo)
		if err == nil {
			prazoDate = pgtype.Date{Time: prazoTime, Valid: true}
		}
	}

	var tarefaPaiParam pgtype.Int4
	if tarefaPaiID != nil {
		tarefaPaiParam = pgtype.Int4{Int32: *tarefaPaiID, Valid: true}
	}

	textoPesquisa := fmt.Sprintf("%v %v %v %v",
		projeto.Nome, 
		situacao.Descricao,
 		titulo,
		utils.ClearHtml(descricao),
	) 
	
	tarefa, err := s.tarefaRepository.CreateTarefa(ctx, repository.CreateTarefaParams{
		Numero:         numero,
		Ano:            ano,
		Titulo:         titulo,
		Descricao:      descricaoText,
		ProjetoID:      projetoID,
		CriadoPorID:    criadoPorID,
		ResponsavelID:  responsavelID,
		SituacaoID:     situacaoID,
		TipoID:         tipoID,
		InicioPrevisto: inicioPrevistoDate,
		Prazo:          prazoDate,
		TarefaPaiID:    tarefaPaiParam,
		Pesquisa: 		textoPesquisa,
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
		ResponsavelID:     pgtype.Int4{Int32: responsavelID, Valid: responsavelID != 0},
		SituacaoID:        pgtype.Int4{Int32: situacaoID, Valid: situacaoID != 0},
		TipoID:            pgtype.Int4{Int32: tipoID, Valid: tipoID != 0},
		ProjetoID:         pgtype.Int4{Int32: projetoID, Valid: projetoID != 0},
		Busca:             pgtype.Text{String: busca, Valid: busca != ""},
		IncluirEncerradas: incluirEncerradas,
	}
	return s.tarefaRepository.ListTarefas(ctx, params)
}

func (s *TarefaService) ListarSubtarefas(ctx context.Context, tarefaPaiID int32) ([]repository.ListSubtarefasByTarefaPaiRow, error) {
	return s.tarefaRepository.ListSubtarefasByTarefaPai(ctx, pgtype.Int4{Int32: tarefaPaiID, Valid: true})
}

func (s *TarefaService) Atualizar(ctx context.Context, id int32, titulo, descricao string, projetoID, responsavelID, situacaoID, tipoID int32, inicioPrevisto, prazo *string, tarefaPaiID *int32, criadoPorID int32) (*repository.UpdateTarefaRow, error) {
	if titulo == "" {
		return nil, fmt.Errorf("titulo e obrigatorio")
	}

	if prazo != nil && inicioPrevisto != nil {
		prazoDate, _ := time.Parse("2006-01-02", *prazo)
		inicioDate, _ := time.Parse("2006-01-02", *inicioPrevisto)
		if prazoDate.Before(inicioDate) {
			return nil, fmt.Errorf("prazo deve ser maior ou igual ao inicio previsto")
		}
	}

	if tarefaPaiID != nil && *tarefaPaiID <= 0 {
		tarefaPaiID = nil
	}

	if tarefaPaiID != nil {
		if *tarefaPaiID == id {
			return nil, fmt.Errorf("tarefa nao pode ser pai dela mesma")
		}
		if err := s.validarCiclo(ctx, id, *tarefaPaiID); err != nil {
			return nil, err
		}
	}

	tarefaAtual, err := s.tarefaRepository.GetTarefaById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("tarefa nao encontrada: %w", err)
	}

	descricaoChanged := tarefaAtual.Descricao.String != descricao
	situacaoChanged := tarefaAtual.SituacaoID != situacaoID
	responsavelChanged := tarefaAtual.ResponsavelID != responsavelID

	var inicioPrevistoDate pgtype.Date
	if inicioPrevisto != nil {
		inicioDate, err := time.Parse("2006-01-02", *inicioPrevisto)
		if err == nil {
			inicioPrevistoDate = pgtype.Date{Time: inicioDate, Valid: true}
		}
	}

	var prazoDate pgtype.Date
	if prazo != nil {
		prazoTime, err := time.Parse("2006-01-02", *prazo)
		if err == nil {
			prazoDate = pgtype.Date{Time: prazoTime, Valid: true}
		}
	}

	var tarefaPaiParam pgtype.Int4
	if tarefaPaiID != nil {
		tarefaPaiParam = pgtype.Int4{Int32: *tarefaPaiID, Valid: true}
	}

	tarefa, err := s.tarefaRepository.UpdateTarefa(ctx, repository.UpdateTarefaParams{
		ID:             id,
		Titulo:         titulo,
		Descricao:      pgtype.Text{String: descricao, Valid: descricao != ""},
		ProjetoID:      projetoID,
		ResponsavelID:  responsavelID,
		SituacaoID:     situacaoID,
		TipoID:         tipoID,
		InicioPrevisto: inicioPrevistoDate,
		Prazo:          prazoDate,
		TarefaPaiID:    tarefaPaiParam,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar tarefa: %w", err)
	}

	if descricaoChanged {
		s.historicoService.Registrar(ctx, id, criadoPorID, "descricao", &tarefaAtual.Descricao.String, &descricao)
	}
	if situacaoChanged {
		situacaoAnterior, _ := s.situacaoRepository.GetTarefaSituacaoById(ctx, tarefaAtual.SituacaoID)
		situacaoNova, _ := s.situacaoRepository.GetTarefaSituacaoById(ctx, situacaoID)
		s.historicoService.Registrar(ctx, id, criadoPorID, "situacao", &situacaoAnterior.Descricao, &situacaoNova.Descricao)
	}
	if responsavelChanged {
		responsavelAnterior, _ := s.usuarioRepository.GetUsuarioById(ctx, tarefaAtual.ResponsavelID)
		responsavelNovo, _ := s.usuarioRepository.GetUsuarioById(ctx, responsavelID)
		s.historicoService.Registrar(ctx, id, criadoPorID, "responsavel", &responsavelAnterior.Nome, &responsavelNovo.Nome)
	}

	return &tarefa, nil
}

func (s *TarefaService) Remover(ctx context.Context, id int32) error {
	return s.tarefaRepository.DeleteTarefa(ctx, id)
}

func (s *TarefaService) Mover(ctx context.Context, tarefaID, novaSituacaoID, criadoPorID int32) error {
	tarefaAtual, err := s.tarefaRepository.GetTarefaById(ctx, tarefaID)
	if err != nil {
		return fmt.Errorf("tarefa nao encontrada: %w", err)
	}

	if tarefaAtual.SituacaoID == novaSituacaoID {
		return nil
	}

	if err := s.tarefaRepository.UpdateSituacaoTarefa(ctx, repository.UpdateSituacaoTarefaParams{
		ID:         tarefaID,
		SituacaoID: novaSituacaoID,
	}); err != nil {
		return fmt.Errorf("erro ao mover tarefa: %w", err)
	}

	situacaoAnterior, _ := s.situacaoRepository.GetTarefaSituacaoById(ctx, tarefaAtual.SituacaoID)
	situacaoNova, _ := s.situacaoRepository.GetTarefaSituacaoById(ctx, novaSituacaoID)
	s.historicoService.Registrar(ctx, tarefaID, criadoPorID, "situacao", &situacaoAnterior.Descricao, &situacaoNova.Descricao)

	return nil
}

func (s *TarefaService) validarCiclo(ctx context.Context, tarefaID, novoPaiID int32) error {
	atual := novoPaiID
	visitados := map[int32]bool{}
	for atual > 0 {
		if visitados[atual] {
			return fmt.Errorf("ciclo detectado na hierarquia de tarefas")
		}
		visitados[atual] = true
		if atual == tarefaID {
			return fmt.Errorf("tarefa nao pode ser filha de sua propria descendencia")
		}
		pai, err := s.tarefaRepository.GetTarefaById(ctx, atual)
		if err != nil {
			return fmt.Errorf("erro ao validar hierarquia: %w", err)
		}
		if !pai.TarefaPaiID.Valid {
			return nil
		}
		atual = pai.TarefaPaiID.Int32
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
