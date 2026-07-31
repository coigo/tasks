package services

import (
	"context"
	"fmt"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
)

type ProjetoService struct {
	projetoRepository ports.IProjetoRepository
}

func NewProjetoService(repo ports.IProjetoRepository) *ProjetoService {
	return &ProjetoService{
		projetoRepository: repo,
	}
}

func (s *ProjetoService) Criar(ctx context.Context, nome string) (*repository.Projeto, error) {
	if nome == "" {
		return nil, fmt.Errorf("nome do projeto e obrigatorio")
	}
	projeto, err := s.projetoRepository.CreateProjeto(ctx, nome)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar projeto: %w", err)
	}
	return &projeto, nil
}

func (s *ProjetoService) BuscarPorId(ctx context.Context, id int32) (*repository.Projeto, error) {
	projeto, err := s.projetoRepository.GetProjetoById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("projeto nao encontrado: %w", err)
	}
	return &projeto, nil
}

func (s *ProjetoService) Listar(ctx context.Context) ([]repository.Projeto, error) {
	return s.projetoRepository.ListProjetos(ctx)
}

func (s *ProjetoService) Atualizar(ctx context.Context, id int32, nome string) (*repository.Projeto, error) {
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
