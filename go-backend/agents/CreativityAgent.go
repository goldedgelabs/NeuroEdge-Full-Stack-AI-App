package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type CreativityAgent struct{}

func NewCreativityAgent() *CreativityAgent { return &CreativityAgent{} }

func (a *CreativityAgent) Name() string { return "CreativityAgent" }

func (a *CreativityAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("CreativityAgent received db:update", data) })
    return nil
}

func (a *CreativityAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "CreativityAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *CreativityAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"CreativityAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewCreativityAgent()) }
