
package core

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
    "net/http"
)

var (
    ReloadSuccesses = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "neuroedge_engine_reload_success_total",
        Help: "Total successful engine reloads",
    }, []string{"engine"})

    ReloadFailures = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "neuroedge_engine_reload_failures_total",
        Help: "Total failed engine reloads",
    }, []string{"engine"})

    EngineRuns = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "neuroedge_engine_runs_total",
        Help: "Total engine runs",
    }, []string{"engine"})

    AgentRuns = prometheus.NewCounterVec(prometheus.CounterOpts{
        Name: "neuroedge_agent_runs_total",
        Help: "Total agent runs",
    }, []string{"agent"})
)

func InitMetrics() {
    RegisterReloadMetrics()
    prometheus.MustRegister(EngineRuns)
    prometheus.MustRegister(AgentRuns)
    http.Handle("/metrics", promhttp.Handler())
}

func RegisterReloadMetrics() {
    prometheus.MustRegister(ReloadSuccesses)
    prometheus.MustRegister(ReloadFailures)
}
