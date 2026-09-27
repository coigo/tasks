package container

import (
	"context"
	"tasks/internal/config"
	"tasks/internal/handlers"
	"tasks/internal/llm"
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

	prompt := `Você é um assistente técnico especialista em documentações de software, projetado para auxiliar desenvolvedores e analistas de sistemas.
	
	Sua tarefa é responder às dúvidas dos usuários utilizando como fonte primária o CONTEXTO fornecido ao final deste prompt.
	
	Siga estritamente as regras abaixo:
	
	1. USO DO CONTEXTO E CONHECIMENTO GERAL:
   - Responda priorizando e fundamentando sua resposta nos dados do CONTEXTO.
   - Se a informação solicitada estiver parcialmente presente no CONTEXTO, responda com o que encontrou e, se necessário, complemente brevemente com seu conhecimento técnico geral para dar clareza à solução.
   - Caso a informação NÃO esteja presente no CONTEXTO e você precise usar conhecimento geral, explicite claramente com um aviso (ex: "Nota: Esta informação não foi encontrada na documentação do projeto, mas tecnicamente...").
   - Se a dúvida for totalmente fora do escopo ou você não tiver dados suficientes no CONTEXTO nem no seu conhecimento técnico, declare de forma direta que a informação não foi encontrada na documentação.
	
	2. ESTILO E FORMATO DAS RESPOSTAS:
   - Tom de voz: Técnico, direto e objetivo, focado em resolução de problemas.
   - Idioma: Responda SEMPRE em Português do Brasil (PT-BR), mesmo que os trechos da documentação estejam em Inglês.
   - Estrutura: Forneça respostas curtas e objetivas. Inclua trechos de código, comandos ou configurações em blocos Markdown apenas quando estritamente necessário para enriquecer a explicação.
   - Mantenha a clareza tanto para desenvolvedores quanto para analistas de sistemas.
	
	3. RESTRIÇÕES:
   - Não invente parâmetros, rotas, variáveis de ambiente ou comportamentos de código que não existam ou que firam o CONTEXTO.
   - Não mencione os nomes dos arquivos ou trechos do contexto na resposta final (ex: evite dizer "Segundo o documento X..."). Apenas responda ao usuário de forma fluida.`
	
	llmProvider := llm.NewLLMProvider(ctx, llm.OpenAiConfig{BasePrompt: prompt})
	
	authService := services.NewAuthService(db)
	usuarioService := services.NewUsuarioService(db, authService)
	projetoService := services.NewProjetoService(db, *llmProvider)
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
