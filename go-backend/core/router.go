package core

import (
    "encoding/json"
    "net/http"
    "time"
    "fmt"
)

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        duration := time.Since(start)
        Log(map[string]interface{}{"method": r.Method, "path": r.URL.Path, "duration_ms": duration.Milliseconds()})
    })
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{"status":"ok","service":Conf.ServiceName})
}

func runEngineHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    var payload map[string]interface{}
    _ = json.NewDecoder(r.Body).Decode(&payload)
    res, err := RunEngine(name, payload)
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }
    json.NewEncoder(w).Encode(res)
}

func runAgentHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    var payload map[string]interface{}
    _ = json.NewDecoder(r.Body).Decode(&payload)
    ag, ok := GetAgent(name)
    if !ok {
        http.Error(w, "agent not found", 404)
        return
    }
    core.AgentRuns.WithLabelValues(name).Inc()
    res, err := ag.Run(payload)
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }
    json.NewEncoder(w).Encode(res)
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]interface{}{"agents": ListAgents(), "engines": ListEngines(), "uptime_seconds": int(time.Since(startTime).Seconds())})
}

var startTime time.Time

func RegisterRoutes(mux *http.ServeMux) {
    startTime = time.Now()
    mux.HandleFunc("/health", healthHandler)
    mux.HandleFunc("/runEngine", runEngineHandler)
    mux.HandleFunc("/runAgent", runAgentHandler)
    mux.HandleFunc("/status", statusHandler)
    mux.HandleFunc("/health/engine", engineHealthHandler)
    mux.HandleFunc("/health/engines", enginesHealthHandler)
}


func engineHealthHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    if name == "" {
        json.NewEncoder(w).Encode(map[string]interface{}{"engines": ListEngines()})
        return
    }
    en, ok := GetEngine(name)
    if !ok {
        http.Error(w, "engine not found", 404)
        return
    }
    // call SelfTest if available
    type selftester interface{ SelfTest() error }
    if st, ok := en.(selftester); ok {
        if err := st.SelfTest(); err != nil {
            http.Error(w, "unhealthy: "+err.Error(), 500)
            return
        }
    }
    json.NewEncoder(w).Encode(map[string]interface{}{"engine": name, "status": "ok"})
}


func enginesHealthHandler(w http.ResponseWriter, r *http.Request) {
    engines := ListEngines()
    results := map[string]string{}
    for _, name := range engines {
        en, ok := GetEngine(name)
        if !ok {
            results[name] = "not_found"
            continue
        }
        type selftester interface{ SelfTest() error }
        ok2 := true
        if st, ok := en.(selftester); ok {
            ch := make(chan error, 1)
            go func() { ch <- st.SelfTest() }()
            select {
            case err := <-ch:
                if err != nil { results[name] = "unhealthy: " + err.Error(); ok2 = false } else { results[name] = "ok" }
            case <-time.After(2 * time.Second):
                results[name] = "timeout"; ok2 = false
            }
        } else {
            results[name] = "no-test"
        }
        _ = ok2
    }
    json.NewEncoder(w).Encode(map[string]interface{}{"engines": results})
}
