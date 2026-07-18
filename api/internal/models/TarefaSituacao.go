package models

import "time"

type TarefaSituacao struct {
	Id        uint `gorm:"primaryKey"`
	Descricao string
	CriadoEm  time.Time
}

func (TarefaSituacao) TableName() string {
	return "tarefas_situacoes"
}