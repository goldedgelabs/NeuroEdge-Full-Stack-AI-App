package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type OrchestrationEngine struct{}

func NewOrchestrationEngine() *OrchestrationEngine { return &OrchestrationEngine{} }

func (e *OrchestrationEngine) Name() string { return "OrchestrationEngine" }

func (e *OrchestrationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "OrchestrationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "OrchestrationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewOrchestrationEngine()) }
