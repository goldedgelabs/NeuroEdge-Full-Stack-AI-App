package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type EvolutionAgent struct{}

func NewEvolutionAgent() *EvolutionAgent { return &EvolutionAgent{} }

func (a *EvolutionAgent) Name() string { return "EvolutionAgent" }

func (a *EvolutionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("EvolutionAgent received db:update", data) })
    return nil
}

func (a *EvolutionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "EvolutionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *EvolutionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"EvolutionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewEvolutionAgent()) }
