package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SyncEngine struct{}

func NewSyncEngine() *SyncEngine { return &SyncEngine{} }

func (e *SyncEngine) Name() string { return "SyncEngine" }

func (e *SyncEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SyncEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SyncEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewSyncEngine()) }
