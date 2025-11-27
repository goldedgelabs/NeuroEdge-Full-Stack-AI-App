package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type AuditTrailEngine struct{}

func NewAuditTrailEngine() *AuditTrailEngine { return &AuditTrailEngine{} }

func (e *AuditTrailEngine) Name() string { return "AuditTrailEngine" }

func (e *AuditTrailEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "AuditTrailEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "AuditTrailEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewAuditTrailEngine()) }
