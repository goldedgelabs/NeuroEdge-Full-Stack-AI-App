package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SchedulerEngine struct{}

func NewSchedulerEngine() *SchedulerEngine { return &SchedulerEngine{} }

func (e *SchedulerEngine) Name() string { return "SchedulerEngine" }

func (e *SchedulerEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SchedulerEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SchedulerEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewSchedulerEngine()) }
