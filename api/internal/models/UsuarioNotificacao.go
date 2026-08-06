package models

type UsuarioNotificacao struct {
	ID 					int64 	`json:"id"`
	Mensagem 			string 	`json:"mensagem"`
	RedirecionarPara 	string 	`json:"redirecionarPara"`
	Lido 					bool 		`json:"lido"`
	CriadoEm 			string 	`json:"criadoEm"`
}

type CriarUsuarioNotificacao struct {
	ResponsavelId 			int32
	UsuarioNotificadoId 	int32
	TarefaId					int32
	ProjetoId 				int32	
	
}

type LerNotificacao struct {
	ID 			int64
	UsuarioId 	int32 
}