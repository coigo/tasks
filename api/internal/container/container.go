package container

import (
	"tasks/internal/handlers"
	"tasks/internal/repository"
	"tasks/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContainerConfig struct {
	Pool 	*pgxpool.Pool
	Router	*gin.Engine
}

func New (cfg *ContainerConfig) {
	db := repository.New(cfg.Pool)

	
	projetoService := services.NewProjetoService(db)

	projetoHandlerConfig := handlers.HandlerConfig {
		GinContext: cfg.Router,
		Service: *projetoService,
	}

	handlers.NewProjetoHandler(projetoHandlerConfig)
}