package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SummarizationAgent struct{}

func NewSummarizationAgent() *SummarizationAgent { return &SummarizationAgent{} }

func (a *SummarizationAgent) Name() string { return "SummarizationAgent" }

func (a *SummarizationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SummarizationAgent received db:update", data) })
    return nil
}

func (a *SummarizationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SummarizationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SummarizationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SummarizationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSummarizationAgent()) }
