package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type SearchEngine struct{}

func NewSearchEngine() *SearchEngine { return &SearchEngine{} }

func (e *SearchEngine) Name() string { return "SearchEngine" }

func (e *SearchEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "SearchEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "SearchEngine"})
    return res, nil
}


func (e *SearchEngine) PostSwapTest() error {
    // run a lightweight noop payload to ensure the engine's Run path works
    _, err := e.Run(map[string]interface{}{"test":"ok"})
    return err
}

func init() {{ core.RegisterEngine(NewSearchEngine()) }}
