package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type KnowledgeEngine struct{}

func NewKnowledgeEngine() *KnowledgeEngine { return &KnowledgeEngine{} }

func (e *KnowledgeEngine) Name() string { return "KnowledgeEngine" }

func (e *KnowledgeEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "KnowledgeEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "KnowledgeEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewKnowledgeEngine()) }
