package models

import "time"

type TarefaSituacao struct {
	Id            uint   `gorm:"primaryKey"`
	Descricao     string
	EncerraTarefa bool
	Cor           string
	CriadoEm      time.Time
}

func (TarefaSituacao) TableName() string {
	return "tarefas_situacoes"
}