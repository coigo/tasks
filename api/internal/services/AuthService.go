package services

import (
	"context"
	"errors"
	"fmt"
	"os"
	"tasks/internal/repository"
	"tasks/internal/repository/ports"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthClaims struct {
	UsuarioID int32  `json:"usuario_id"`
	Usuario     string `json:"usuario"`
	Tipo      string `json:"tipo"`
	jwt.RegisteredClaims
}

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiraEm     int64  `json:"expira_em"`
}

type AuthService struct {
	usuarioRepository ports.IUsuarioRepository
	jwtSecret         []byte
}

func NewAuthService(repo ports.IUsuarioRepository) *AuthService {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "tasks-secret-key"
	}
	return &AuthService{
		usuarioRepository: repo,
		jwtSecret:         []byte(secret),
	}
}

func (s *AuthService) HashSenha(senha string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(senha), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("erro ao gerar hash da senha: %w", err)
	}
	return string(bytes), nil
}

func (s *AuthService) VerificarSenha(senha, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(senha))
	return err == nil
}

func (s *AuthService) Login(ctx context.Context, usuario, senha string) (*Tokens, *repository.Usuario, error) {
	usuarioReg, err := s.usuarioRepository.GetUsuarioByUsuario(ctx, usuario)
	if err != nil {
		return nil, nil, errors.New("credenciais invalidas")
	}

	if !s.VerificarSenha(senha, usuarioReg.Senha) {
		return nil, nil, errors.New("credenciais invalidas")
	}

	tokens, err := s.GerarTokens(usuarioReg.ID, usuarioReg.Usuario)
	if err != nil {
		return nil, nil, err
	}

	return tokens, &usuarioReg, nil
}

func (s *AuthService) GerarTokens(usuarioID int32, usuario string) (*Tokens, error) {
	agora := time.Now()

	accessClaims := AuthClaims{
		UsuarioID: usuarioID,
		Usuario:     usuario,
		Tipo:      "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(agora.Add(2 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(agora),
			Subject:   fmt.Sprintf("%d", usuarioID),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar access token: %w", err)
	}

	refreshClaims := AuthClaims{
		UsuarioID: usuarioID,
		Usuario:     usuario,
		Tipo:      "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(agora.Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(agora),
			Subject:   fmt.Sprintf("%d", usuarioID),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("erro ao gerar refresh token: %w", err)
	}

	return &Tokens{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiraEm:     accessClaims.ExpiresAt.Unix(),
	}, nil
}

func (s *AuthService) ValidarToken(tokenString string) (*AuthClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AuthClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("metodo de assinatura inesperado: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*AuthClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("token invalido")
}

func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*Tokens, error) {
	claims, err := s.ValidarToken(refreshToken)
	if err != nil {
		return nil, err
	}

	if claims.Tipo != "refresh" {
		return nil, errors.New("token invalido")
	}

	usuario, err := s.usuarioRepository.GetUsuarioById(ctx, claims.UsuarioID)
	if err != nil {
		return nil, errors.New("usuario nao encontrado")
	}

	return s.GerarTokens(usuario.ID, usuario.Usuario)
}
