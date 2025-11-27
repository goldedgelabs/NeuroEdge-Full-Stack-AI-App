package core

import (
    "encoding/json"
    "log"
    "os"
    "time"
)

type Logger struct {
    *log.Logger
    service string
}

var logger *Logger

func InitLogger(service string) {
    logger = &Logger{Logger: log.New(os.Stdout, "", 0), service: service}
}

func Log(v interface{}) {
    if logger == nil { InitLogger("neuroedge-go") }
    o := map[string]interface{}{"ts": time.Now().UTC().Format(time.RFC3339), "service": logger.service, "level": "info", "msg": v}
    b, _ := json.Marshal(o)
    logger.Println(string(b))
}

func Error(v interface{}) {
    if logger == nil { InitLogger("neuroedge-go") }
    o := map[string]interface{}{"ts": time.Now().UTC().Format(time.RFC3339), "service": logger.service, "level": "error", "msg": v}
    b, _ := json.Marshal(o)
    logger.Println(string(b))
}

func Warn(v interface{}) {
    if logger == nil { InitLogger("neuroedge-go") }
    o := map[string]interface{}{"ts": time.Now().UTC().Format(time.RFC3339), "service": logger.service, "level": "warn", "msg": v}
    b, _ := json.Marshal(o)
    logger.Println(string(b))
}
