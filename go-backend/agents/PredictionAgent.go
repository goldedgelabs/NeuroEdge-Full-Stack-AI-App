package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type PredictionAgent struct{}

func NewPredictionAgent() *PredictionAgent { return &PredictionAgent{} }

func (a *PredictionAgent) Name() string { return "PredictionAgent" }

func (a *PredictionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("PredictionAgent received db:update", data) })
    return nil
}

func (a *PredictionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "PredictionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *PredictionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"PredictionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewPredictionAgent()) }
