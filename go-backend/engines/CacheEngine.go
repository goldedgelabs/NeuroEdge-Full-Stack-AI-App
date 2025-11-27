package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type CacheEngine struct{}

func NewCacheEngine() *CacheEngine { return &CacheEngine{} }

func (e *CacheEngine) Name() string { return "CacheEngine" }

func (e *CacheEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "CacheEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "CacheEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewCacheEngine()) }
