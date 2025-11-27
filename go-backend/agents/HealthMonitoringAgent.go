package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type HealthMonitoringAgent struct{}

func NewHealthMonitoringAgent() *HealthMonitoringAgent { return &HealthMonitoringAgent{} }

func (a *HealthMonitoringAgent) Name() string { return "HealthMonitoringAgent" }

func (a *HealthMonitoringAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("HealthMonitoringAgent received db:update", data) })
    return nil
}

func (a *HealthMonitoringAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "HealthMonitoringAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *HealthMonitoringAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"HealthMonitoringAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewHealthMonitoringAgent()) }
