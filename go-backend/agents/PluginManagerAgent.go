package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type PluginManagerAgent struct{}

func NewPluginManagerAgent() *PluginManagerAgent { return &PluginManagerAgent{} }

func (a *PluginManagerAgent) Name() string { return "PluginManagerAgent" }

func (a *PluginManagerAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("PluginManagerAgent received db:update", data) })
    return nil
}

func (a *PluginManagerAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "PluginManagerAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *PluginManagerAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"PluginManagerAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewPluginManagerAgent()) }
