package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type UserModelEngine struct{}

func NewUserModelEngine() *UserModelEngine { return &UserModelEngine{} }

func (e *UserModelEngine) Name() string { return "UserModelEngine" }

func (e *UserModelEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "UserModelEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "UserModelEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewUserModelEngine()) }
