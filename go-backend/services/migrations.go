
package services

import (
    "context"
    "io/ioutil"
    "fmt"
    "github.com/jackc/pgx/v5/pgxpool"
)

func RunMigrations(migrationsDir string) error {
    if PgPool == nil { return fmt.Errorf("pg pool not initialized") }
    files, err := ioutil.ReadDir(migrationsDir)
    if err != nil { return err }
    for _, f := range files {
        if f.IsDir() { continue }
        b, err := ioutil.ReadFile(migrationsDir + "/" + f.Name())
        if err != nil { return err }
        _, err = PgPool.Exec(context.Background(), string(b))
        if err != nil { return err }
    }
    return nil
}
