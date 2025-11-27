package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type AnalyticsEngine struct{}

func NewAnalyticsEngine() *AnalyticsEngine { return &AnalyticsEngine{} }

func (e *AnalyticsEngine) Name() string { return "AnalyticsEngine" }

func (e *AnalyticsEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "AnalyticsEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "AnalyticsEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewAnalyticsEngine()) }
