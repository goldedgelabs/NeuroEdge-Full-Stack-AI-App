package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type ReasoningEngine struct{}

func NewReasoningEngine() *ReasoningEngine { return &ReasoningEngine{} }

func (e *ReasoningEngine) Name() string { return "ReasoningEngine" }

func (e *ReasoningEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "ReasoningEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "ReasoningEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewReasoningEngine()) }
