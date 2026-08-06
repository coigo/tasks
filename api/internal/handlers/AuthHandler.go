package handlers

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"tasks/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

type AuthHandlerConfig struct {
	Router      *gin.Engine
	AuthService *services.AuthService
}

func NewAuthHandler(cfg AuthHandlerConfig) *AuthHandler {
	handler := &AuthHandler{
		authService: cfg.AuthService,
	}

	group := cfg.Router.Group("/auth")
	group.POST("/login", handler.Login)
	group.POST("/refresh", handler.Refresh)

	return handler
}

type LoginRequest struct {
	Usuario string `json:"usuario" binding:"required"`
	Senha string `json:"senha" binding:"required"`
}

func (h *AuthHandler) Login(ctx *gin.Context) {
	bodyBytes, _ := io.ReadAll(ctx.Request.Body)
	fmt.Println("> login body cru:", string(bodyBytes))

	// devolve o body pro request, senão ShouldBindJSON não vai conseguir ler nada
	ctx.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}
	tokens, usuario, err := h.authService.Login(ctx.Request.Context(), req.Usuario, req.Senha)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"tokens": tokens,
		"usuario": gin.H{
			"id":    usuario.ID,
			"nome":  usuario.Nome,
			"usuario": usuario.Usuario,
		},
	})
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) Refresh(ctx *gin.Context) {
	var req RefreshRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "refresh token obrigatorio"})
		return
	}

	tokens, err := h.authService.Refresh(ctx.Request.Context(), req.RefreshToken)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, tokens)
}
