package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type WorkerAgent struct{}

func NewWorkerAgent() *WorkerAgent { return &WorkerAgent{} }

func (a *WorkerAgent) Name() string { return "WorkerAgent" }

func (a *WorkerAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("WorkerAgent received db:update", data) })
    return nil
}

func (a *WorkerAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "WorkerAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *WorkerAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"WorkerAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewWorkerAgent()) }
