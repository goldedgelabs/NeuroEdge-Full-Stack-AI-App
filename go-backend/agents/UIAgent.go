package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type UIAgent struct{}

func NewUIAgent() *UIAgent { return &UIAgent{} }

func (a *UIAgent) Name() string { return "UIAgent" }

func (a *UIAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("UIAgent received db:update", data) })
    return nil
}

func (a *UIAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "UIAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *UIAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"UIAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewUIAgent()) }
