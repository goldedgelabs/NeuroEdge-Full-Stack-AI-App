package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type QueryEngine struct{}

func NewQueryEngine() *QueryEngine { return &QueryEngine{} }

func (e *QueryEngine) Name() string { return "QueryEngine" }

func (e *QueryEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "QueryEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "QueryEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewQueryEngine()) }
