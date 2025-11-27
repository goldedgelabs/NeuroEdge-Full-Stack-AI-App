
package middleware

import (
    "context"
    "net/http"
    "strings"
    "github.com/golang-jwt/jwt/v5"
)

var JwtSecret = []byte("change-me")

type ctxKey string

const UserCtxKey ctxKey = "user"

func JWTMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        auth := r.Header.Get("Authorization")
        if auth == "" {
            next.ServeHTTP(w, r)
            return
        }
        parts := strings.SplitN(auth, " ", 2)
        if len(parts) != 2 || parts[0] != "Bearer" {
            http.Error(w, "invalid auth header", 401)
            return
        }
        tokenStr := parts[1]
        token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
            return JwtSecret, nil
        })
        if err != nil || !token.Valid {
            http.Error(w, "invalid token", 401)
            return
        }
        ctx := context.WithValue(r.Context(), UserCtxKey, token.Claims)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
