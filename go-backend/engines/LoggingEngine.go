package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type LoggingEngine struct{}

func NewLoggingEngine() *LoggingEngine { return &LoggingEngine{} }

func (e *LoggingEngine) Name() string { return "LoggingEngine" }

func (e *LoggingEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "LoggingEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "LoggingEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewLoggingEngine()) }
