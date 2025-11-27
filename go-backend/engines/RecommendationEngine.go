package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type RecommendationEngine struct{}

func NewRecommendationEngine() *RecommendationEngine { return &RecommendationEngine{} }

func (e *RecommendationEngine) Name() string { return "RecommendationEngine" }

func (e *RecommendationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "RecommendationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "RecommendationEngine"})
    return res, nil
}


func (e *RecommendationEngine) PostSwapTest() error {
    // run a lightweight noop payload to ensure the engine's Run path works
    _, err := e.Run(map[string]interface{}{"test":"ok"})
    return err
}

func init() {{ core.RegisterEngine(NewRecommendationEngine()) }}
