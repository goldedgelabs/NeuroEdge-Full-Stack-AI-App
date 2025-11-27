package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SecurityAgent struct{}

func NewSecurityAgent() *SecurityAgent { return &SecurityAgent{} }

func (a *SecurityAgent) Name() string { return "SecurityAgent" }

func (a *SecurityAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SecurityAgent received db:update", data) })
    return nil
}

func (a *SecurityAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SecurityAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SecurityAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SecurityAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSecurityAgent()) }
