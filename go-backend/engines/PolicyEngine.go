package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type PolicyEngine struct{}

func NewPolicyEngine() *PolicyEngine { return &PolicyEngine{} }

func (e *PolicyEngine) Name() string { return "PolicyEngine" }

func (e *PolicyEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "PolicyEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "PolicyEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewPolicyEngine()) }
