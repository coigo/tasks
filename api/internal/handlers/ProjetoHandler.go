package handlers

import (
	"net/http"
	"tasks/internal/services"

	"github.com/gin-gonic/gin"
)

type ProjetoHandler struct {
	service services.ProjetoService
}

type HandlerConfig struct {
	GinContext 	*gin.Engine
	Service 	services.ProjetoService
}

func NewProjetoHandler (cfg HandlerConfig ) *ProjetoHandler {
	handler := &ProjetoHandler{}
	handler.service = cfg.Service
	group := cfg.GinContext.Group("/projetos")

	group.GET("/:id", handler.BuscarPorId)

	return handler
}

type BuscarProjetoRequest struct {
	Id int32 `uri:"id" binding:"required"`
}

func (h ProjetoHandler) BuscarPorId (ctx *gin.Context) {
	c := ctx.Request.Context()
	var req BuscarProjetoRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	projeto, err := h.service.BuscarPorId(c, req.Id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Projeto nao encontrado:"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": projeto})
}