package models

type UsuarioNotificacao struct {
	Mensagem 			string 	`json:"mensagem"`
	RedirecionarPara 	string 	`json:"redirecionarPara"`
	Lido 				bool 	`json:"lido"`
	CriadoEm 			string 	`json:"criadoEm"`
}

type CriarUsuarioNotificacao struct {
	ResponsavelId 		int32
	UsuarioNotificadoId int32
	TarefaId			int32
	ProjetoId 			int32	
	
}