package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DataIngestAgent struct{}

func NewDataIngestAgent() *DataIngestAgent { return &DataIngestAgent{} }

func (a *DataIngestAgent) Name() string { return "DataIngestAgent" }

func (a *DataIngestAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DataIngestAgent received db:update", data) })
    return nil
}

func (a *DataIngestAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DataIngestAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DataIngestAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DataIngestAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDataIngestAgent()) }
