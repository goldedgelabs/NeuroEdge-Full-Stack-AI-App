package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type FounderAgent struct{}

func NewFounderAgent() *FounderAgent { return &FounderAgent{} }

func (a *FounderAgent) Name() string { return "FounderAgent" }

func (a *FounderAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("FounderAgent received db:update", data) })
    return nil
}

func (a *FounderAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "FounderAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *FounderAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"FounderAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewFounderAgent()) }
