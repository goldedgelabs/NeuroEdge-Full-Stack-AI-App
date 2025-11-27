package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type PredictionEngine struct{}

func NewPredictionEngine() *PredictionEngine { return &PredictionEngine{} }

func (e *PredictionEngine) Name() string { return "PredictionEngine" }

func (e *PredictionEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "PredictionEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "PredictionEngine"})
    return res, nil
}


func (e *PredictionEngine) PostSwapTest() error {
    // run a lightweight noop payload to ensure the engine's Run path works
    _, err := e.Run(map[string]interface{}{"test":"ok"})
    return err
}

func init() {{ core.RegisterEngine(NewPredictionEngine()) }}
