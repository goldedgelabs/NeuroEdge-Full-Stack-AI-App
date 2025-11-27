package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type MonitoringAgent struct{}

func NewMonitoringAgent() *MonitoringAgent { return &MonitoringAgent{} }

func (a *MonitoringAgent) Name() string { return "MonitoringAgent" }

func (a *MonitoringAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("MonitoringAgent received db:update", data) })
    return nil
}

func (a *MonitoringAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "MonitoringAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *MonitoringAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"MonitoringAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewMonitoringAgent()) }
