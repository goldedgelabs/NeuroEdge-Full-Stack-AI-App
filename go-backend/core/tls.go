
package core

import (
    "crypto/tls"
    "net/http"
    "log"
    "os"
)

// LoadTLSConfig loads cert and key from files if present and returns TLS config
func LoadTLSConfig(certFile, keyFile string) (*tls.Config, error) {
    if certFile == "" || keyFile == "" { return nil, nil }
    _, err1 := os.Stat(certFile)
    _, err2 := os.Stat(keyFile)
    if os.IsNotExist(err1) || os.IsNotExist(err2) { return nil, nil }
    cert, err := tls.LoadX509KeyPair(certFile, keyFile)
    if err != nil { return nil, err }
    cfg := &tls.Config{Certificates: []tls.Certificate{cert}}
    return cfg, nil
}

func ServeTLS(addr string, handler http.Handler, certFile, keyFile string) error {
    cfg, err := LoadTLSConfig(certFile, keyFile)
    if err != nil { return err }
    if cfg == nil {
        log.Println("TLS cert or key not found, serving plaintext")
        return http.ListenAndServe(addr, handler)
    }
    srv := &http.Server{Addr: addr, Handler: handler, TLSConfig: cfg}
    return srv.ListenAndServeTLS("", "")
}
