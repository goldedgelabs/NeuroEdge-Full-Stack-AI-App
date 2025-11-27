package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type RoutingAgent struct{}

func NewRoutingAgent() *RoutingAgent { return &RoutingAgent{} }

func (a *RoutingAgent) Name() string { return "RoutingAgent" }

func (a *RoutingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("RoutingAgent received db:update", data) })
    return nil
}

func (a *RoutingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "RoutingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *RoutingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"RoutingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewRoutingAgent()) }
