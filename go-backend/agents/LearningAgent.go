package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type LearningAgent struct{}

func NewLearningAgent() *LearningAgent { return &LearningAgent{} }

func (a *LearningAgent) Name() string { return "LearningAgent" }

func (a *LearningAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("LearningAgent received db:update", data) })
    return nil
}

func (a *LearningAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "LearningAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *LearningAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"LearningAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewLearningAgent()) }
