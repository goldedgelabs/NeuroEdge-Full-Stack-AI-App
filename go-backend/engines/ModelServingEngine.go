
package engines

import (
    "github.com/neuroedge/go-backend/core"
    "net/http"
    "bytes"
    "io/ioutil"
    "encoding/json"
    "fmt"
    "os"
    "time"
)

type ModelServingEngine struct{}

func NewModelServingEngine() *ModelServingEngine { return &ModelServingEngine{} }

func (m *ModelServingEngine) Name() string { return "ModelServingEngine" }

func (m *ModelServingEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    modelURL := os.Getenv("MODEL_SERVER_URL")
    if modelURL == "" { modelURL = "http://model-server:8080/predict" }
    b, _ := json.Marshal(payload)
    resp, err := http.Post(modelURL, "application/json", bytes.NewReader(b))
    if err != nil { return nil, err }
    defer resp.Body.Close()
    rb, _ := ioutil.ReadAll(resp.Body)
    var out map[string]interface{}
    _ = json.Unmarshal(rb, &out)
    core.GetEventBus().Publish("model:invoke", map[string]interface{}{"url": modelURL})
    return out, nil
}


func (m *ModelServingEngine) SelfTest() error {
    modelURL := os.Getenv("MODEL_SERVER_URL")
    if modelURL == "" { return nil }
    client := http.Client{Timeout: 5 * time.Second}
    resp, err := client.Head(modelURL)
    if err != nil { return err }
    defer resp.Body.Close()
    if resp.StatusCode >= 200 && resp.StatusCode < 400 { return nil }
    return fmt.Errorf("model server health: %d", resp.StatusCode)
}

func (m *ModelServingEngine) Shutdown() error { return nil }



func (m *ModelServingEngine) PostSwapTest() error {
    // attempt a HEAD to model server to ensure reachable
    modelURL := os.Getenv("MODEL_SERVER_URL")
    if modelURL == "" { return nil }
    client := http.Client{Timeout: 3 * time.Second}
    resp, err := client.Head(modelURL)
    if err != nil { return err }
    defer resp.Body.Close()
    if resp.StatusCode >= 200 && resp.StatusCode < 400 { return nil }
    return fmt.Errorf("model server health: %d", resp.StatusCode)
}

func init() { core.RegisterEngine(NewModelServingEngine()) }



func (s *ModelServingEngine) RunWithContext(ctx context.Context, payload map[string]interface{}) (map[string]interface{}, error) {
    // default implementation: ignore ctx and call Run - engines that need context can override this
    return s.Run(payload)
}
