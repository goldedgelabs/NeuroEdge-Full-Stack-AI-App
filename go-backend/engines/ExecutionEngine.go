package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type ExecutionEngine struct{}

func NewExecutionEngine() *ExecutionEngine { return &ExecutionEngine{} }

func (e *ExecutionEngine) Name() string { return "ExecutionEngine" }

func (e *ExecutionEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "ExecutionEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "ExecutionEngine"})
    return res, nil
}


func (e *ExecutionEngine) PostSwapTest() error {
    // run a lightweight noop payload to ensure the engine's Run path works
    _, err := e.Run(map[string]interface{}{"test":"ok"})
    return err
}

func init() {{ core.RegisterEngine(NewExecutionEngine()) }}
