package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type CollaborationAgent struct{}

func NewCollaborationAgent() *CollaborationAgent { return &CollaborationAgent{} }

func (a *CollaborationAgent) Name() string { return "CollaborationAgent" }

func (a *CollaborationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("CollaborationAgent received db:update", data) })
    return nil
}

func (a *CollaborationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "CollaborationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *CollaborationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"CollaborationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewCollaborationAgent()) }
