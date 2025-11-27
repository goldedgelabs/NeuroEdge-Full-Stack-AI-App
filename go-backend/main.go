
package main

import (

    "net/http"
    otelhttp "go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
    "os"
    "github.com/neuroedge/go-backend/services"
    "fmt"
    "net/http"
    "os"
    "time"
    "log"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
    chcors "github.com/go-chi/cors"

    "github.com/neuroedge/go-backend/core"
    "github.com/neuroedge/go-backend/handlers"
    _ "github.com/neuroedge/go-backend/agents"
    _ "github.com/neuroedge/go-backend/engines"

    "context"
    "os/signal"
    "syscall"
)

func main() {
    _ = core.LoadConfig("")
    core.InitLogger(core.Conf.ServiceName)
    core.Log("starting NeuroEdge Go backend (chi)")
    db := core.GetDB()
    db.Init(core.Conf.PersistFile, core.Conf.Persist)
    // init services
    services.InitRedis(os.Getenv("REDIS_URL"))
    _ = services.InitPostgres(os.Getenv("POSTGRES_URL"))
    core.InitMetrics()
    // init tracing
    shutdownTracing := core.InitTracing(context.Background())
    defer func(){ _ = shutdownTracing(context.Background()) }()

    // health handler mount
    // replace mux with chi route mount remains
    
    r := chi.NewRouter()
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Recoverer)
    r.Use(middleware.Logger)
    r.Use(chcors.Handler(chcors.Options{
        AllowedOrigins:   []string{"*"},
        AllowedMethods:   []string{"GET","POST","PUT","DELETE","OPTIONS"},
        AllowedHeaders:   []string{"Accept","Authorization","Content-Type","X-CSRF-Token","X-API-Key"},
        ExposedHeaders:   []string{"Link"},
        AllowCredentials: false,
        MaxAge: 300,
    }))
    // register core routes
    mux := http.NewServeMux()
    core.RegisterRoutes(mux)
    r.Mount("/", mux)
    // auth endpoints
    r.Post("/api/auth/login", func(w http.ResponseWriter, r *http.Request){ handlers.LoginHandler(w,r) })
    r.Post("/api/auth/refresh", func(w http.ResponseWriter, r *http.Request){ handlers.RefreshHandler(w,r) })

// admin endpoints (operator only)
r.Group(func(r chi.Router) {
    r.Use(middleware.JWTMiddleware)
    r.Use(middleware.RequireAPIKey) // optional API key for internal services
    r.Post("/admin/agents/restart", func(w http.ResponseWriter, r *http.Request){ handlers.RestartAgentsHandler(w,r) })
    r.Post("/admin/engines/reload", func(w http.ResponseWriter, r *http.Request){ handlers.ReloadEnginesHandler(w,r) })
        r.Post("/admin/engine/reload", func(w http.ResponseWriter, r *http.Request){ handlers.ReloadSingleEngineHandler(w,r) })
        r.Post("/admin/ivf/tune", func(w http.ResponseWriter, r *http.Request){ handlers.TuneIVFFlatHandler(w,r) })
})


    r.HandleFunc("/healthz", core.HealthCheckHandler)
    // metrics endpoint is registered by InitMetrics on default mux at /metrics
    
    addr := fmt.Sprintf(":%d", core.Conf.Port)
    core.Log("listening on " + addr)
    srv := &http.Server{Addr: addr, Handler: otelhttp.NewHandler(r, "http.server"), ReadTimeout: 15*time.Second, WriteTimeout: 15*time.Second, IdleTimeout: 60*time.Second}
    log.Fatal(srv.ListenAndServe())
}
