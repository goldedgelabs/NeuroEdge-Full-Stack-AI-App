package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type IngestionEngine struct{}

func NewIngestionEngine() *IngestionEngine { return &IngestionEngine{} }

func (e *IngestionEngine) Name() string { return "IngestionEngine" }

func (e *IngestionEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "IngestionEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "IngestionEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewIngestionEngine()) }
