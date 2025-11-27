
package engines

import (

    pgxvector "github.com/pgvector/pgvector-go/pgx"
    "github.com/pgvector/pgvector-go"
    "github.com/jackc/pgx/v5/pgtype"
    "os"
    "strings"
    "github.com/neuroedge/go-backend/core"
    "github.com/neuroedge/go-backend/services"
    "context"
    "fmt"
    "github.com/jackc/pgx/v5/pgxpool"
    "encoding/json"
    "time"

)

type StorageEngine struct {
    pool *pgxpool.Pool
}

func NewStorageEngine() *StorageEngine {
    return &StorageEngine{pool: services.PgPool}
}

func (s *StorageEngine) Name() string { return "StorageEngine" }


func (s *StorageEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    if s.pool == nil {
        return nil, fmt.Errorf("postgres not initialized")
    }
    action, _ := payload["action"].(string)
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    dim := 1536
    if dstr := os.Getenv("PGVECTOR_DIM"); dstr != "" {
        var dv int
        fmt.Sscanf(dstr, "%d", &dv)
        if dv > 0 { dim = dv }
    }
    switch action {
    case "upsert":
        id, _ := payload["id"].(string)
        vecInterface, ok := payload["vector"].([]interface{})
        if !ok { return nil, fmt.Errorf("invalid vector") }
        // convert vector to string form "[0.1,0.2,...]"
        parts := make([]string, len(vecInterface))
        for i, v := range vecInterface { parts[i] = fmt.Sprintf("%v", v) }
        vecStr := "[" + strings.Join(parts, ",") + "]"
        // insert/replace using pgvector cast
        _, err := s.pool.Exec(ctx, "INSERT INTO vectors (id, embedding) VALUES ($1, $2::vector) ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding", id, vecStr)
        if err != nil { return nil, err }
        core.GetEventBus().Publish("vector:upsert", map[string]interface{}{"id": id})
        return map[string]interface{}{"status":"ok","id":id}, nil
    case "query":
        vecInterface, ok := payload["vector"].([]interface{})
        if !ok { return nil, fmt.Errorf("invalid vector") }
        parts := make([]string, len(vecInterface))
        for i, v := range vecInterface { parts[i] = fmt.Sprintf("%v", v) }
        vecStr := "[" + strings.Join(parts, ",") + "]"
        // use pgvector distance operator <-> for approximate nearest neighbor
        row := s.pool.QueryRow(ctx, "SELECT id, embedding <-> $1::vector AS dist FROM vectors ORDER BY dist LIMIT 1", vecStr)
        var id string
        var dist float64
        if err := row.Scan(&id, &dist); err != nil { return nil, err }
        return map[string]interface{}{"id":id,"dist":dist}, nil
    case "delete":
        id, _ := payload["id"].(string)
        _, err := s.pool.Exec(ctx, "DELETE FROM vectors WHERE id=$1", id)
        if err != nil { return nil, err }
        core.GetEventBus().Publish("vector:delete", map[string]interface{}{"id": id})
        return map[string]interface{}{"status":"deleted","id":id}, nil
    default:
        return map[string]interface{}{"status":"noop"}, nil
    }
}
) (map[string]interface{}, error) {
    // ensure DB available
    if s.pool == nil {
        return nil, fmt.Errorf("postgres not initialized")
    }
    action, _ := payload["action"].(string)
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    switch action {
    case "upsert":
        id, _ := payload["id"].(string)
        vecInterface, ok := payload["vector"].([]interface{})
        if !ok { return nil, fmt.Errorf("invalid vector") }
        // convert to float64 slice and then to pg array
        vec := make([]float64, len(vecInterface))
        for i, v := range vecInterface { vec[i] = v.(float64) }
        // upsert
        _, err := s.pool.Exec(ctx, "INSERT INTO vectors (id, vector) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET vector = EXCLUDED.vector", id, vec)
        if err != nil { return nil, err }
        core.GetEventBus().Publish("vector:upsert", map[string]interface{}{"id": id})
        return map[string]interface{}{"status":"ok","id":id}, nil
    case "query":
        vecInterface, ok := payload["vector"].([]interface{})
        if !ok { return nil, fmt.Errorf("invalid vector") }
        vec := make([]float64, len(vecInterface))
        for i, v := range vecInterface { vec[i] = v.(float64) }
        // naive approach: fetch all vectors and compute nearest in app
        rows, err := s.pool.Query(ctx, "SELECT id, vector FROM vectors")
        if err != nil { return nil, err }
        defer rows.Close()
        bestId := ""
        bestDist := 1e18
        for rows.Next() {
            var id string
            var v []float64
            if err := rows.Scan(&id, &v); err != nil { continue }
            if len(v) != len(vec) { continue }
            d := 0.0
            for i := range v { diff := v[i]-vec[i]; d += diff*diff }
            if d < bestDist { bestDist = d; bestId = id }
        }
        return map[string]interface{}{"id":bestId,"dist":bestDist}, nil
    case "delete":
        id, _ := payload["id"].(string)
        _, err := s.pool.Exec(ctx, "DELETE FROM vectors WHERE id=$1", id)
        if err != nil { return nil, err }
        core.GetEventBus().Publish("vector:delete", map[string]interface{}{"id": id})
        return map[string]interface{}{"status":"deleted","id":id}, nil
    default:
        return map[string]interface{}{"status":"noop"}, nil
    }
}


func (s *StorageEngine) SelfTest() error {
    if s.pool == nil { return fmt.Errorf("pg pool nil") }
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    if err := s.pool.Ping(ctx); err != nil { return err }
    return nil
}

func (s *StorageEngine) Shutdown() error {
    // no-op; pool is shared globally
    return nil
}



func (s *StorageEngine) PostSwapTest() error {
    // perform a lightweight select count to ensure queries work
    if s.pool == nil { return fmt.Errorf("pg pool nil") }
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    var cnt int64
    row := s.pool.QueryRow(ctx, "SELECT count(1) FROM vectors")
    if err := row.Scan(&cnt); err != nil {
        return err
    }
    return nil
}

func init() { core.RegisterEngine(NewStorageEngine()) }



func (s *StorageEngine) RunWithContext(ctx context.Context, payload map[string]interface{}) (map[string]interface{}, error) {
    // default implementation: ignore ctx and call Run - engines that need context can override this
    return s.Run(payload)
}
