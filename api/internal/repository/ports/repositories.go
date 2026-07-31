package ports

import (
	"context"
	"tasks/internal/repository"
)

type IProjetoRepository interface {
	CreateProjeto(ctx context.Context, nome string) (repository.Projeto, error)
	GetProjetoById(ctx context.Context, id int32) (repository.Projeto, error)
	ListProjetos(ctx context.Context) ([]repository.Projeto, error)
	UpdateProjeto(ctx context.Context, arg repository.UpdateProjetoParams) (repository.Projeto, error)
	DeleteProjeto(ctx context.Context, id int32) error
}

type IUsuarioRepository interface {
	CreateUsuario(ctx context.Context, arg repository.CreateUsuarioParams) (repository.CreateUsuarioRow, error)
	GetUsuarioById(ctx context.Context, id int32) (repository.Usuario, error)
	GetUsuarioByEmail(ctx context.Context, email string) (repository.Usuario, error)
	ListUsuarios(ctx context.Context) ([]repository.ListUsuariosRow, error)
	UpdateUsuario(ctx context.Context, arg repository.UpdateUsuarioParams) (repository.UpdateUsuarioRow, error)
	DeleteUsuario(ctx context.Context, id int32) error
}

type ITarefaSituacaoRepository interface {
	CreateTarefaSituacao(ctx context.Context, arg repository.CreateTarefaSituacaoParams) (repository.TarefasSituaco, error)
	GetTarefaSituacaoById(ctx context.Context, id int32) (repository.TarefasSituaco, error)
	ListTarefaSituacoes(ctx context.Context) ([]repository.TarefasSituaco, error)
	UpdateTarefaSituacao(ctx context.Context, arg repository.UpdateTarefaSituacaoParams) (repository.TarefasSituaco, error)
	DeleteTarefaSituacao(ctx context.Context, id int32) error
}

type ITarefaTipoRepository interface {
	CreateTarefaTipo(ctx context.Context, descricao string) (repository.TarefasTipo, error)
	GetTarefaTipoById(ctx context.Context, id int32) (repository.TarefasTipo, error)
	ListTarefaTipos(ctx context.Context) ([]repository.TarefasTipo, error)
	UpdateTarefaTipo(ctx context.Context, arg repository.UpdateTarefaTipoParams) (repository.TarefasTipo, error)
	DeleteTarefaTipo(ctx context.Context, id int32) error
}

type ITarefaRepository interface {
	CreateTarefa(ctx context.Context, arg repository.CreateTarefaParams) (repository.Tarefa, error)
	GetTarefaById(ctx context.Context, id int32) (repository.GetTarefaByIdRow, error)
	ListTarefas(ctx context.Context, arg repository.ListTarefasParams) ([]repository.ListTarefasRow, error)
	UpdateTarefa(ctx context.Context, arg repository.UpdateTarefaParams) (repository.Tarefa, error)
	UpdateSituacaoTarefa(ctx context.Context, arg repository.UpdateSituacaoTarefaParams) error
	DeleteTarefa(ctx context.Context, id int32) error
	GetMaxNumeroTarefaByAno(ctx context.Context, ano int32) (interface{}, error)
	CountTarefasBySituacao(ctx context.Context) ([]repository.CountTarefasBySituacaoRow, error)
	CountTarefasByTipo(ctx context.Context) ([]repository.CountTarefasByTipoRow, error)
	CountTarefasResponsavel(ctx context.Context) ([]repository.CountTarefasResponsavelRow, error)
	ListTarefasMovimentadasNoPeriodo(ctx context.Context, arg repository.ListTarefasMovimentadasNoPeriodoParams) ([]repository.ListTarefasMovimentadasNoPeriodoRow, error)
}

type ITarefaMovimentacaoRepository interface {
	CreateTarefaMovimentacao(ctx context.Context, arg repository.CreateTarefaMovimentacaoParams) (repository.TarefasMovimentaco, error)
	GetTarefaMovimentacaoById(ctx context.Context, id int32) (repository.TarefasMovimentaco, error)
	ListTarefaMovimentacoesByTarefa(ctx context.Context, tarefaID int32) ([]repository.ListTarefaMovimentacoesByTarefaRow, error)
	UpdateTarefaMovimentacao(ctx context.Context, arg repository.UpdateTarefaMovimentacaoParams) (repository.TarefasMovimentaco, error)
	DeleteTarefaMovimentacao(ctx context.Context, id int32) error
}

type ITarefaAnexoRepository interface {
	CreateTarefaAnexo(ctx context.Context, arg repository.CreateTarefaAnexoParams) (repository.TarefasAnexo, error)
	GetTarefaAnexoById(ctx context.Context, id int32) (repository.TarefasAnexo, error)
	ListTarefaAnexosByTarefa(ctx context.Context, tarefaID int32) ([]repository.TarefasAnexo, error)
	DeleteTarefaAnexo(ctx context.Context, id int32) error
}
