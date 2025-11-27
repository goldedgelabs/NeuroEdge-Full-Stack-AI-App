package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type RoutingEngine struct{}

func NewRoutingEngine() *RoutingEngine { return &RoutingEngine{} }

func (e *RoutingEngine) Name() string { return "RoutingEngine" }

func (e *RoutingEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "RoutingEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "RoutingEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewRoutingEngine()) }
