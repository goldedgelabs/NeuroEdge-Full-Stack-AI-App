package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ValidationAgent struct{}

func NewValidationAgent() *ValidationAgent { return &ValidationAgent{} }

func (a *ValidationAgent) Name() string { return "ValidationAgent" }

func (a *ValidationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ValidationAgent received db:update", data) })
    return nil
}

func (a *ValidationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ValidationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ValidationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ValidationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewValidationAgent()) }
