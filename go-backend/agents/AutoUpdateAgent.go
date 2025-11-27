package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type AutoUpdateAgent struct{}

func NewAutoUpdateAgent() *AutoUpdateAgent { return &AutoUpdateAgent{} }

func (a *AutoUpdateAgent) Name() string { return "AutoUpdateAgent" }

func (a *AutoUpdateAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("AutoUpdateAgent received db:update", data) })
    return nil
}

func (a *AutoUpdateAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "AutoUpdateAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *AutoUpdateAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"AutoUpdateAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewAutoUpdateAgent()) }
