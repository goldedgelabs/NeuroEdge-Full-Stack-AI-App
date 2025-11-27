
package handlers

import (

    "net/http"
    "encoding/json"
    "github.com/neuroedge/go-backend/core"
    "github.com/neuroedge/go-backend/engines"
    "math"
    "fmt"
    "context"
    "github.com/neuroedge/go-backend/middleware"
    "log"

    "github.com/neuroedge/go-backend/services"
)

// RestartAgentsHandler reinitializes all registered agents by calling Init()
func RestartAgentsHandler(w http.ResponseWriter, r *http.Request) {
    // require operator role ensured by middleware upstream
    agents := core.ListAgents()
    results := map[string]string{}
    for _, name := range agents {
        if ag, ok := core.GetAgent(name); ok {
            err := ag.Init()
            if err != nil {
                results[name] = "error: " + err.Error()
            } else {
                results[name] = "restarted"
            }
        } else {
            results[name] = "not found"
        }
    }
    json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "results": results})
}

// ReloadEnginesHandler attempts to call Init() on engines that support it
func ReloadEnginesHandler(w http.ResponseWriter, r *http.Request) {
    engines := core.ListEngines()
    results := map[string]string{}
    for _, name := range engines {
        en, ok := core.GetEngine(name)
        if !ok {
            results[name] = "not found"
            continue
        }
        // try to call Init() if implemented
        type initer interface{ Init() error }
        if ei, ok := en.(initer); ok {
            if err := ei.Init(); err != nil {
                results[name] = "error: " + err.Error()
                continue
            }
            results[name] = "reloaded"
        } else {
            results[name] = "no-init"
        }
    }
    json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "results": results})
}


// ReloadSingleEngineHandler reloads a single engine by name.
// query params: name (required), timeout (optional seconds)
func ReloadSingleEngineHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    if name == "" {
        http.Error(w, "missing name", 400); return
    }
    // optional timeout override
    timeoutParam := r.URL.Query().Get("timeout")
    oldTimeout := core.Conf.DrainTimeoutSeconds
    if timeoutParam != "" {
        var t int
        _, err := fmt.Sscanf(timeoutParam, "%d", &t)
        if err == nil && t > 0 {
            core.Conf.DrainTimeoutSeconds = t
        }
    }
    defer func(){ core.Conf.DrainTimeoutSeconds = oldTimeout }()

    factory, ok := engines.Constructors[name]
    if !ok || factory == nil {
        http.Error(w, "no such engine", 404); return
    }
    err := core.ReloadEngine(name, factory)
    if err != nil {
        json.NewEncoder(w).Encode(map[string]interface{}{"ok": false, "error": err.Error()})
        return
    }
    json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "engine": name})
}


// TuneIVFFlatHandler computes an appropriate `lists` parameter and recreates the ivfflat index.
// POST /admin/ivf/tune (operator only)
func TuneIVFFlatHandler(w http.ResponseWriter, r *http.Request) {
    // compute count
    ctx := context.Background()
    if services.PgPool == nil {
        http.Error(w, "postgres not initialized", 500); return
    }
    var cnt int64
    row := services.PgPool.QueryRow(ctx, "SELECT count(1) FROM vectors")
    if err := row.Scan(&cnt); err != nil {
        http.Error(w, "count fail: "+err.Error(), 500); return
    }
    lists := int64(10)
    if cnt > 0 {
        // heuristic: sqrt(N)
        lists = int64(math.Max(10, math.Sqrt(float64(cnt))))
    }
    // recreate index
    _, err := services.PgPool.Exec(ctx, "DROP INDEX IF EXISTS idx_vectors_embedding_ivfflat")
    if err != nil { http.Error(w, "drop index: "+err.Error(), 500); return }
    _, err = services.PgPool.Exec(ctx, fmt.Sprintf("CREATE INDEX idx_vectors_embedding_ivfflat ON vectors USING ivfflat (embedding vector_l2_ops) WITH (lists = %d)", lists))
    if err != nil { http.Error(w, "create index: "+err.Error(), 500); return }
    json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "count": cnt, "lists": lists})
}
