
package engines

import (
    "github.com/neuroedge/go-backend/core"
    "net/http"
    "io/ioutil"
    "time"
    "fmt"
    "github.com/cenkalti/backoff/v4"
    "os"
)

type NetworkEngine struct{}

func NewNetworkEngine() *NetworkEngine { return &NetworkEngine{} }

func (n *NetworkEngine) Name() string { return "NetworkEngine" }

func (n *NetworkEngine) Run(payload map[string]interface{}) (map[string]interface{}, error) {
    url, _ := payload["url"].(string)
    if url == "" { return nil, fmt.Errorf("missing url") }
    var body []byte
    operation := func() error {
        client := http.Client{Timeout: 10 * time.Second}
        resp, err := client.Get(url)
        if err != nil { return err }
        defer resp.Body.Close()
        b, err := ioutil.ReadAll(resp.Body)
        if err != nil { return err }
        body = b
        return nil
    }
    bo := backoff.WithMaxRetries(backoff.NewExponentialBackOff(), 3)
    err := backoff.Retry(operation, bo)
    if err != nil { return nil, err }
    core.GetEventBus().Publish("network:fetch", map[string]interface{}{"url":url})
    return map[string]interface{}{"url":url,"body":string(body)}, nil
}


func (n *NetworkEngine) SelfTest() error {
    url := os.Getenv("NETWORK_HEALTHCHECK_URL")
    if url == "" { return nil }
    client := http.Client{Timeout: 5 * time.Second}
    resp, err := client.Get(url)
    if err != nil { return err }
    defer resp.Body.Close()
    if resp.StatusCode >= 200 && resp.StatusCode < 300 { return nil }
    return fmt.Errorf("health status: %d", resp.StatusCode)
}

func (n *NetworkEngine) Shutdown() error { return nil }



func (n *NetworkEngine) PostSwapTest() error {
    // If a healthcheck URL is configured, call it to validate network access.
    url := os.Getenv("NETWORK_HEALTHCHECK_URL")
    if url == "" {
        // No external dependency configured; perform a simple DNS resolve via HTTP GET to example.com
        url = "https://example.com/"
    }
    client := http.Client{Timeout: 5 * time.Second}
    resp, err := client.Get(url)
    if err != nil { return err }
    defer resp.Body.Close()
    if resp.StatusCode >= 200 && resp.StatusCode < 400 { return nil }
    return fmt.Errorf("post-swap health failed: %d", resp.StatusCode)
}

func init() { core.RegisterEngine(NewNetworkEngine()) }



func (s *NetworkEngine) RunWithContext(ctx context.Context, payload map[string]interface{}) (map[string]interface{}, error) {
    // default implementation: ignore ctx and call Run - engines that need context can override this
    return s.Run(payload)
}
