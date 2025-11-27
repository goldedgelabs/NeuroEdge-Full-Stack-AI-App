package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type DeviceProtectionAgent struct{}

func NewDeviceProtectionAgent() *DeviceProtectionAgent { return &DeviceProtectionAgent{} }

func (a *DeviceProtectionAgent) Name() string { return "DeviceProtectionAgent" }

func (a *DeviceProtectionAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("DeviceProtectionAgent received db:update", data) })
    return nil
}

func (a *DeviceProtectionAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "DeviceProtectionAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *DeviceProtectionAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"DeviceProtectionAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewDeviceProtectionAgent()) }
