package models

import "time"

type Projeto struct {
	Id   		uint `gorm:"primaryKey"`
	Nome 		string
	CriadoEm 	time.Time
	DeletadoEm 	time.Time
}

func (Projeto) TableName() string {
	return "projetos"
}