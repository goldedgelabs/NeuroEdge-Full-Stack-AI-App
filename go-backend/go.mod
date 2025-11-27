module github.com/neuroedge/go-backend

go 1.20

require (
	github.com/go-chi/chi/v5 v5.0.9
	github.com/go-chi/cors v1.2.0
	github.com/golang-jwt/jwt/v5 v5.0.0
	github.com/cenkalti/backoff/v4 v4.1.1
)


require (
    github.com/redis/go-redis/v9 v9.0.0
    github.com/prometheus/client_golang v1.13.0
    github.com/jackc/pgx/v5 v5.9.0
    github.com/prometheus/client_golang/prometheus/promhttp v0.0.0
)


require (
    github.com/pgvector/pgvector-go v0.5.0
    go.opentelemetry.io/otel v1.20.0
    go.opentelemetry.io/otel/sdk v1.20.0
    go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.20.0
    go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.41.0
)
