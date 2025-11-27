package core

import (
    "encoding/json"
    "gopkg.in/yaml.v3"
    "io/ioutil"
    "os"
    "fmt"
)

type Config struct {
    DrainTimeoutSeconds int `json:"drain_timeout_seconds" yaml:"drain_timeout_seconds"`
    ServiceName string `json:"service_name" yaml:"service_name"`
    Port int `json:"port" yaml:"port"`
    PersistFile string `json:"persist_file" yaml:"persist_file"`
    Persist bool `json:"persist" yaml:"persist"`
}

var Conf Config

func LoadConfig(path string) error {
    if path == "" {
        // defaults from env
        Conf.ServiceName = getEnv("SERVICE_NAME", "neuroedge-go")
        Conf.Port = getEnvInt("PORT", 9000)
        Conf.PersistFile = getEnv("PERSIST_FILE", "neuroedge_db.json")
        Conf.Persist = getEnv("PERSIST", "0") == "1"
        Conf.DrainTimeoutSeconds = getEnvInt("DRAIN_TIMEOUT_SECONDS", 10)
        return nil
    }
    b, err := ioutil.ReadFile(path)
    if err != nil { return err }
    // try json first
    if json.Unmarshal(b, &Conf) == nil {
        return nil
    }
    // try yaml
    if yaml.Unmarshal(b, &Conf) == nil {
        return nil
    }
    return fmt.Errorf("failed to parse config")
}

func getEnv(key, def string) string {
    v := os.Getenv(key)
    if v == "" { return def }
    return v
}

func getEnvInt(key string, def int) int {
    v := os.Getenv(key)
    if v == "" { return def }
    var i int
    fmt.Sscanf(v, "%d", &i)
    if i == 0 { return def }
    return i
}
