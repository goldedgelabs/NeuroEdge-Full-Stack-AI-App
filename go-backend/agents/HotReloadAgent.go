package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type HotReloadAgent struct{}

func NewHotReloadAgent() *HotReloadAgent { return &HotReloadAgent{} }

func (a *HotReloadAgent) Name() string { return "HotReloadAgent" }

func (a *HotReloadAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("HotReloadAgent received db:update", data) })
    return nil
}

func (a *HotReloadAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "HotReloadAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *HotReloadAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"HotReloadAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewHotReloadAgent()) }
