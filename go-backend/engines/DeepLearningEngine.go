package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type DeepLearningEngine struct{}

func NewDeepLearningEngine() *DeepLearningEngine { return &DeepLearningEngine{} }

func (e *DeepLearningEngine) Name() string { return "DeepLearningEngine" }

func (e *DeepLearningEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "DeepLearningEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "DeepLearningEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewDeepLearningEngine()) }
