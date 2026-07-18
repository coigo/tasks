package main

import (
	"context"
	"tasks/internal/config"
	"tasks/internal/container"
	"tasks/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main () {

	ctx := context.Background()

	err := godotenv.Load() 
    if err != nil {
        panic(err)
    }

	cfg := config.Load()

	pool, err := database.Connect(ctx, cfg)
	if err != nil {
		panic(err)
	}

	router := gin.Default()

	containerConfig := container.ContainerConfig {
		Pool: pool,
		Router: router,
	}
	
	container.New(&containerConfig)
	router.Run()
	// router.GET("/", func(ctx *gin.Context) {

	// })
}

