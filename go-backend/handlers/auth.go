
package handlers

import (
    "net/http"
    "encoding/json"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "github.com/neuroedge/go-backend/core"
)

var jwtSecret = []byte("change-me-secret")

type LoginPayload struct {
    Username string `json:"username"`
    Role string `json:"role"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
    var p LoginPayload
    json.NewDecoder(r.Body).Decode(&p)
    if p.Username == "" { http.Error(w, "missing username", 400); return }
    claims := jwt.MapClaims{"sub": p.Username, "role": p.Role, "exp": time.Now().Add(15 * time.Minute).Unix()}
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    s, err := token.SignedString(jwtSecret)
    if err != nil { http.Error(w, "token error", 500); return }
    // issue refresh token as separate JWT long lived
    refreshClaims := jwt.MapClaims{"sub": p.Username, "role": p.Role, "exp": time.Now().Add(7*24*time.Hour).Unix()}
    rt := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    rs, _ := rt.SignedString(jwtSecret)
    json.NewEncoder(w).Encode(map[string]interface{}{"access": s, "refresh": rs})
    core.Log("issued token for " + p.Username)
}

func RefreshHandler(w http.ResponseWriter, r *http.Request) {
    var body map[string]string
    json.NewDecoder(r.Body).Decode(&body)
    tokenStr := body["refresh"]
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) { return jwtSecret, nil })
    if err != nil || !token.Valid { http.Error(w, "invalid_refresh", 401); return }
    claims := token.Claims.(jwt.MapClaims)
    // issue new access token
    newClaims := jwt.MapClaims{"sub": claims["sub"], "role": claims["role"], "exp": time.Now().Add(15 * time.Minute).Unix()}
    nt := jwt.NewWithClaims(jwt.SigningMethodHS256, newClaims)
    s, _ := nt.SignedString(jwtSecret)
    json.NewEncoder(w).Encode(map[string]interface{}{"access": s})
}
