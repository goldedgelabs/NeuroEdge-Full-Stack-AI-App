package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DoctrineAgent struct{}

func NewDoctrineAgent() *DoctrineAgent { return &DoctrineAgent{} }

func (a *DoctrineAgent) Name() string { return "DoctrineAgent" }

func (a *DoctrineAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DoctrineAgent received db:update", data) })
    return nil
}

func (a *DoctrineAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DoctrineAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DoctrineAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DoctrineAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDoctrineAgent()) }
