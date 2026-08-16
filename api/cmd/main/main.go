package main

import (
	"context"
	"fmt"
	"tasks/internal/config"
	"tasks/internal/container"
	"tasks/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	ctx := context.Background()

	if err := godotenv.Load(); err != nil {
		fmt.Println("aviso: .env nao encontrado, usando variaveis de ambiente")
	}

	cfg := config.Load()

	if err := database.RunMigrations(ctx, cfg); err != nil {
		panic(err)
	}

	pool, err := database.Connect(ctx, cfg)
	if err != nil {
		panic(err)
	}

	router := gin.Default()
	router.Use(corsMiddleware())
	apiGroup := router.Group("/api")
	
	containerConfig := container.ContainerConfig{
		Pool:   pool,
		Router: apiGroup,
		Config: cfg,
	}
	
	if err := container.New(ctx, &containerConfig); err != nil {
		panic(err)
	}

	router.Static("/assets", "./internal/static/assets")
	router.StaticFile("/favicon.ico", "./internal/static/favicon.ico")
	
	
	router.NoRoute(func (c *gin.Context) {
		c.File("./internal/static/index.html")
	})
	
	port := cfg.AppPort
	if port == "" {
		port = "8080"
	}
	if err := router.Run(":" + port); err != nil {
		panic(err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		ctx.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")

		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}
		ctx.Next()
	}
}
