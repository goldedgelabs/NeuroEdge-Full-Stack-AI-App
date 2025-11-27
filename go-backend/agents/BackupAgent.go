package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type BackupAgent struct{}

func NewBackupAgent() *BackupAgent { return &BackupAgent{} }

func (a *BackupAgent) Name() string { return "BackupAgent" }

func (a *BackupAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("BackupAgent received db:update", data) })
    return nil
}

func (a *BackupAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "BackupAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *BackupAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"BackupAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewBackupAgent()) }
