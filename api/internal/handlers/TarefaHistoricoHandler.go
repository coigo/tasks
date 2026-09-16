package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type TarefaHistoricoHandler struct {
	service *services.TarefaHistoricoService
}

type TarefaHistoricoHandlerConfig struct {
	Router  gin.IRouter
	Service *services.TarefaHistoricoService
	Auth    *services.AuthService
}

func NewTarefaHistoricoHandler(cfg TarefaHistoricoHandlerConfig) *TarefaHistoricoHandler {
	handler := &TarefaHistoricoHandler{service: cfg.Service}
	group := cfg.Router.Group("/tarefas/:id/historico")

	handler.registerRoutes(group, cfg.Auth)

	return handler
}

func (h *TarefaHistoricoHandler) registerRoutes(group *gin.RouterGroup, auth *services.AuthService) {
	group.GET("", h.Listar)
}

func (h *TarefaHistoricoHandler) Listar(ctx *gin.Context) {
	tarefaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "tarefa id invalido"})
		return
	}

	historico, err := h.service.ListarPorTarefa(ctx.Request.Context(), int32(tarefaID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(historico))
}
