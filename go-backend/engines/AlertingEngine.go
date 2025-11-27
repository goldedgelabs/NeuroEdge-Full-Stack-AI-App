package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type AlertingEngine struct{}

func NewAlertingEngine() *AlertingEngine { return &AlertingEngine{} }

func (e *AlertingEngine) Name() string { return "AlertingEngine" }

func (e *AlertingEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "AlertingEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "AlertingEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewAlertingEngine()) }
