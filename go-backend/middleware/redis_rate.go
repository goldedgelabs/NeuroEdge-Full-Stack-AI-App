
package middleware

import (
    "net/http"
    "context"
    "github.com/neuroedge/go-backend/services"
)

func RedisRateLimit(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ctx := context.Background()
        key := r.RemoteAddr
        ok, err := services.AllowRequestRedis(ctx, key, 100, 60)
        if err != nil {
            http.Error(w, "rate error", 500)
            return
        }
        if !ok {
            http.Error(w, "rate_limited", 429)
            return
        }
        next.ServeHTTP(w, r)
    })
}
