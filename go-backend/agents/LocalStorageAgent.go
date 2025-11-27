package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type LocalStorageAgent struct{}

func NewLocalStorageAgent() *LocalStorageAgent { return &LocalStorageAgent{} }

func (a *LocalStorageAgent) Name() string { return "LocalStorageAgent" }

func (a *LocalStorageAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("LocalStorageAgent received db:update", data) })
    return nil
}

func (a *LocalStorageAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "LocalStorageAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *LocalStorageAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"LocalStorageAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewLocalStorageAgent()) }
