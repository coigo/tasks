package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
    DBHost string
    DBPort string
    DBUser string
    DBPass string
    DBName string
    DATABASE_URL string
}

func Load() Config {

    godotenv.Load()

	fmt.Println(os.Getenv("DB_HOST"))
	fmt.Println(os.Getenv("DB_PORT"))
	fmt.Println(os.Getenv("DB_USER"))
	fmt.Println(os.Getenv("DB_PASS"))
	fmt.Println(os.Getenv("DB_NAME"))		
	fmt.Println(os.Getenv("DB_NAME"))		
    return Config{

        DBHost: os.Getenv("DB_HOST"),
        DBPort: os.Getenv("DB_PORT"),
        DBUser: os.Getenv("DB_USER"),
        DBPass: os.Getenv("DB_PASS"),
        DBName: os.Getenv("DB_NAME"),
        DATABASE_URL: os.Getenv("DATABASE_URL"),
    }
}