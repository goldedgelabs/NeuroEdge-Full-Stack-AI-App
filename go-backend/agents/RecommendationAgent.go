package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type RecommendationAgent struct{}

func NewRecommendationAgent() *RecommendationAgent { return &RecommendationAgent{} }

func (a *RecommendationAgent) Name() string { return "RecommendationAgent" }

func (a *RecommendationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("RecommendationAgent received db:update", data) })
    return nil
}

func (a *RecommendationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "RecommendationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *RecommendationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"RecommendationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewRecommendationAgent()) }
