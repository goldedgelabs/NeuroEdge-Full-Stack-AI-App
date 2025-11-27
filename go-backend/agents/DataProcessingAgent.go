package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DataProcessingAgent struct{}

func NewDataProcessingAgent() *DataProcessingAgent { return &DataProcessingAgent{} }

func (a *DataProcessingAgent) Name() string { return "DataProcessingAgent" }

func (a *DataProcessingAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DataProcessingAgent received db:update", data) })
    return nil
}

func (a *DataProcessingAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DataProcessingAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DataProcessingAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DataProcessingAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDataProcessingAgent()) }
