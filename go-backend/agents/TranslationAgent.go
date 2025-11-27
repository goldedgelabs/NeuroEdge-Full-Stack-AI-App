package agents

import (
    "fmt"
    "time"
    "github.com/neuroedge/go-backend/core"
)

type TranslationAgent struct{}

func NewTranslationAgent() *TranslationAgent { return &TranslationAgent{} }

func (a *TranslationAgent) Name() string { return "TranslationAgent" }

func (a *TranslationAgent) Init() error {
    eb := core.GetEventBus()
    eb.Subscribe("db:update", func(topic string, data interface{}) { fmt.Println("TranslationAgent received db:update", data) })
    return nil
}

func (a *TranslationAgent) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"agent": "TranslationAgent", "received": payload, "ts": time.Now().UTC().String()}
    return res, nil
}

func (a *TranslationAgent) Metrics() map[string]interface{} {
    return map[string]interface{}{"name":"TranslationAgent", "uptime": 1}
}

func init() { core.RegisterAgent(NewTranslationAgent()) }
