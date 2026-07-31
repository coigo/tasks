package services

import (
	"context"
	"fmt"
	"io"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"tasks/internal/storage"

	"github.com/jackc/pgx/v5/pgtype"
)

type TarefaAnexoService struct {
	anexoRepository ports.ITarefaAnexoRepository
	storage         storage.ArquivoStorage
}

func NewTarefaAnexoService(repo ports.ITarefaAnexoRepository, st storage.ArquivoStorage) *TarefaAnexoService {
	return &TarefaAnexoService{
		anexoRepository: repo,
		storage:         st,
	}
}

func (s *TarefaAnexoService) UploadTemp(ctx context.Context, nome string, conteudo io.Reader) (string, error) {
	return s.storage.UploadTemp(ctx, nome, conteudo)
}

func (s *TarefaAnexoService) FinalizarAnexos(ctx context.Context, tarefaID int32, uuids []string, nomes []string) error {
	for i, uuid := range uuids {
		local, err := s.storage.MoverTempParaTarefa(ctx, uuid, tarefaID)
		if err != nil {
			return err
		}

		nome := uuid
		if i < len(nomes) && nomes[i] != "" {
			nome = nomes[i]
		}

		_, err = s.anexoRepository.CreateTarefaAnexo(ctx, repository.CreateTarefaAnexoParams{
			TarefaID: tarefaID,
			Uuid:     uuid,
			Nome:     nome,
			Local:    local,
			Tamanho:  pgtype.Int8{Int64: 0, Valid: false},
		})
		if err != nil {
			return fmt.Errorf("erro ao salvar anexo no banco: %w", err)
		}
	}
	return nil
}

func (s *TarefaAnexoService) ListarPorTarefa(ctx context.Context, tarefaID int32) ([]repository.TarefasAnexo, error) {
	return s.anexoRepository.ListTarefaAnexosByTarefa(ctx, tarefaID)
}

func (s *TarefaAnexoService) GerarURL(ctx context.Context, anexoID int32) (string, *repository.TarefasAnexo, error) {
	anexo, err := s.anexoRepository.GetTarefaAnexoById(ctx, anexoID)
	if err != nil {
		return "", nil, fmt.Errorf("anexo nao encontrado: %w", err)
	}

	url, err := s.storage.GerarURLAssinada(ctx, anexo.Local, 15*60)
	if err != nil {
		return "", nil, err
	}
	return url, &anexo, nil
}

func (s *TarefaAnexoService) Remover(ctx context.Context, anexoID int32) error {
	anexo, err := s.anexoRepository.GetTarefaAnexoById(ctx, anexoID)
	if err != nil {
		return err
	}

	if remover, ok := s.storage.(interface{ RemoverArquivo(context.Context, string) error }); ok {
		if err := remover.RemoverArquivo(ctx, anexo.Local); err != nil {
			return err
		}
	}

	return s.anexoRepository.DeleteTarefaAnexo(ctx, anexoID)
}
