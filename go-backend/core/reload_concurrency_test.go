
package core

import (
    "testing"
    "time"
    "sync"
    "fmt"
)

// mock engine that counts runs
type mockEngine struct{
    name string
    runCount int
    mu sync.Mutex
}

func (m *mockEngine) Name() string { return m.name }
func (m *mockEngine) Run(p map[string]interface{}) (map[string]interface{}, error) {
    m.mu.Lock(); m.runCount++; m.mu.Unlock()
    time.Sleep(50 * time.Millisecond) // simulate work
    return map[string]interface{}{"ok":true}, nil
}
func (m *mockEngine) SelfTest() error { return nil }
func (m *mockEngine) Shutdown() error { return nil }

// failing engine for post-swap test
type failingEngine struct{}
func (f *failingEngine) Name() string { return "fail" }
func (f *failingEngine) Run(p map[string]interface{}) (map[string]interface{}, error) { return map[string]interface{}{"ok":true}, nil }
func (f *failingEngine) SelfTest() error { return nil }
func (f *failingEngine) PostSwapTest() error { return fmt.Errorf("post swap bad") }
func (f *failingEngine) Shutdown() error { return nil }

func TestReloadRollbackDuringLoad(t *testing.T) {
    // register mock engine
    me := &mockEngine{name:"mockEngine"}
    RegisterEngine(me)
    // start goroutines to call RunEngine repeatedly
    var wg sync.WaitGroup
    stop := make(chan struct{})
    for i:=0;i<5;i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for {
                select {
                case <-stop:
                    return
                default:
                    _, _ = RunEngine("mockEngine", map[string]interface{}{})
                }
            }
        }()
    }
    // give them some time to start
    time.Sleep(200 * time.Millisecond)
    // attempt to reload with a factory that returns failing engine (PostSwapTest fails)
    err := ReloadEngine("mockEngine", func() Engine { return &failingEngine{} })
    if err == nil {
        t.Fatal("expected reload to fail due to post-swap test")
    }
    // ensure original engine still registered
    e, ok := GetEngine("mockEngine")
    if !ok { t.Fatal("engine missing after failed reload") }
    if e.Name() != "mockEngine" { t.Fatalf("engine was replaced unexpectedly: %s", e.Name()) }
    close(stop)
    wg.Wait()
}
