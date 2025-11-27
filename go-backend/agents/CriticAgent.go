package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type CriticAgent struct{}

func NewCriticAgent() *CriticAgent { return &CriticAgent{} }

func (a *CriticAgent) Name() string { return "CriticAgent" }

func (a *CriticAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("CriticAgent received db:update", data) })
    return nil
}

func (a *CriticAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "CriticAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *CriticAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"CriticAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewCriticAgent()) }
