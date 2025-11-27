package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DistributedTaskAgent struct{}

func NewDistributedTaskAgent() *DistributedTaskAgent { return &DistributedTaskAgent{} }

func (a *DistributedTaskAgent) Name() string { return "DistributedTaskAgent" }

func (a *DistributedTaskAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DistributedTaskAgent received db:update", data) })
    return nil
}

func (a *DistributedTaskAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DistributedTaskAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DistributedTaskAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DistributedTaskAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDistributedTaskAgent()) }
