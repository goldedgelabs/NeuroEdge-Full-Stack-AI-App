package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type NotificationEngine struct{}

func NewNotificationEngine() *NotificationEngine { return &NotificationEngine{} }

func (e *NotificationEngine) Name() string { return "NotificationEngine" }

func (e *NotificationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "NotificationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "NotificationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewNotificationEngine()) }
