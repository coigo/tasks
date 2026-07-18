package models

import "time"

type TarefaAnexo struct {
	Id        uint `gorm:"primaryKey"`
	Tarefa    Tarefa
	Nome      string
	Local     string
	Descricao string
	CriadoEm  time.Time
}

func (TarefaAnexo) TableName() string {
	return "tarefas_anexos"
}