package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"tasks/internal/utils"

	"github.com/jackc/pgx/v5/pgtype"
)

type ProjetoService struct {
	projetoRepository ports.IProjetoRepository
}

func NewProjetoService(repo ports.IProjetoRepository) *ProjetoService {
	return &ProjetoService{
		projetoRepository: repo,
	}
}

func (s *ProjetoService) Criar(ctx context.Context, nome string) (*repository.CreateProjetoRow, error) {
	if nome == "" {
		return nil, fmt.Errorf("nome do projeto e obrigatorio")
	}
	projeto, err := s.projetoRepository.CreateProjeto(ctx, nome)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar projeto: %w", err)
	}
	return &projeto, nil
}

func (s *ProjetoService) BuscarPorId(ctx context.Context, id int32) (*repository.GetProjetoByIdRow, error) {
	projeto, err := s.projetoRepository.GetProjetoById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("projeto nao encontrado: %w", err)
	}
	return &projeto, nil
}

func (s *ProjetoService) Listar(ctx context.Context) ([]repository.ListProjetosRow, error) {
	return s.projetoRepository.ListProjetos(ctx)
}

func (s *ProjetoService) Atualizar(ctx context.Context, id int32, nome string) (*repository.UpdateProjetoRow, error) {
	if nome == "" {
		return nil, fmt.Errorf("nome do projeto e obrigatorio")
	}
	projeto, err := s.projetoRepository.UpdateProjeto(ctx, repository.UpdateProjetoParams{
		ID:   id,
		Nome: nome,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar projeto: %w", err)
	}
	return &projeto, nil
}

func (s *ProjetoService) Remover(ctx context.Context, id int32) error {
	return s.projetoRepository.DeleteProjeto(ctx, id)
}

func (s *ProjetoService) AtualizarDetalhes(ctx context.Context, id int32, detalhes string) error {
	err := s.projetoRepository.UpdateProjetoDetalhes(ctx, repository.UpdateProjetoDetalhesParams{
		ID:       id,
		Detalhes: pgtype.Text{String: detalhes, Valid: detalhes != ""},
	})
	if err != nil {
		return fmt.Errorf("erro ao atualizar os detalhes: %w", err)
	}

	chunks, err := utils.GenerateTextChunks(detalhes)
	if err != nil {
		return fmt.Errorf("erro ao gerar novos chunks: %w", err)
	}
	
	err = s.projetoRepository.DeleteProjetoDetalhesChunksByProjeto(ctx, id)
	if err != nil {
		return fmt.Errorf("erro ao apagar chunks antigos: %w", err)
	}
	
	for i, chunk := range chunks {
		_, err := s.projetoRepository.CreateProjetoDetalhesChunk(ctx, repository.CreateProjetoDetalhesChunkParams{
			ProjetoID: id,
			Content: chunk,
			HeaderPath: pgtype.Text{String: "teste"},
			Ordem: int32(i),
		})
		if err != nil {
			return fmt.Errorf("erro ao criar chunk: %w", err)
		}
	}

	err = s.projetoRepository.UpdateProjetoDetalhesChunksPesquisa(ctx, id)
	if err != nil {
		return fmt.Errorf("erro ao atualizar pesquisa dos chunks: %w", err)
	}

	return nil
}

func (s *ProjetoService) ProjetoDetalheRAG(ctx context.Context, id int32, prompt *string) ([]string, error) {
	// TODO: medida provisoria - o prompt e enviado diretamente para a query,
	// que converte espacos em OR. Reavaliar quando houver parser de prompt.
	fmt.Printf("prompt projeto %v -> %v\n", id, *prompt)
	result, err := s.projetoRepository.SearchProjetoDetalhesChunks(ctx, repository.SearchProjetoDetalhesChunksParams{
		Prompt:    *prompt,
		ProjetoID: id,
		Limite:    3,
	})
	if err != nil {
		return []string{}, fmt.Errorf("erro ao buscar chunks relevantes: %w", err)
	}
	if len(result) == 0 {
		return []string{}, fmt.Errorf("nenhum conteudo relevante encontrado")
	}

	chunkTotal := min(3, len(result))
	respostas := []string{}
	for i := range chunkTotal {
		respostas = append(respostas, result[i].Content)
	}
	
	fmt.Println(result[0].Rank)
	
	return respostas, nil
}
