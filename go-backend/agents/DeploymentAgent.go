package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DeploymentAgent struct{}

func NewDeploymentAgent() *DeploymentAgent { return &DeploymentAgent{} }

func (a *DeploymentAgent) Name() string { return "DeploymentAgent" }

func (a *DeploymentAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DeploymentAgent received db:update", data) })
    return nil
}

func (a *DeploymentAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DeploymentAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DeploymentAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DeploymentAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDeploymentAgent()) }
