package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type PhoneSecurityAgent struct{}

func NewPhoneSecurityAgent() *PhoneSecurityAgent { return &PhoneSecurityAgent{} }

func (a *PhoneSecurityAgent) Name() string { return "PhoneSecurityAgent" }

func (a *PhoneSecurityAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("PhoneSecurityAgent received db:update", data) })
    return nil
}

func (a *PhoneSecurityAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "PhoneSecurityAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *PhoneSecurityAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"PhoneSecurityAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewPhoneSecurityAgent()) }
