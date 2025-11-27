package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SimulationEngine struct{}

func NewSimulationEngine() *SimulationEngine { return &SimulationEngine{} }

func (e *SimulationEngine) Name() string { return "SimulationEngine" }

func (e *SimulationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SimulationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SimulationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewSimulationEngine()) }
