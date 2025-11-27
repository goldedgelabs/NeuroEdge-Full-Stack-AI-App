package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type FeatureStoreEngine struct{}

func NewFeatureStoreEngine() *FeatureStoreEngine { return &FeatureStoreEngine{} }

func (e *FeatureStoreEngine) Name() string { return "FeatureStoreEngine" }

func (e *FeatureStoreEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "FeatureStoreEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "FeatureStoreEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewFeatureStoreEngine()) }
