package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type AggregationEngine struct{}

func NewAggregationEngine() *AggregationEngine { return &AggregationEngine{} }

func (e *AggregationEngine) Name() string { return "AggregationEngine" }

func (e *AggregationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "AggregationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "AggregationEngine"})
    return res, nil
}


func (e *AggregationEngine) PostSwapTest() error {
    // run a lightweight noop payload to ensure the engine's Run path works
    _, err := e.Run(map[string]interface{}{"test":"ok"})
    return err
}

func init() {{ core.RegisterEngine(NewAggregationEngine()) }}
