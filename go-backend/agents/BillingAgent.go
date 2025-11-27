package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type BillingAgent struct{}

func NewBillingAgent() *BillingAgent { return &BillingAgent{} }

func (a *BillingAgent) Name() string { return "BillingAgent" }

func (a *BillingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("BillingAgent received db:update", data) })
    return nil
}

func (a *BillingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "BillingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *BillingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"BillingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewBillingAgent()) }
