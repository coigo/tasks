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
	Router gin.IRouter
	Config config.Config
}

func New(ctx context.Context, cfg *ContainerConfig) error {
	db := repository.New(cfg.Pool)

	s3Storage, err := storage.NewS3Storage(ctx, storage.S3StorageConfig{
		Endpoint:  cfg.Config.S3Endpoint,
		AccessKey: cfg.Config.S3AccessKey,
		SecretKey: cfg.Config.S3SecretKey,
		Bucket:    cfg.Config.S3Bucket,
		UseSSL:    cfg.Config.S3UseSSL,
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
	tarefaHistoricoService := services.NewTarefaHistoricoService(db)
	tarefaService := services.NewTarefaService(db, db, db, db, tarefaHistoricoService)
	tarefaAnexoService := services.NewTarefaAnexoService(db, s3Storage)
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
		Router:         cfg.Router,
		Service:        tarefaService,
		AnexoService:   tarefaAnexoService,
		UsuarioService: usuarioService,
		Auth:           authService,
	})

	handlers.NewTarefaHistoricoHandler(handlers.TarefaHistoricoHandlerConfig{
		Router:  cfg.Router,
		Service: tarefaHistoricoService,
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
