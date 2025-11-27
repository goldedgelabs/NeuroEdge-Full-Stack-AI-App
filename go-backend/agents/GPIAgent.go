package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type GPIAgent struct{}

func NewGPIAgent() *GPIAgent { return &GPIAgent{} }

func (a *GPIAgent) Name() string { return "GPIAgent" }

func (a *GPIAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("GPIAgent received db:update", data) })
    return nil
}

func (a *GPIAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "GPIAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *GPIAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"GPIAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewGPIAgent()) }
