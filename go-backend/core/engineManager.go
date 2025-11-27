package core

import (

    "encoding/json"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    oteltrace "go.opentelemetry.io/otel/trace"
    "context"
    "sync"
    "errors"
    "fmt"

)

type Engine interface {
    Name() string
    Run(payload map[string]interface{}) (map[string]interface{}, error)
}

var enginesMu sync.RWMutex
var enginesMap map[string]Engine = make(map[string]Engine)

func RegisterEngine(e Engine) {
    enginesMu.Lock()
    defer enginesMu.Unlock()
    enginesMap[e.Name()] = e
}

func GetEngine(name string) (Engine, bool) {
    enginesMu.RLock()
    defer enginesMu.RUnlock()
    en, ok := enginesMap[name]
    return en, ok
}

func RunEngine(name string, payload map[string]interface{}) (map[string]interface{}, error) {
    en, ok := GetEngine(name)
    if !ok {
        return nil, errors.New("engine not found: " + name)
    }
    core.EngineRuns.WithLabelValues(name).Inc()
    return en.Run(payload)
}

func ListEngines() []string {
    enginesMu.RLock()
    defer enginesMu.RUnlock()
    out := []string{}
    for k := range enginesMap {
        out = append(out, k)
    }
    return out
}



// ReplaceEngine replaces the engine instance in the registry.
// It returns the previous engine instance if present.
func ReplaceEngine(name string, newEngine Engine) (Engine, bool) {
    enginesMu.Lock()
    defer enginesMu.Unlock()
    old, ok := enginesMap[name]
    enginesMap[name] = newEngine
    return old, ok
}

// ReloadEngine uses a factory function to create a new engine instance and replaces the current one.
// It also calls Init() on the new engine if it implements an Init() error method.




// Optional interfaces for lifecycle support
type initer interface{ Init() error }
type shutdowner interface{ Shutdown() error }
type selftester interface{ SelfTest() error }

// ReloadEngine uses a factory function to create a new engine instance, runs self-test on it,
// and replaces the current one atomically. If the self-test fails, it does not replace the engine.
// After replacement, it attempts to call Shutdown() on the old instance asynchronously.
func ReloadEngine(name string, factory func() Engine) error {
    if factory == nil {
        return fmt.Errorf("no factory provided for engine: %s", name)
    }
    // create new instance
    newEng := factory()
    // call Init if available
    if ie, ok := newEng.(initer); ok {
        if err := ie.Init(); err != nil {
            return fmt.Errorf("init failed for new engine %s: %w", name, err)
        }
    }
    // run self-test if available
    if st, ok := newEng.(selftester); ok {
        if err := st.SelfTest(); err != nil {
            return fmt.Errorf("selftest failed for new engine %s: %w", name, err)
        }
    }
    // perform atomic replace under lock and capture old engine
    enginesMu.Lock()
    old, existed := enginesMap[name]
    enginesMap[name] = newEng
    enginesMu.Unlock()

    // asynchronously shutdown old engine if it implements shutdowner
    if existed && old != nil {
        if sd, ok := old.(shutdowner); ok {
            go func() {
                if err := sd.Shutdown(); err != nil {
                    // log but do not revert
                    Error(fmt.Sprintf("engine %s shutdown error: %v", name, err))
                } else {
                    Log(fmt.Sprintf("engine %s shutdown completed", name))
                }
            }()
        }
    }
    return nil
}


var inFlightMu sync.RWMutex
var inFlightCount map[string]int = make(map[string]int)
var draining map[string]bool = make(map[string]bool)
var drainCond = sync.NewCond(&sync.Mutex{})

// increment in-flight
func beginRequest(name string) {
    inFlightMu.Lock()
    defer inFlightMu.Unlock()
    inFlightCount[name] = inFlightCount[name] + 1
}

// decrement in-flight and signal if zero
func endRequest(name string) {
    inFlightMu.Lock()
    defer inFlightMu.Unlock()
    if inFlightCount[name] > 0 {
        inFlightCount[name] = inFlightCount[name] - 1
    }
    if inFlightCount[name] == 0 {
        drainCond.L.Lock()
        drainCond.Signal()
        drainCond.L.Unlock()
    }
}

