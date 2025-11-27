package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SyncAgent struct{}

func NewSyncAgent() *SyncAgent { return &SyncAgent{} }

func (a *SyncAgent) Name() string { return "SyncAgent" }

func (a *SyncAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SyncAgent received db:update", data) })
    return nil
}

func (a *SyncAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SyncAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SyncAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SyncAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSyncAgent()) }
