package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type AnalyticsAgent struct{}

func NewAnalyticsAgent() *AnalyticsAgent { return &AnalyticsAgent{} }

func (a *AnalyticsAgent) Name() string { return "AnalyticsAgent" }

func (a *AnalyticsAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("AnalyticsAgent received db:update", data) })
    return nil
}

func (a *AnalyticsAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "AnalyticsAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *AnalyticsAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"AnalyticsAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewAnalyticsAgent()) }
