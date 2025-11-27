package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type ConnectorEngine struct{}

func NewConnectorEngine() *ConnectorEngine { return &ConnectorEngine{} }

func (e *ConnectorEngine) Name() string { return "ConnectorEngine" }

func (e *ConnectorEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "ConnectorEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "ConnectorEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewConnectorEngine()) }
