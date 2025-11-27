package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ConversationAgent struct{}

func NewConversationAgent() *ConversationAgent { return &ConversationAgent{} }

func (a *ConversationAgent) Name() string { return "ConversationAgent" }

func (a *ConversationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ConversationAgent received db:update", data) })
    return nil
}

func (a *ConversationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ConversationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ConversationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ConversationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewConversationAgent()) }
