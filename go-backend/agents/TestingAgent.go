package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type TestingAgent struct{}

func NewTestingAgent() *TestingAgent { return &TestingAgent{} }

func (a *TestingAgent) Name() string { return "TestingAgent" }

func (a *TestingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("TestingAgent received db:update", data) })
    return nil
}

func (a *TestingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "TestingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *TestingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"TestingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewTestingAgent()) }
