package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SummarizationEngine struct{}

func NewSummarizationEngine() *SummarizationEngine { return &SummarizationEngine{} }

func (e *SummarizationEngine) Name() string { return "SummarizationEngine" }

func (e *SummarizationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SummarizationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SummarizationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewSummarizationEngine()) }
