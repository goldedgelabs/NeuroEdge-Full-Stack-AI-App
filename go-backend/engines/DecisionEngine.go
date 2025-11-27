package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type DecisionEngine struct{}

func NewDecisionEngine() *DecisionEngine { return &DecisionEngine{} }

func (e *DecisionEngine) Name() string { return "DecisionEngine" }

func (e *DecisionEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "DecisionEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "DecisionEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewDecisionEngine()) }
