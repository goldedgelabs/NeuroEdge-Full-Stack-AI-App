package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type MetricsAgent struct{}

func NewMetricsAgent() *MetricsAgent { return &MetricsAgent{} }

func (a *MetricsAgent) Name() string { return "MetricsAgent" }

func (a *MetricsAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("MetricsAgent received db:update", data) })
    return nil
}

func (a *MetricsAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "MetricsAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *MetricsAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"MetricsAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewMetricsAgent()) }
