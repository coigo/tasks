package container

import (
	"context"
	"tasks/internal/config"
	"tasks/internal/handlers"
	"tasks/internal/repository"
	"tasks/internal/services"
	"tasks/internal/storage"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ContainerConfig struct {
	Pool   *pgxpool.Pool
	Router *gin.Engine
	Config config.Config
}

func New(ctx context.Context, cfg *ContainerConfig) error {
	db := repository.New(cfg.Pool)

	minioStorage, err := storage.NewMinioStorage(ctx, storage.MinioStorageConfig{
		Endpoint:  cfg.Config.MinioEndpoint,
		AccessKey: cfg.Config.MinioAccessKey,
		SecretKey: cfg.Config.MinioSecretKey,
		Bucket:    cfg.Config.MinioBucket,
		UseSSL:    cfg.Config.MinioUseSSL,
		TempDir:   "/temp",
	})
	if err != nil {
		return err
	}

	authService := services.NewAuthService(db)
	usuarioService := services.NewUsuarioService(db, authService)
	projetoService := services.NewProjetoService(db)
	tarefaSituacaoService := services.NewTarefaSituacaoService(db)
	tarefaTipoService := services.NewTarefaTipoService(db)
	tarefaService := services.NewTarefaService(db)
	tarefaMovimentacaoService := services.NewTarefaMovimentacaoService(db, db)
	tarefaAnexoService := services.NewTarefaAnexoService(db, minioStorage)
	relatorioService := services.NewRelatorioService(db)

	if err := usuarioService.SeedAdmin(ctx); err != nil {
		return err
	}

	handlers.NewAuthHandler(handlers.AuthHandlerConfig{
		Router:      cfg.Router,
		AuthService: authService,
	})

	handlers.NewUsuarioHandler(handlers.UsuarioHandlerConfig{
		Router:  cfg.Router,
		Service: usuarioService,
		Auth:    authService,
	})

	handlers.NewProjetoHandler(handlers.ProjetoHandlerConfig{
		Router:  cfg.Router,
		Service: projetoService,
		Auth:    authService,
	})

	handlers.NewTarefaSituacaoHandler(handlers.TarefaSituacaoHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaSituacaoService,
		Auth:    authService,
	})

	handlers.NewTarefaTipoHandler(handlers.TarefaTipoHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaTipoService,
		Auth:    authService,
	})

	handlers.NewTarefaHandler(handlers.TarefaHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaService,
		Auth:    authService,
	})

	handlers.NewTarefaMovimentacaoHandler(handlers.TarefaMovimentacaoHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaMovimentacaoService,
		Auth:    authService,
	})

	handlers.NewTarefaAnexoHandler(handlers.TarefaAnexoHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaAnexoService,
		Auth:    authService,
	})

	handlers.NewRelatorioHandler(handlers.RelatorioHandlerConfig{
		Router:           cfg.Router,
		TarefaService:    tarefaService,
		RelatorioService: relatorioService,
		Auth:             authService,
	})

	return nil
}
