package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type AntiTheftAgent struct{}

func NewAntiTheftAgent() *AntiTheftAgent { return &AntiTheftAgent{} }

func (a *AntiTheftAgent) Name() string { return "AntiTheftAgent" }

func (a *AntiTheftAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("AntiTheftAgent received db:update", data) })
    return nil
}

func (a *AntiTheftAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "AntiTheftAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *AntiTheftAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"AntiTheftAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewAntiTheftAgent()) }
