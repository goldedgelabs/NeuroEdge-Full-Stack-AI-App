package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type GoldEdgeIntegrationAgent struct{}

func NewGoldEdgeIntegrationAgent() *GoldEdgeIntegrationAgent { return &GoldEdgeIntegrationAgent{} }

func (a *GoldEdgeIntegrationAgent) Name() string { return "GoldEdgeIntegrationAgent" }

func (a *GoldEdgeIntegrationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("GoldEdgeIntegrationAgent received db:update", data) })
    return nil
}

func (a *GoldEdgeIntegrationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "GoldEdgeIntegrationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *GoldEdgeIntegrationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"GoldEdgeIntegrationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewGoldEdgeIntegrationAgent()) }
