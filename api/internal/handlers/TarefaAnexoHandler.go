package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type TarefaAnexoHandler struct {
	service *services.TarefaAnexoService
}

type TarefaAnexoHandlerConfig struct {
	Router  *gin.Engine
	Service *services.TarefaAnexoService
	Auth    *services.AuthService
}

func NewTarefaAnexoHandler(cfg TarefaAnexoHandlerConfig) *TarefaAnexoHandler {
	handler := &TarefaAnexoHandler{service: cfg.Service}
	group := cfg.Router.Group("/tarefas/:id/anexos")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("/upload-temp", handler.UploadTemp)
	group.GET("/:anexo_id/url", handler.GerarURL)
	group.DELETE("/:anexo_id", handler.Remover)

	return handler
}

func (h *TarefaAnexoHandler) Listar(ctx *gin.Context) {
	tarefaID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "tarefa id invalido"})
		return
	}

	anexos, err := h.service.ListarPorTarefa(ctx.Request.Context(), int32(tarefaID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(anexos))
}

func (h *TarefaAnexoHandler) UploadTemp(ctx *gin.Context) {
	file, header, err := ctx.Request.FormFile("arquivo")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "arquivo invalido"})
		return
	}
	defer file.Close()

	uuid, err := h.service.UploadTemp(ctx.Request.Context(), header.Filename, file)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"uuid": uuid,
		"nome": header.Filename,
	})
}

func (h *TarefaAnexoHandler) GerarURL(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("anexo_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	url, anexo, err := h.service.GerarURL(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"url":   url,
		"anexo": anexo,
	})
}

func (h *TarefaAnexoHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("anexo_id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "anexo removido"})
}
