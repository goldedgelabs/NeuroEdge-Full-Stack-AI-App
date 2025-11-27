package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type OfflineAgent struct{}

func NewOfflineAgent() *OfflineAgent { return &OfflineAgent{} }

func (a *OfflineAgent) Name() string { return "OfflineAgent" }

func (a *OfflineAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("OfflineAgent received db:update", data) })
    return nil
}

func (a *OfflineAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "OfflineAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *OfflineAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"OfflineAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewOfflineAgent()) }
