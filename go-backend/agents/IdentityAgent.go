package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type IdentityAgent struct{}

func NewIdentityAgent() *IdentityAgent { return &IdentityAgent{} }

func (a *IdentityAgent) Name() string { return "IdentityAgent" }

func (a *IdentityAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("IdentityAgent received db:update", data) })
    return nil
}

func (a *IdentityAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "IdentityAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *IdentityAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"IdentityAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewIdentityAgent()) }
