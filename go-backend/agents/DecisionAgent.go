package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DecisionAgent struct{}

func NewDecisionAgent() *DecisionAgent { return &DecisionAgent{} }

func (a *DecisionAgent) Name() string { return "DecisionAgent" }

func (a *DecisionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DecisionAgent received db:update", data) })
    return nil
}

func (a *DecisionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DecisionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DecisionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DecisionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDecisionAgent()) }
