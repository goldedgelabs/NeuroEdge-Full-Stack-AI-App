package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type LoadBalancingAgent struct{}

func NewLoadBalancingAgent() *LoadBalancingAgent { return &LoadBalancingAgent{} }

func (a *LoadBalancingAgent) Name() string { return "LoadBalancingAgent" }

func (a *LoadBalancingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("LoadBalancingAgent received db:update", data) })
    return nil
}

func (a *LoadBalancingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "LoadBalancingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *LoadBalancingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"LoadBalancingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewLoadBalancingAgent()) }
