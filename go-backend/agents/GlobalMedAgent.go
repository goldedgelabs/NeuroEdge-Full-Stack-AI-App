package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type GlobalMedAgent struct{}

func NewGlobalMedAgent() *GlobalMedAgent { return &GlobalMedAgent{} }

func (a *GlobalMedAgent) Name() string { return "GlobalMedAgent" }

func (a *GlobalMedAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("GlobalMedAgent received db:update", data) })
    return nil
}

func (a *GlobalMedAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "GlobalMedAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *GlobalMedAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"GlobalMedAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewGlobalMedAgent()) }
