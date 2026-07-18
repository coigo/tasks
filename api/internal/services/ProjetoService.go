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

func NewProjetoService (repo ports.IProjetoRepository) *ProjetoService{
	service := &ProjetoService{}
	service.projetoRepository = repo
	return service
}

func (s ProjetoService) BuscarPorId (ctx context.Context, id int32 ) (*repository.Projeto, error) {
	projeto, err := s.projetoRepository.GetProjeto(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("Nao foi possivel buscar o projeto: %v", err)
	}

	return &projeto, nil
	
}