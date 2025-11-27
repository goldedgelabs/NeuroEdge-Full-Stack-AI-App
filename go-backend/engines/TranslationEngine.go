package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type TranslationEngine struct{}

func NewTranslationEngine() *TranslationEngine { return &TranslationEngine{} }

func (e *TranslationEngine) Name() string { return "TranslationEngine" }

func (e *TranslationEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "TranslationEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "TranslationEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewTranslationEngine()) }
