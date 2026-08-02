package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type ProjetoHandler struct {
	service *services.ProjetoService
}

type ProjetoHandlerConfig struct {
	Router  *gin.Engine
	Service *services.ProjetoService
	Auth    *services.AuthService
}

func NewProjetoHandler(cfg ProjetoHandlerConfig) *ProjetoHandler {
	handler := &ProjetoHandler{service: cfg.Service}
	group := cfg.Router.Group("/projetos")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:id", handler.BuscarPorId)
	group.PUT("/:id", handler.Atualizar)
	group.DELETE("/:id", handler.Remover)

	return handler
}

type CriarProjetoRequest struct {
	Nome string `json:"nome" binding:"required"`
}

type AtualizarProjetoRequest struct {
	Nome string `json:"nome" binding:"required"`
}

func (h *ProjetoHandler) Listar(ctx *gin.Context) {
	projetos, err := h.service.Listar(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(projetos))
}

func (h *ProjetoHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	projeto, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, projeto)
}

func (h *ProjetoHandler) Criar(ctx *gin.Context) {
	var req CriarProjetoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	projeto, err := h.service.Criar(ctx.Request.Context(), req.Nome)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, projeto)
}

func (h *ProjetoHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarProjetoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	projeto, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Nome)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, projeto)
}

func (h *ProjetoHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "projeto removido"})
}
