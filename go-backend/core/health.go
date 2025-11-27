
package core

import (
    "net/http"
)

func HealthCheckHandler(w http.ResponseWriter, r *http.Request) {
    // basic checks
    w.Header().Set("Content-Type","application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{"status":"ok","agents":ListAgents(),"engines":ListEngines()})
}
