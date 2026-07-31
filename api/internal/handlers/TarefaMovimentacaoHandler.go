package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"

	"github.com/gin-gonic/gin"
)

type TarefaMovimentacaoHandler struct {
	service *services.TarefaMovimentacaoService
}

type TarefaMovimentacaoHandlerConfig struct {
	Router  *gin.Engine
	Service *services.TarefaMovimentacaoService
	Auth    *services.AuthService
}

func NewTarefaMovimentacaoHandler(cfg TarefaMovimentacaoHandlerConfig) *TarefaMovimentacaoHandler {
	handler := &TarefaMovimentacaoHandler{service: cfg.Service}
	group := cfg.Router.Group("/tarefas/:id/movimentacoes")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:movimentacao_id", handler.BuscarPorId)
	group.PUT("/:movimentacao_id", handler.Atualizar)
	group.DELETE("/:movimentacao_id", handler.Remover)

	return handler
}

type CriarTarefaMovimentacaoRequest struct {
	SituacaoID int32  `json:"situacao_id" binding:"required"`
	Descricao  string `json:"descricao"`
}

type AtualizarTarefaMovimentacaoRequest struct {
	Descricao string `json:"descricao"`
}

func (h *TarefaMovimentacaoHandler) Listar(ctx *gin.Context) {
	tarefaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "tarefa id invalido"})
		return
	}

	movimentacoes, err := h.service.ListarPorTarefa(ctx.Request.Context(), int32(tarefaID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, movimentacoes)
}

func (h *TarefaMovimentacaoHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("movimentacao_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	movimentacao, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, movimentacao)
}

func (h *TarefaMovimentacaoHandler) Criar(ctx *gin.Context) {
	tarefaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "tarefa id invalido"})
		return
	}

	var req CriarTarefaMovimentacaoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	criadoPorID := middleware.GetUsuarioID(ctx)
	movimentacao, err := h.service.Criar(ctx.Request.Context(), int32(tarefaID), req.SituacaoID, criadoPorID, req.Descricao)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, movimentacao)
}

func (h *TarefaMovimentacaoHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("movimentacao_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarTarefaMovimentacaoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	movimentacao, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Descricao)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, movimentacao)
}

func (h *TarefaMovimentacaoHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("movimentacao_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "movimentacao removida"})
}
