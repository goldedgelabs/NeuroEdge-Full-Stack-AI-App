package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type ScraperEngine struct{}

func NewScraperEngine() *ScraperEngine { return &ScraperEngine{} }

func (e *ScraperEngine) Name() string { return "ScraperEngine" }

func (e *ScraperEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "ScraperEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "ScraperEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewScraperEngine()) }
