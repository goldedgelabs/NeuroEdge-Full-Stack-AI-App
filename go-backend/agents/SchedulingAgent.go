package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SchedulingAgent struct{}

func NewSchedulingAgent() *SchedulingAgent { return &SchedulingAgent{} }

func (a *SchedulingAgent) Name() string { return "SchedulingAgent" }

func (a *SchedulingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SchedulingAgent received db:update", data) })
    return nil
}

func (a *SchedulingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SchedulingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SchedulingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SchedulingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSchedulingAgent()) }
