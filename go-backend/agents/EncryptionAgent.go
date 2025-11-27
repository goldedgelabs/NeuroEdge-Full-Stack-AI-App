package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type EncryptionAgent struct{}

func NewEncryptionAgent() *EncryptionAgent { return &EncryptionAgent{} }

func (a *EncryptionAgent) Name() string { return "EncryptionAgent" }

func (a *EncryptionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("EncryptionAgent received db:update", data) })
    return nil
}

func (a *EncryptionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "EncryptionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *EncryptionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"EncryptionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewEncryptionAgent()) }
