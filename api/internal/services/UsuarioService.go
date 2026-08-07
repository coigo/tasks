package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"slices"
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
	usuario := os.Getenv("ADMIN_USUARIO")
	if usuario == "" {
		usuario = "admin"
	}
	senha := os.Getenv("ADMIN_PASSWORD")
	if senha == "" {
		senha = "admin123"
	}

	_, err := s.usuarioRepository.GetUsuarioByUsuario(ctx, usuario)
	if err == nil {
		return nil
	}

	senhaHash, err := s.authService.HashSenha(senha)
	if err != nil {
		return err
	}

	_, err = s.usuarioRepository.CreateUsuario(ctx, repository.CreateUsuarioParams{
		Nome:  "Administrador",
		Usuario: usuario,
		Senha: senhaHash,
	})
	if err != nil {
		return fmt.Errorf("erro ao criar usuario admin: %w", err)
	}

	fmt.Printf("Usuario admin criado: %s\n", usuario)
	return nil
}

func (s *UsuarioService) Criar(ctx context.Context, nome, usuario, senha string) (*repository.CreateUsuarioRow, error) {
	if nome == "" || usuario == "" || senha == "" {
		return nil, errors.New("nome, usuario e senha sao obrigatorios")
	}

	senhaHash, err := s.authService.HashSenha(senha)
	if err != nil {
		return nil, err
	}

	usuarioReg, err := s.usuarioRepository.CreateUsuario(ctx, repository.CreateUsuarioParams{
		Nome:  nome,
		Usuario: usuario,
		Senha: senhaHash,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar usuario: %w", err)
	}

	return &usuarioReg, nil
}

func (s *UsuarioService) BuscarPorId(ctx context.Context, id int32) (*repository.GetUsuarioByIdRow, error) {
	usuario, err := s.usuarioRepository.GetUsuarioById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("usuario nao encontrado: %w", err)
	}
	return &usuario, nil
}

func (s *UsuarioService) Listar(ctx context.Context) ([]repository.ListUsuariosRow, error) {
	return s.usuarioRepository.ListUsuarios(ctx)
}

func (s *UsuarioService) Atualizar(ctx context.Context, id int32, nome, usuario, senha string) (*repository.UpdateUsuarioRow, error) {
	var senhaHash string
	if senha != "" {
		h, err := s.authService.HashSenha(senha)
		if err != nil {
			return nil, err
		}
		senhaHash = h
	}

	usuarioReg, err := s.usuarioRepository.UpdateUsuario(ctx, repository.UpdateUsuarioParams{
		ID:    id,
		Nome:  nome,
		Usuario: usuario,
		Senha: senhaHash,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao atualizar usuario: %w", err)
	}
	return &usuarioReg, nil
}

func (s *UsuarioService) Remover(ctx context.Context, id int32) error {
	return s.usuarioRepository.DeleteUsuario(ctx, id)
}

func (s *UsuarioService) BuscarNotificacoes(ctx context.Context, id int32) ([]models.UsuarioNotificacao, error) {
	notificacoesBin, err :=s.usuarioRepository.ListNotificacoes(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("Erro ao buscar notificacoes: %w", err)
	}

	var notificacoes []models.UsuarioNotificacao
	err = json.Unmarshal(notificacoesBin, &notificacoes)
	if err != nil {
		return nil, fmt.Errorf("Erro ao formatar notificacoes: %w", err)
	}
	return notificacoes, nil
}

func (s *UsuarioService) LetNotificacao(ctx context.Context, arg models.LerNotificacao) error {

	usuarioNotificacoes, err :=s.usuarioRepository.ListNotificacoes(ctx, arg.UsuarioId)
	if err != nil {
		return fmt.Errorf("Notificacoes nao encontradas: %w", err)
	}

	var notificacoes []models.UsuarioNotificacao
	err = json.Unmarshal(usuarioNotificacoes, &notificacoes)
	if err != nil {
		return fmt.Errorf("Erro ao formatar notificacoes: %w", err)
	}
	
	i := slices.IndexFunc(notificacoes, func (n models.UsuarioNotificacao) bool {
		return n.ID == arg.ID
	})

	if i == -1 {
		return nil
	}

	notificacoes[i].Lido = true

	notificacoesFormat, err := json.Marshal(notificacoes)
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("erro ao formatar as notificacoes: %w", err)
	}

	return s.usuarioRepository.UpdateUsuarioNotificacoes(ctx, repository.UpdateUsuarioNotificacoesParams{
		Notificacoes: notificacoesFormat,
		ID:           arg.UsuarioId,
	})

}

func (s *UsuarioService) NotificarUsuario(ctx context.Context, notificacao models.CriarUsuarioNotificacao) error {
	
	// if notificacao.ResponsavelId == notificacao.UsuarioNotificadoId {
	// 	return nil
	// }
	
	usuarioNotificado, err := s.usuarioRepository.GetUsuarioById(ctx, notificacao.UsuarioNotificadoId)
	if err != nil {
		return fmt.Errorf("usuario nao encontrado: %w", err)
	}

	responsavel, err := s.usuarioRepository.GetUsuarioById(ctx, notificacao.ResponsavelId)
	if err != nil {
		return fmt.Errorf("usuario nao encontrado: %w", err)
	}

	mensagem := fmt.Sprintf("Você recebeu uma nova tarefa de %v", strings.Fields(responsavel.Nome)[0])
	redirecionarPara := fmt.Sprintf("/tarefas/%v", notificacao.TarefaId)
	criadoEm := time.Now()
	
	var notificacoes []models.UsuarioNotificacao
	if err := json.Unmarshal(usuarioNotificado.Notificacoes, &notificacoes); err != nil {
		return nil
	}

	novaNotificacao := []models.UsuarioNotificacao{{
		ID: 					criadoEm.Unix(),
		Mensagem:         mensagem,
		RedirecionarPara: redirecionarPara,
		Lido:             false,
		CriadoEm:         criadoEm.Format("2006-01-02 15:04"),
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
