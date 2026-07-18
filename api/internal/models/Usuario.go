package models

type Usuario struct {
	Id    uint `gorm:"primaryKey"`
	Nome  string
	Senha string
}


func (Usuario) TableName() string {
	return "usuarios"
}