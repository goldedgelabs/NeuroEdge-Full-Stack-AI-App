package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type IndexEngine struct{}

func NewIndexEngine() *IndexEngine { return &IndexEngine{} }

func (e *IndexEngine) Name() string { return "IndexEngine" }

func (e *IndexEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "IndexEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "IndexEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewIndexEngine()) }
