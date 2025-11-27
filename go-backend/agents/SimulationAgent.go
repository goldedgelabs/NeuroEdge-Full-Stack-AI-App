package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type SimulationAgent struct{}

func NewSimulationAgent() *SimulationAgent { return &SimulationAgent{} }

func (a *SimulationAgent) Name() string { return "SimulationAgent" }

func (a *SimulationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("SimulationAgent received db:update", data) })
    return nil
}

func (a *SimulationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "SimulationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *SimulationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"SimulationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewSimulationAgent()) }
