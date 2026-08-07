package handlers

import (
	"net/http"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
)

type RelatorioHandler struct {
	tarefaService   *services.TarefaService
	relatorioService *services.RelatorioService
}

type RelatorioHandlerConfig struct {
	Router           *gin.Engine
	TarefaService    *services.TarefaService
	RelatorioService *services.RelatorioService
	Auth             *services.AuthService
}

func NewRelatorioHandler(cfg RelatorioHandlerConfig) *RelatorioHandler {
	handler := &RelatorioHandler{
		tarefaService:    cfg.TarefaService,
		relatorioService: cfg.RelatorioService,
	}
	group := cfg.Router.Group("/relatorios")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("/metricas", handler.Metricas)
	group.GET("/periodo", handler.TarefasMovimentadasNoPeriodo)

	return handler
}

func (h *RelatorioHandler) Metricas(ctx *gin.Context) {
	dataInicioStr := ctx.Query("data_inicio")
	dataFimStr := ctx.Query("data_fim")

	if dataInicioStr == "" || dataFimStr == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "data_inicio e data_fim sao obrigatorios"})
		return
	}

	dataInicio, err := time.Parse("2006-01-02", dataInicioStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "data_inicio invalida, use YYYY-MM-DD"})
		return
	}

	dataFim, err := time.Parse("2006-01-02", dataFimStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "data_fim invalida, use YYYY-MM-DD"})
		return
	}
	dataFim = dataFim.Add(24*time.Hour - time.Second)

	metricas, err := h.tarefaService.Metricas(ctx.Request.Context(), dataInicio, dataFim)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, metricas)
}

func (h *RelatorioHandler) TarefasMovimentadasNoPeriodo(ctx *gin.Context) {
	dataInicioStr := ctx.Query("data_inicio")
	dataFimStr := ctx.Query("data_fim")
	responsavelID := parseQueryInt(ctx, "responsavel_id")

	dataInicio, err := time.Parse("2006-01-02", dataInicioStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "data_inicio invalida, use YYYY-MM-DD"})
		return
	}

	dataFim, err := time.Parse("2006-01-02", dataFimStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "data_fim invalida, use YYYY-MM-DD"})
		return
	}
	dataFim = dataFim.Add(24*time.Hour - time.Second)

	tarefas, err := h.relatorioService.TarefasMovimentadasNoPeriodo(ctx.Request.Context(), dataInicio, dataFim, responsavelID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(tarefas))
}
