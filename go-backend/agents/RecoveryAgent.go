package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type RecoveryAgent struct{}

func NewRecoveryAgent() *RecoveryAgent { return &RecoveryAgent{} }

func (a *RecoveryAgent) Name() string { return "RecoveryAgent" }

func (a *RecoveryAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("RecoveryAgent received db:update", data) })
    return nil
}

func (a *RecoveryAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "RecoveryAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *RecoveryAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"RecoveryAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewRecoveryAgent()) }
