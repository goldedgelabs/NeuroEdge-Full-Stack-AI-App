package middleware

import (
    "net/http"
    "time"
    "sync"
)

type bucket struct {
    tokens float64
    last time.Time
    mu sync.Mutex
}

var buckets = map[string]*bucket{}
var muBuckets sync.Mutex

func Allow(key string, capacity float64, refill float64) bool {
    muBuckets.Lock()
    b, ok := buckets[key]
    if !ok {
        b = &bucket{tokens: capacity, last: time.Now()}
        buckets[key] = b
    }
    muBuckets.Unlock()
    b.mu.Lock()
    defer b.mu.Unlock()
    elapsed := time.Since(b.last).Seconds()
    b.tokens += elapsed * refill
    if b.tokens > capacity { b.tokens = capacity }
    b.last = time.Now()
    if b.tokens >= 1 {
        b.tokens -= 1
        return true
    }
    return false
}

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        key := r.RemoteAddr
        if !Allow(key, 60, 1) {
            http.Error(w, "rate_limited", 429)
            return
        }
        next.ServeHTTP(w, r)
    })
}
