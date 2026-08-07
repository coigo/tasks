package handlers

import (
	"net/http"
	"strconv"
	"tasks/internal/middleware"
	"tasks/internal/models"
	"tasks/internal/services"
	"tasks/internal/utils"

	"github.com/gin-gonic/gin"
)

type TarefaHandler struct {
	service      *services.TarefaService
	anexoService *services.TarefaAnexoService
	usuarioService *services.UsuarioService
	
}

type TarefaHandlerConfig struct {
	Router         *gin.Engine
	Service        *services.TarefaService
	UsuarioService *services.UsuarioService
	AnexoService   *services.TarefaAnexoService
	Auth           *services.AuthService
}

func NewTarefaHandler(cfg TarefaHandlerConfig) *TarefaHandler {
	handler := &TarefaHandler{
		service:        cfg.Service,
		anexoService:   cfg.AnexoService,
		usuarioService: cfg.UsuarioService,
	}
	group := cfg.Router.Group("/tarefas")
	group.Use(middleware.AuthMiddleware(cfg.Auth))

	group.GET("", handler.Listar)
	group.POST("", handler.Criar)
	group.GET("/:id", handler.BuscarPorId)
	group.PUT("/:id", handler.Atualizar)
	group.PUT("/:id/mover", handler.Mover)
	group.DELETE("/:id", handler.Remover)

	return handler
}

type CriarTarefaRequest struct {
	Titulo        string   `json:"titulo" binding:"required"`
	Descricao     string   `json:"descricao"`
	ProjetoID     int32    `json:"projetoId" binding:"required"`
	ResponsavelID int32    `json:"responsavelId" binding:"required"`
	SituacaoID    int32    `json:"situacaoId" binding:"required"`
	TipoID        int32    `json:"tipoId" binding:"required"`
	InicioPrevisto *string `json:"inicioPrevisto"`
	Prazo         *string  `json:"prazo"`
	Anexos        []string `json:"anexos"`
}

type AtualizarTarefaRequest struct {
	Titulo        string  `json:"titulo" binding:"required"`
	Descricao     string  `json:"descricao"`
	ProjetoID     int32   `json:"projetoId" binding:"required"`
	ResponsavelID int32   `json:"responsavelId" binding:"required"`
	SituacaoID    int32   `json:"situacaoId" binding:"required"`
	TipoID        int32   `json:"tipoId" binding:"required"`
	InicioPrevisto *string `json:"inicioPrevisto"`
	Prazo         *string  `json:"prazo"`
}

type MoverTarefaRequest struct {
	SituacaoID int32 `json:"situacaoId" binding:"required"`
}

func (h *TarefaHandler) Listar(ctx *gin.Context) {
	responsavelID := parseQueryInt(ctx, "responsavel_id")
	situacaoID := parseQueryInt(ctx, "situacao_id")
	tipoID := parseQueryInt(ctx, "tipo_id")
	projetoID := parseQueryInt(ctx, "projeto_id")
	busca := ctx.Query("busca")
	incluirEncerradas := ctx.Query("incluir_encerradas") == "true"

	tarefas, err := h.service.Listar(ctx.Request.Context(), responsavelID, situacaoID, tipoID, projetoID, busca, incluirEncerradas)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, utils.EnsureList(tarefas))
}

func (h *TarefaHandler) BuscarPorId(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	tarefa, err := h.service.BuscarPorId(ctx.Request.Context(), int32(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tarefa)
}

func (h *TarefaHandler) Criar(ctx *gin.Context) {
	var req CriarTarefaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	criadoPorID := middleware.GetUsuarioID(ctx)
	tarefa, err := h.service.Criar(ctx.Request.Context(), req.Titulo, req.Descricao, req.ProjetoID, criadoPorID, req.ResponsavelID, req.SituacaoID, req.TipoID, req.InicioPrevisto, req.Prazo)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	if len(req.Anexos) > 0 && h.anexoService != nil {
		if _, err := h.anexoService.ConfirmarAnexos(ctx.Request.Context(), tarefa.ID, req.Anexos); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
			return
		}
	}

	err = h.usuarioService.NotificarUsuario(ctx, models.CriarUsuarioNotificacao{
		ResponsavelId: criadoPorID,
		TarefaId: tarefa.ID,
		ProjetoId: tarefa.ProjetoID,
		UsuarioNotificadoId: tarefa.ResponsavelID,
	})

	ctx.JSON(http.StatusCreated, tarefa)
}

func (h *TarefaHandler) Atualizar(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req AtualizarTarefaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "dados invalidos"})
		return
	}

	tarefa, err := h.service.Atualizar(ctx.Request.Context(), int32(id), req.Titulo, req.Descricao, req.ProjetoID, req.ResponsavelID, req.SituacaoID, req.TipoID, req.InicioPrevisto, req.Prazo)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, tarefa)
}

func (h *TarefaHandler) Remover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	if err := h.service.Remover(ctx.Request.Context(), int32(id)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "tarefa removida"})
}

func (h *TarefaHandler) Mover(ctx *gin.Context) {
	id, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "id invalido"})
		return
	}

	var req MoverTarefaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "situacao_id é obrigatório"})
		return
	}

	if err := h.service.Mover(ctx.Request.Context(), int32(id), req.SituacaoID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "tarefa movida"})
}

func parseQueryInt(ctx *gin.Context, key string) int32 {
	value := ctx.Query(key)
	if value == "" {
		return 0
	}
	v, err := strconv.Atoi(value)
	if err != nil {
		return 0
	}
	return int32(v)
}
