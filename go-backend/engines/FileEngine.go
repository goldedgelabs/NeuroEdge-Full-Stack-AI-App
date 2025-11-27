package engines

import (
    "github.com/neuroedge/go-backend/core"
)

type FileEngine struct{}

func NewFileEngine() *FileEngine { return &FileEngine{} }

func (e *FileEngine) Name() string { return "FileEngine" }

func (e *FileEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    res := map[string]interface{}{"engine": "FileEngine", "payload": payload}
    core.GetEventBus().Publish("engine:run", map[string]interface{}{"engine": "FileEngine"})
    return res, nil
}

func init() { core.RegisterEngine(NewFileEngine()) }
