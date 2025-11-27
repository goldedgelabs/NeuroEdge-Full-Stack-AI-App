package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type NotificationAgent struct{}

func NewNotificationAgent() *NotificationAgent { return &NotificationAgent{} }

func (a *NotificationAgent) Name() string { return "NotificationAgent" }

func (a *NotificationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("NotificationAgent received db:update", data) })
    return nil
}

func (a *NotificationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "NotificationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *NotificationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"NotificationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewNotificationAgent()) }
