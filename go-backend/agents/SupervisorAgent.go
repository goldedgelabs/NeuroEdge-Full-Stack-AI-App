package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SupervisorAgent struct{}

func NewSupervisorAgent() *SupervisorAgent { return &SupervisorAgent{} }

func (a *SupervisorAgent) Name() string { return "SupervisorAgent" }

func (a *SupervisorAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SupervisorAgent received db:update", data) })
    return nil
}

func (a *SupervisorAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SupervisorAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SupervisorAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SupervisorAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSupervisorAgent()) }
