package api

import (
	"encoding/json"
	"net/http"
)

type AnalyticsReq struct {
	Event string `json:"event"`
	Data  any    `json:"data"`
}

func AnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	var req AnalyticsReq
	json.NewDecoder(r.Body).Decode(&req)

	response := map[string]any{
		"ok":   true,
		"echo": req,
	}

	json.NewEncoder(w).Encode(response)
}
