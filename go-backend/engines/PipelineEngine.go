package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type PipelineEngine struct{}

func NewPipelineEngine() *PipelineEngine { return &PipelineEngine{} }

func (e *PipelineEngine) Name() string { return "PipelineEngine" }

func (e *PipelineEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "PipelineEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "PipelineEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewPipelineEngine()) }
