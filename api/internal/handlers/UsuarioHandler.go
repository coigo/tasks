package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type UsuarioHandler struct {
	service *services.UsuarioService
}

type UsuarioHandlerConfig struct {
	Router  *gin.Engine
	Service *services.UsuarioService
	Auth    *services.AuthService
}

func NewUsuarioHandler(cfg UsuarioHandlerConfig) *UsuarioHandler {
	handler := &UsuarioHandler{service: cfg.Service}
	group := cfg.Router.Group("/usuarios")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:id", handler.BuscarPorId)
	group.PUT("/:id", handler.Atualizar)
	group.DELETE("/:id", handler.Remover)
	group.GET("/notificacoes", handler.BuscarNotificacoes)
	

	return handler
}

type CriarUsuarioRequest struct {
	Nome  string `json:"nome" binding:"required"`
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required,min=4"`
}

type AtualizarUsuarioRequest struct {
	Nome  string `json:"nome" binding:"required"`
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha"`
}

func (h *UsuarioHandler) Listar(ctx *gin.Context) {
	usuarios, err := h.service.Listar(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(usuarios))
}

func (h *UsuarioHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	usuario, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, usuario)
}

func (h *UsuarioHandler) Criar(ctx *gin.Context) {
	var req CriarUsuarioRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	usuario, err := h.service.Criar(ctx.Request.Context(), req.Nome, req.Email, req.Senha)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, usuario)
}

func (h *UsuarioHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarUsuarioRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	usuario, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Nome, req.Email, req.Senha)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, usuario)
}

func (h *UsuarioHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "usuario removido"})
}

func (h *UsuarioHandler) BuscarNotificacoes(ctx *gin.Context) {
	usuarioId := middleware.GetUsuarioID(ctx)
	fmt.Println("> UID:", usuarioId)
	notificacoes, err := h.service.BuscarNotificacoes(ctx.Request.Context(), usuarioId)
	if  err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, notificacoes)
}
