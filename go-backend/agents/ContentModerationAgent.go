package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type ContentModerationAgent struct{}

func NewContentModerationAgent() *ContentModerationAgent { return &ContentModerationAgent{} }

func (a *ContentModerationAgent) Name() string { return "ContentModerationAgent" }

func (a *ContentModerationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("ContentModerationAgent received db:update", data) })
    return nil
}

func (a *ContentModerationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "ContentModerationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *ContentModerationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"ContentModerationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewContentModerationAgent()) }
