package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type TarefaTipoHandler struct {
	service *services.TarefaTipoService
}

type TarefaTipoHandlerConfig struct {
	Router  *gin.Engine
	Service *services.TarefaTipoService
	Auth    *services.AuthService
}

func NewTarefaTipoHandler(cfg TarefaTipoHandlerConfig) *TarefaTipoHandler {
	handler := &TarefaTipoHandler{service: cfg.Service}
	group := cfg.Router.Group("/tarefas-tipos")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:id", handler.BuscarPorId)
	group.PUT("/:id", handler.Atualizar)
	group.DELETE("/:id", handler.Remover)

	return handler
}

type CriarTarefaTipoRequest struct {
	Descricao string `json:"descricao" binding:"required"`
}

type AtualizarTarefaTipoRequest struct {
	Descricao string `json:"descricao" binding:"required"`
}

func (h *TarefaTipoHandler) Listar(ctx *gin.Context) {
	tipos, err := h.service.Listar(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(tipos))
}

func (h *TarefaTipoHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	tipo, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tipo)
}

func (h *TarefaTipoHandler) Criar(ctx *gin.Context) {
	var req CriarTarefaTipoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	tipo, err := h.service.Criar(ctx.Request.Context(), req.Descricao)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, tipo)
}

func (h *TarefaTipoHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarTarefaTipoRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	tipo, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Descricao)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tipo)
}

func (h *TarefaTipoHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "tipo removido"})
}
