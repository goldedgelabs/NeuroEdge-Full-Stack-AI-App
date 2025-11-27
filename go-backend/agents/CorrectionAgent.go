package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type CorrectionAgent struct{}

func NewCorrectionAgent() *CorrectionAgent { return &CorrectionAgent{} }

func (a *CorrectionAgent) Name() string { return "CorrectionAgent" }

func (a *CorrectionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("CorrectionAgent received db:update", data) })
    return nil
}

func (a *CorrectionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "CorrectionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *CorrectionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"CorrectionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewCorrectionAgent()) }
