package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type VectorEngine struct{}

func NewVectorEngine() *VectorEngine { return &VectorEngine{} }

func (e *VectorEngine) Name() string { return "VectorEngine" }

func (e *VectorEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "VectorEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "VectorEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewVectorEngine()) }
