package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type TarefaSituacaoHandler struct {
	service *services.TarefaSituacaoService
}

type TarefaSituacaoHandlerConfig struct {
	Router  *gin.Engine
	Service *services.TarefaSituacaoService
	Auth    *services.AuthService
}

func NewTarefaSituacaoHandler(cfg TarefaSituacaoHandlerConfig) *TarefaSituacaoHandler {
	handler := &TarefaSituacaoHandler{service: cfg.Service}
	group := cfg.Router.Group("/tarefas-situacoes")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:id", handler.BuscarPorId)
	group.PUT("/:id", handler.Atualizar)
	group.DELETE("/:id", handler.Remover)

	return handler
}

type CriarTarefaSituacaoRequest struct {
	Descricao     string `json:"descricao" binding:"required"`
	EncerraTarefa bool   `json:"encerra_tarefa"`
}

type AtualizarTarefaSituacaoRequest struct {
	Descricao     string `json:"descricao" binding:"required"`
	EncerraTarefa bool   `json:"encerra_tarefa"`
}

func (h *TarefaSituacaoHandler) Listar(ctx *gin.Context) {
	situacoes, err := h.service.Listar(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(situacoes))
}

func (h *TarefaSituacaoHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	situacao, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, situacao)
}

func (h *TarefaSituacaoHandler) Criar(ctx *gin.Context) {
	var req CriarTarefaSituacaoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	situacao, err := h.service.Criar(ctx.Request.Context(), req.Descricao, req.EncerraTarefa)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, situacao)
}

func (h *TarefaSituacaoHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarTarefaSituacaoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	situacao, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Descricao, req.EncerraTarefa)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, situacao)
}

func (h *TarefaSituacaoHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "situacao removida"})
}
