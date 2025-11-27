package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ComplianceAgent struct{}

func NewComplianceAgent() *ComplianceAgent { return &ComplianceAgent{} }

func (a *ComplianceAgent) Name() string { return "ComplianceAgent" }

func (a *ComplianceAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ComplianceAgent received db:update", data) })
    return nil
}

func (a *ComplianceAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ComplianceAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ComplianceAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ComplianceAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewComplianceAgent()) }