// RunEngine executes the named engine while tracking in-flight requests and honoring drain flags.
func RunEngine(name string, payload map[string]interface{}) (map[string]interface{}, error) {
    // check engine exists
    en, ok := GetEngine(name)
    if !ok {
        return nil, errors.New("engine not found: " + name)
    }
    // if draining, wait with timeout for in-flight to drain or return error
    inFlightMu.RLock()
    isDraining := draining[name]
    inFlightMu.RUnlock()
    if isDraining {
        // wait up to 5 seconds for existing requests to finish
        timeout := time.After(time.Duration(core.Conf.DrainTimeoutSeconds) * time.Second)
        done := make(chan struct{})
        go func() {
            drainCond.L.Lock()
            for inFlightCount[name] > 0 {
                drainCond.Wait()
            }
            drainCond.L.Unlock()
            close(done)
        }()
        select {
        case <-done:
            // proceeded
        case <-timeout:
            return nil, errors.New("engine is draining, try again later")
        }
    }
    ctx := context.Background()
    tracer := otel.Tracer("neuroedge/engine")
    ctx, span := tracer.Start(ctx, "engine.run", oteltrace.WithAttributes(attribute.String("engine", name)))
    // add payload size attribute
    if payload != nil {
        b, _ := json.Marshal(payload)
        span.SetAttributes(attribute.Int("payload.size", len(b)))
    }
    // add user attribute from context if present
    if u := ctx.Value(UserCtxKey); u != nil {
        span.SetAttributes(attribute.String("user", fmt.Sprintf("%v", u)))
    }
    defer span.End()
    beginRequest(name)
    defer endRequest(name)
    EngineRuns.WithLabelValues(name).Inc()
    // pass context to engine if it accepts it via RunWithContext optional interface
    type runWithCtx interface{ RunWithContext(ctx context.Context, p map[string]interface{}) (map[string]interface{}, error) }
    if rwc, ok := en.(runWithCtx); ok {
        res, err := rwc.RunWithContext(ctx, payload)
        if err != nil { span.RecordError(err) }
        return res, err
    }
    res, err := en.Run(payload)
    if err != nil { span.RecordError(err) }
    return res, err
}


// PostSwapTester optionally tests the new engine in the live registry after swap
type postswaptester interface{ PostSwapTest() error }

// ReplaceEngineWithRollback attempts to replace engine with newEngine, performs a post-swap test if available,
// and rolls back to old engine if post-swap test fails.
func ReplaceEngineWithRollback(name string, newEngine Engine) error {
    enginesMu.Lock()
    old, ok := enginesMap[name]
    enginesMap[name] = newEngine
    enginesMu.Unlock()

    // run PostSwapTest if available on newEngine
    if pst, ok := newEngine.(postswaptester); ok {
        if err := pst.PostSwapTest(); err != nil {
            // rollback
            enginesMu.Lock()
            enginesMap[name] = old
            enginesMu.Unlock()
            // attempt to shutdown newEngine
            if sd, ok := newEngine.(shutdowner); ok {
                _ = sd.Shutdown()
            }
            core.ReloadFailures.WithLabelValues(name).Inc()
            return fmt.Errorf("post-swap test failed: %v", err)
        }
    }
    // record success metric
    core.ReloadSuccesses.WithLabelValues(name).Inc()

    // async shutdown old if available
    if ok && old != nil {
        if sd, ok := old.(shutdowner); ok {
            go func() { _ = sd.Shutdown() }()
        }
    }
    return nil
}


func ReloadEngine(name string, factory func() Engine) error {
    if factory == nil {
        return fmt.Errorf("no factory provided for engine: %s", name)
    }
    // create new instance
    newEng := factory()
    // init if supported
    if ie, ok := newEng.(initer); ok {
        if err := ie.Init(); err != nil {
            return fmt.Errorf("init failed for new engine %s: %w", name, err)
        }
    }
    // selftest if supported
    if st, ok := newEng.(selftester); ok {
        if err := st.SelfTest(); err != nil {
            return fmt.Errorf("selftest failed for new engine %s: %w", name, err)
        }
    }

    // mark draining for this engine to prevent new requests during swap
    inFlightMu.Lock()
    draining[name] = true
    inFlightMu.Unlock()

    // wait for current in-flight to drain up to timeout
    timeout := time.After(time.Duration(core.Conf.DrainTimeoutSeconds) * time.Second)
    done := make(chan struct{})
    go func() {
        drainCond.L.Lock()
        for inFlightCount[name] > 0 {
            drainCond.Wait()
        }
        drainCond.L.Unlock()
        close(done)
    }()
    select {
    case <-done:
        // proceed
    case <-timeout:
        // clear draining and abort
        inFlightMu.Lock()
        draining[name] = false
        inFlightMu.Unlock()
        return fmt.Errorf("timeout waiting for in-flight requests to drain for engine %s", name)
    }

    // perform replace with post-swap rollback test if necessary
    if err := ReplaceEngineWithRollback(name, newEng); err != nil {
        inFlightMu.Lock()
        draining[name] = false
        inFlightMu.Unlock()
        return err
    }

    // clear draining flag
    inFlightMu.Lock()
    draining[name] = false
    inFlightMu.Unlock()

    return nil
}
