package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type TelemetryAgent struct{}

func NewTelemetryAgent() *TelemetryAgent { return &TelemetryAgent{} }

func (a *TelemetryAgent) Name() string { return "TelemetryAgent" }

func (a *TelemetryAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("TelemetryAgent received db:update", data) })
    return nil
}

func (a *TelemetryAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "TelemetryAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *TelemetryAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"TelemetryAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewTelemetryAgent()) }
