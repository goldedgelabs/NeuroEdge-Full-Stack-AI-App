package core

import "sync"

type Agent interface {
    Name() string
    Init() error
    Run(payload map[string]interface{}) (map[string]interface{}, error)
    Metrics() map[string]interface{}
}

var agentsMu sync.RWMutex
var agentsMap map[string]Agent = make(map[string]Agent)

func RegisterAgent(a Agent) {
    agentsMu.Lock()
    defer agentsMu.Unlock()
    agentsMap[a.Name()] = a
}

func GetAgent(name string) (Agent, bool) {
    agentsMu.RLock()
    defer agentsMu.RUnlock()
    a, ok := agentsMap[name]
    return a, ok
}

func ListAgents() []string {
    agentsMu.RLock()
    defer agentsMu.RUnlock()
    out := []string{}
    for k := range agentsMap {
        out = append(out, k)
    }
    return out
}
