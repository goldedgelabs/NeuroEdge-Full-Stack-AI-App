package core

import (
    "sync"
)

type EventHandler func(topic string, data interface{})

type EventBus struct {
    subscribers map[string][]EventHandler
    mu sync.RWMutex
}

var bus *EventBus
var onceBus sync.Once

func GetEventBus() *EventBus {
    onceBus.Do(func() { bus = &EventBus{subscribers: make(map[string][]EventHandler)} })
    return bus
}

func (eb *EventBus) Subscribe(topic string, h EventHandler) {
    eb.mu.Lock()
    defer eb.mu.Unlock()
    eb.subscribers[topic] = append(eb.subscribers[topic], h)
}

func (eb *EventBus) Publish(topic string, data interface{}) {
    eb.mu.RLock()
    subs := eb.subscribers[topic]
    eb.mu.RUnlock()
    for _, h := range subs {
        go func(handler EventHandler) {
            defer func() { recover() }()
            handler(topic, data)
        }(h)
    }
}
