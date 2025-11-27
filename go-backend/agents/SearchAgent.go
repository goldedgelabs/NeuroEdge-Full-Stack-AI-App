package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SearchAgent struct{}

func NewSearchAgent() *SearchAgent { return &SearchAgent{} }

func (a *SearchAgent) Name() string { return "SearchAgent" }

func (a *SearchAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SearchAgent received db:update", data) })
    return nil
}

func (a *SearchAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SearchAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SearchAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SearchAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSearchAgent()) }
