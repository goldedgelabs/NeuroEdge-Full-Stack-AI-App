package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type OrchestrationAgent struct{}

func NewOrchestrationAgent() *OrchestrationAgent { return &OrchestrationAgent{} }

func (a *OrchestrationAgent) Name() string { return "OrchestrationAgent" }

func (a *OrchestrationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("OrchestrationAgent received db:update", data) })
    return nil
}

func (a *OrchestrationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "OrchestrationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *OrchestrationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"OrchestrationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewOrchestrationAgent()) }
