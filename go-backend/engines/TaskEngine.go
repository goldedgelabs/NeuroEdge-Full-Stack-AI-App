package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type TaskEngine struct{}

func NewTaskEngine() *TaskEngine { return &TaskEngine{} }

func (e *TaskEngine) Name() string { return "TaskEngine" }

func (e *TaskEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "TaskEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "TaskEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewTaskEngine()) }
