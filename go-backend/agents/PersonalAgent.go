package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type PersonalAgent struct{}

func NewPersonalAgent() *PersonalAgent { return &PersonalAgent{} }

func (a *PersonalAgent) Name() string { return "PersonalAgent" }

func (a *PersonalAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("PersonalAgent received db:update", data) })
    return nil
}

func (a *PersonalAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "PersonalAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *PersonalAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"PersonalAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewPersonalAgent()) }
