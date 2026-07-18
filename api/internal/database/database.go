package database

import (
	"context"
	"tasks/internal/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect (ctx context.Context, cfg config.Config) (*pgxpool.Pool, error) {
	stringConn := cfg.DATABASE_URL

	pool, err := pgxpool.New(ctx, stringConn)
	if err != nil {
		return nil, err
	}

	err = pool.Ping(ctx)
	if err != nil {
		return nil, err
	}

	return pool, nil
}