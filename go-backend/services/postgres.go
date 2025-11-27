
package services

import (
    "context"
    "os"
    "github.com/jackc/pgx/v5/pgxpool"
    "time"
    "fmt"
)

var PgPool *pgxpool.Pool

func InitPostgres(url string) error {
    if url == "" { return nil }
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    pool, err := pgxpool.New(ctx, url)
    if err != nil { return err }
    // simple ping
    ctx2, cancel2 := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel2()
    if err := pool.Ping(ctx2); err != nil { return err }
    PgPool = pool
    return nil
}

func ClosePostgres() {
    if PgPool != nil { PgPool.Close() }
}
