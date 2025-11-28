package api

import (
  "encoding/json"
  "log"
  "net/http"
  "os"
  "time"

  "github.com/gorilla/websocket"
)

type GenRequest struct {
  ConversationId string `json:"conversationId"`
  Message        string `json:"message"`
  Engine         string `json:"engine"`
}

// simple internal key check
func validInternalKey(r *http.Request) bool {
  k := r.Header.Get("X-INTERNAL-KEY")
  return k != "" && k == os.Getenv("INTERNAL_API_KEY")
}

func GenerateHandler(w http.ResponseWriter, r *http.Request) {
  if !validInternalKey(r) {
    w.WriteHeader(http.StatusUnauthorized)
    json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "invalid internal key"})
    return
  }

  var req GenRequest
  if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
    w.WriteHeader(http.StatusBadRequest)
    json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "bad request"})
    return
  }

  // Connect to TS WS server and push chunks
  tsHost := os.Getenv("TS_WS_HOST")
  if tsHost == "" {
    tsHost = "ws://localhost:4000"
  }
  // expected TS ws path: /ws/chat/:conversationId
  wsUrl := tsHost + "/ws/chat/" + req.ConversationId

  dialer := websocket.DefaultDialer
  conn, _, err := dialer.Dial(wsUrl, nil)
  if err != nil {
    log.Printf("go/generate: failed to connect to ts ws: %v\n", err)
    w.WriteHeader(http.StatusInternalServerError)
    json.NewEncoder(w).Encode(map[string]any{"ok": false, "error": "ws connect failed"})
    return
  }
  defer conn.Close()

  // Fake stream tokens
  tokens := []string{"This", " is", " a", " Go", " engine", " response."}
  for _, t := range tokens {
    payload := map[string]any{"type": "chunk", "chunk": t}
    b, _ := json.Marshal(payload)
    _ = conn.WriteMessage(websocket.TextMessage, b)
    time.Sleep(200 * time.Millisecond)
  }
  final := map[string]any{"type": "message", "text": "This is a Go engine final message."}
  conn.WriteJSON(final)

  json.NewEncoder(w).Encode(map[string]any{"ok": true})
}
