package models

import "time"

type Tarefa struct {
	Id          uint `gorm:"primaryKey"`
	Numero      int
	Ano         int
	Descricao   string
	CriadoPor   Usuario
	Responsavel Usuario
	Situacao    TarefaSituacao
	Tipo        TarefaTipo
	TarefaPaiID *int
	CriadoEm    time.Time //date
	UltimaMovEm time.Time //date
}

func (Tarefa) TableName() string {
	return "tarefas"
}