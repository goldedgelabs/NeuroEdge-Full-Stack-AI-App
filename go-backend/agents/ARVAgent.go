package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ARVAgent struct{}

func NewARVAgent() *ARVAgent { return &ARVAgent{} }

func (a *ARVAgent) Name() string { return "ARVAgent" }

func (a *ARVAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ARVAgent received db:update", data) })
    return nil
}

func (a *ARVAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ARVAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ARVAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ARVAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewARVAgent()) }
