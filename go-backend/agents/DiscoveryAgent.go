package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DiscoveryAgent struct{}

func NewDiscoveryAgent() *DiscoveryAgent { return &DiscoveryAgent{} }

func (a *DiscoveryAgent) Name() string { return "DiscoveryAgent" }

func (a *DiscoveryAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DiscoveryAgent received db:update", data) })
    return nil
}

func (a *DiscoveryAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DiscoveryAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DiscoveryAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DiscoveryAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDiscoveryAgent()) }
