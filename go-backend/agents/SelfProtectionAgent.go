package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SelfProtectionAgent struct{}

func NewSelfProtectionAgent() *SelfProtectionAgent { return &SelfProtectionAgent{} }

func (a *SelfProtectionAgent) Name() string { return "SelfProtectionAgent" }

func (a *SelfProtectionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SelfProtectionAgent received db:update", data) })
    return nil
}

func (a *SelfProtectionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SelfProtectionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SelfProtectionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SelfProtectionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSelfProtectionAgent()) }
