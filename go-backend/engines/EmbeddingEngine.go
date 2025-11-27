
package engines

import (
    "github.com/neuroedge/go-backend/core"
    "hash/fnv"
    "math"
    "fmt"
)

type EmbeddingEngine struct{}

func NewEmbeddingEngine() *EmbeddingEngine { return &EmbeddingEngine{} }

func (e *EmbeddingEngine) Name() string { return "EmbeddingEngine" }

func (e *EmbeddingEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    text, _ := payload["text"].(string)
    if text == "" { return nil, fmt.Errorf("missing text") }
    dim := 16
    vec := make([]float64, dim)
    for i := 0; i < dim; i++ { vec[i] = 0.0 }
    for i := 0; i < len(text); i++ {
        h := fnv.New32a()
        h.Write([]byte(string(text[i])))
        idx := int(h.Sum32()) % uint32(dim)
        vec[idx] += 1.0
    }
    norm := 0.0
    for _, v := range vec { norm += v*v }
    norm = math.Sqrt(norm)
    if norm > 0.0 { for i := range vec { vec[i] /= norm } }
    core.GetEventBus().Publish("embedding:created", map[string]interface{}{"len": len(text)})
    return map[string]interface{}{"embedding": vec}, nil
}


func (e *EmbeddingEngine) SelfTest() error { return nil }

func (e *EmbeddingEngine) Shutdown() error { return nil }



func (e *EmbeddingEngine) PostSwapTest() error {
    // run a small embedding and verify dimensions and non-zero norm
    res, err := e.Run(map[string]interface{}{"text":"health-check"})
    if err != nil { return err }
    emb, ok := res["embedding"].([]float64)
    if !ok {
        // try []interface{} variant
        if arr, ok2 := res["embedding"].([]interface{}); ok2 {
            if len(arr) == 0 { return fmt.Errorf("empty embedding") }
            return nil
        }
        return fmt.Errorf("invalid embedding type")
    }
    if len(emb) == 0 { return fmt.Errorf("empty embedding") }
    // compute norm
    norm := 0.0
    for _, v := range emb { norm += v*v }
    if norm == 0.0 { return fmt.Errorf("zero norm") }
    return nil
}

func init() { core.RegisterEngine(NewEmbeddingEngine()) }



func (s *EmbeddingEngine) RunWithContext(ctx context.Context, payload map[string]interface{}) (map[string]interface{}, error) {
    // default implementation: ignore ctx and call Run - engines that need context can override this
    return s.Run(payload)
}
