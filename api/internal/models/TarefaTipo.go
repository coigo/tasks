package models

import "time"

type TarefaTipo struct {
	Id        uint `gorm:"primaryKey"`
	Descricao string
	CriadoEm  time.Time
}

func (TarefaTipo) TableName() string {
	return "tarefas_tipo"
}