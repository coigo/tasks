package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"tasks/internal/models"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"time"
)

type UsuarioService struct {
	usuarioRepository ports.IUsuarioRepository
	authService       *AuthService
}

func NewUsuarioService(repo ports.IUsuarioRepository, authService *AuthService) *UsuarioService {
	return &UsuarioService{
		usuarioRepository: repo,
		authService:       authService,
	}
}

func (s *UsuarioService) SeedAdmin(ctx context.Context) error {
	email := os.Getenv("ADMIN_EMAIL")
	if email == "" {
		email = "admin@admin.com"
	}
	senha := os.Getenv("ADMIN_PASSWORD")
	if senha == "" {
		senha = "admin123"
	}

	_, err := s.usuarioRepository.GetUsuarioByEmail(ctx, email)
	if err == nil {
		return nil
	}

	senhaHash, err := s.authService.HashSenha(senha)
	if err != nil {
		return err
	}

	_, err = s.usuarioRepository.CreateUsuario(ctx, repository.CreateUsuarioParams{
		Nome:  "Administrador",
		Email: email,
		Senha: senhaHash,
	})
	if err != nil {
		return fmt.Errorf("erro ao criar usuario admin: %w", err)
	}

	fmt.Printf("Usuario admin criado: %s\n", email)
	return nil
}

func (s *UsuarioService) Criar(ctx context.Context, nome, email, senha string) (*repository.CreateUsuarioRow, error) {
	if nome == "" || email == "" || senha == "" {
		return nil, errors.New("nome, email e senha sao obrigatorios")
	}

	senhaHash, err := s.authService.HashSenha(senha)
	if err != nil {
		return nil, err
	}

	usuario, err := s.usuarioRepository.CreateUsuario(ctx, repository.CreateUsuarioParams{
		Nome:  nome,
		Email: email,
		Senha: senhaHash,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar usuario: %w", err)
	}

	return &usuario, nil
}

func (s *UsuarioService) BuscarPorId(ctx context.Context, id int32) (*repository.Usuario, error) {
	usuario, err := s.usuarioRepository.GetUsuarioById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("usuario nao encontrado: %w", err)
	}
	return &usuario, nil
}

func (s *UsuarioService) Listar(ctx context.Context) ([]repository.ListUsuariosRow, error) {
	return s.usuarioRepository.ListUsuarios(ctx)
}

func (s *UsuarioService) Atualizar(ctx context.Context, id int32, nome, email, senha string) (*repository.UpdateUsuarioRow, error) {
	var senhaHash string
	if senha != "" {
		h, err := s.authService.HashSenha(senha)
		if err != nil {
			return nil, err
		}
		senhaHash = h
	}

	usuario, err := s.usuarioRepository.UpdateUsuario(ctx, repository.UpdateUsuarioParams{
		ID:    id,
		Nome:  nome,
		Email: email,
		Senha: senhaHash,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar usuario: %w", err)
	}
	return &usuario, nil
}

func (s *UsuarioService) Remover(ctx context.Context, id int32) error {
	return s.usuarioRepository.DeleteUsuario(ctx, id)
}

func (s *UsuarioService) BuscarNotificacoes(ctx context.Context, id int32) ([]byte, error) {
	return s.usuarioRepository.ListNotificacoes(ctx, id)
}

func (s *UsuarioService) NotificarUsuario(ctx context.Context, notificacao models.CriarUsuarioNotificacao) error {
	
	if notificacao.ResponsavelId == notificacao.UsuarioNotificadoId {
		return nil
	}
	
	usuarioNotificado, err := s.usuarioRepository.GetUsuarioById(ctx, notificacao.UsuarioNotificadoId)
	if err != nil {
		return fmt.Errorf("usuario nao encontrado: %w", err)
	}

	responsavel, err := s.usuarioRepository.GetUsuarioById(ctx, notificacao.ResponsavelId)
	if err != nil {
		return fmt.Errorf("usuario nao encontrado: %w", err)
	}

	fmt.Println("> Responsavel: ", strings.Fields(responsavel.Nome)[0])
	mensagem := fmt.Sprintf("Você recebeu uma nova tarefa de %v", strings.Fields(responsavel.Nome)[0])
	redirecionarPara := fmt.Sprintf("/tarefas/%v", notificacao.TarefaId)

	var notificacoes []models.UsuarioNotificacao
	if err := json.Unmarshal(usuarioNotificado.Notificacoes, &notificacoes); err != nil {
		return nil
	}

	novaNotificacao := []models.UsuarioNotificacao{{
		Mensagem:         mensagem,
		RedirecionarPara: redirecionarPara,
		Lido:             false,
		CriadoEm:         time.Now().Format("2006-01-02 15:04"),
	}}

	notificacoes = append(novaNotificacao, notificacoes...)
	if len(notificacoes) > 20 {
		notificacoes = notificacoes[:16]
	} 
	notificacoesFormat, err := json.Marshal(notificacoes)

	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("erro ao formatar as notificacoes: %w", err)
	}

	return s.usuarioRepository.UpdateUsuarioNotificacoes(ctx, repository.UpdateUsuarioNotificacoesParams{
		Notificacoes: notificacoesFormat,
		ID:           usuarioNotificado.ID,
	})
}
