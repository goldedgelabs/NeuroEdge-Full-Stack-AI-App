package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type VisualizationEngine struct{}

func NewVisualizationEngine() *VisualizationEngine { return &VisualizationEngine{} }

func (e *VisualizationEngine) Name() string { return "VisualizationEngine" }

func (e *VisualizationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "VisualizationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "VisualizationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewVisualizationEngine()) }
