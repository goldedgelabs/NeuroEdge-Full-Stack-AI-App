package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SecurityEngine struct{}

func NewSecurityEngine() *SecurityEngine { return &SecurityEngine{} }

func (e *SecurityEngine) Name() string { return "SecurityEngine" }

func (e *SecurityEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SecurityEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SecurityEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewSecurityEngine()) }
