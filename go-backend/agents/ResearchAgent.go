package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ResearchAgent struct{}

func NewResearchAgent() *ResearchAgent { return &ResearchAgent{} }

func (a *ResearchAgent) Name() string { return "ResearchAgent" }

func (a *ResearchAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ResearchAgent received db:update", data) })
    return nil
}

func (a *ResearchAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ResearchAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ResearchAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ResearchAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewResearchAgent()) }
