package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type MonitoringEngine struct{}

func NewMonitoringEngine() *MonitoringEngine { return &MonitoringEngine{} }

func (e *MonitoringEngine) Name() string { return "MonitoringEngine" }

func (e *MonitoringEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "MonitoringEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "MonitoringEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewMonitoringEngine()) }
