package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost       string
	DBPort       string
	DBUser       string
	DBPass       string
	DBName       string
	DATABASE_URL string

	S3Endpoint  string
	S3AccessKey string
	S3SecretKey string
	S3Bucket    string
	S3UseSSL    bool

	JWTSecret string

	AdminUsuario    string
	AdminPassword string

	AppPort string
}

func Load() Config {
	godotenv.Load()

	cfg := Config{
		DBHost:       os.Getenv("DB_HOST"),
		DBPort:       os.Getenv("DB_PORT"),
		DBUser:       os.Getenv("DB_USER"),
		DBPass:       os.Getenv("DB_PASS"),
		DBName:       os.Getenv("DB_NAME"),
		DATABASE_URL: os.Getenv("DATABASE_URL"),

		S3Endpoint:  os.Getenv("S3_ENDPOINT"),
		S3AccessKey: os.Getenv("S3_ACCESS_KEY"),
		S3SecretKey: os.Getenv("S3_SECRET_KEY"),
		S3Bucket:    os.Getenv("S3_BUCKET"),

		JWTSecret: os.Getenv("JWT_SECRET"),

		AdminUsuario:  os.Getenv("ADMIN_USUARIO"),
		AdminPassword: os.Getenv("ADMIN_PASSWORD"),

		AppPort: os.Getenv("APP_PORT"),
	}

	fmt.Println("cfg", cfg)

	if cfg.AppPort == "" {
		cfg.AppPort = "8080"
	}

	if cfg.S3Bucket == "" {
		cfg.S3Bucket = "tasks"
	}

	fmt.Printf("DB: %s:%s/%s\n", cfg.DBHost, cfg.DBPort, cfg.DBName)
	return cfg
}
