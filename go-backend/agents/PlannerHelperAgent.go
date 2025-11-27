package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type PlannerHelperAgent struct{}

func NewPlannerHelperAgent() *PlannerHelperAgent { return &PlannerHelperAgent{} }

func (a *PlannerHelperAgent) Name() string { return "PlannerHelperAgent" }

func (a *PlannerHelperAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("PlannerHelperAgent received db:update", data) })
    return nil
}

func (a *PlannerHelperAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "PlannerHelperAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *PlannerHelperAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"PlannerHelperAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewPlannerHelperAgent()) }
