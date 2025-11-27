package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type InspectionAgent struct{}

func NewInspectionAgent() *InspectionAgent { return &InspectionAgent{} }

func (a *InspectionAgent) Name() string { return "InspectionAgent" }

func (a *InspectionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("InspectionAgent received db:update", data) })
    return nil
}

func (a *InspectionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "InspectionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *InspectionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"InspectionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewInspectionAgent()) }
