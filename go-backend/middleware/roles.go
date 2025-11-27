
package middleware

import (
    "net/http"
    "context"
    "github.com/golang-jwt/jwt/v5"
    "fmt"
)

type roleKey string

const RoleCtxKey roleKey = "role"

// RequireRole middleware checks JWT claims in context for role.
func RequireRole(role string) func(next http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ctx := r.Context()
            claims, ok := ctx.Value("user").(jwt.Claims)
            if !ok {
                http.Error(w, "forbidden", 403)
                return
            }
            // try to extract role from MapClaims
            if mc, ok := claims.(jwt.MapClaims); ok {
                if rr, ok := mc["role"].(string); ok {
                    if rr == role {
                        // store role in context
                        ctx = context.WithValue(ctx, RoleCtxKey, rr)
                        next.ServeHTTP(w, r.WithContext(ctx))
                        return
                    }
                }
            }
            http.Error(w, "forbidden", 403)
        })
    }
}
