package core

import (
    "encoding/json"
    "io/ioutil"
    "os"
    "sync"
)

type InMemoryDB struct {
    mu sync.RWMutex
    data map[string][]byte
    persistFile string
    persist bool
}

var db *InMemoryDB
var onceDB sync.Once

func GetDB() *InMemoryDB {
    onceDB.Do(func() { db = &InMemoryDB{data: make(map[string][]byte)} })
    return db
}

func (d *InMemoryDB) Init(persistFile string, persist bool) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    d.persistFile = persistFile
    d.persist = persist
    if persist && persistFile != "" {
        if _, err := os.Stat(persistFile); err == nil {
            b, err := ioutil.ReadFile(persistFile)
            if err == nil {
                var m map[string][]byte
                _ = json.Unmarshal(b, &m)
                d.data = m
            }
        }
    }
    return nil
}

func (d *InMemoryDB) Set(key string, value []byte) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    d.data[key] = value
    if d.persist && d.persistFile != "" {
        _ = d.flush()
    }
    GetEventBus().Publish("db:update", map[string]interface{}{"key": key, "value": value})
    return nil
}

func (d *InMemoryDB) Get(key string) ([]byte, bool) {
    d.mu.RLock()
    defer d.mu.RUnlock()
    v, ok := d.data[key]
    return v, ok
}

func (d *InMemoryDB) Delete(key string) error {
    d.mu.Lock()
    defer d.mu.Unlock()
    delete(d.data, key)
    if d.persist && d.persistFile != "" {
        _ = d.flush()
    }
    GetEventBus().Publish("db:delete", map[string]interface{}{"key": key})
    return nil
}

func (d *InMemoryDB) flush() error {
    b, err := json.Marshal(d.data)
    if err != nil { return err }
    return ioutil.WriteFile(d.persistFile, b, 0644)
}
