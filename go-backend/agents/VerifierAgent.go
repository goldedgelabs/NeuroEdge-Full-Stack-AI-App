package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type VerifierAgent struct{}

func NewVerifierAgent() *VerifierAgent { return &VerifierAgent{} }

func (a *VerifierAgent) Name() string { return "VerifierAgent" }

func (a *VerifierAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("VerifierAgent received db:update", data) })
    return nil
}

func (a *VerifierAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "VerifierAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *VerifierAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"VerifierAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewVerifierAgent()) }
