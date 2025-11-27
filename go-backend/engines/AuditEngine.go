package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type AuditEngine struct{}

func NewAuditEngine() *AuditEngine { return &AuditEngine{} }

func (e *AuditEngine) Name() string { return "AuditEngine" }

func (e *AuditEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "AuditEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "AuditEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewAuditEngine()) }
