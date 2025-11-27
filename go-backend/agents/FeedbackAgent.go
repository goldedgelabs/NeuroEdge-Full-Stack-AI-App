package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type FeedbackAgent struct{}

func NewFeedbackAgent() *FeedbackAgent { return &FeedbackAgent{} }

func (a *FeedbackAgent) Name() string { return "FeedbackAgent" }

func (a *FeedbackAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("FeedbackAgent received db:update", data) })
    return nil
}

func (a *FeedbackAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "FeedbackAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *FeedbackAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"FeedbackAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewFeedbackAgent()) }
