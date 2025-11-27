
Enhancements: chi router, jwt middleware, concrete engines (Storage, Network, ModelServing, Embedding), Docker, compose, Makefile, unit tests.

## Migrations
Run migrations after Postgres init:

```
# ensure POSTGRES_URL env set
go run main.go # or use services.RunMigrations("migrations") in an init step
```

## TLS
Use `scripts/generate_tls_and_secret.sh` to create self-signed certs and create k8s secret:

```
./scripts/generate_tls_and_secret.sh
kubectl create secret tls neuroedge-tls --cert=./tls.crt --key=./tls.key
```

## Admin Endpoints
POST /admin/agents/restart - requires operator JWT
POST /admin/engines/reload - requires operator JWT

## Integration Tests
Run `./scripts/integration_test.sh` to run tests locally (requires docker, jq).

## Hot-reload safety
- Drain timeout configurable via `DRAIN_TIMEOUT_SECONDS` env var (default 10).
- Engines may implement `PostSwapTest()` to validate themselves after being swapped in. If the post-swap test fails, the system will automatically roll back to the previous instance.


## Additional tools
- scripts/tune_ivfflat.sh: tune ivfflat lists parameter based on table size
- docker-compose-otel.yml: run OTLP collector locally
- scripts/k6_test.js: k6 load test script
- docker-compose.e2e.yml: compose for e2e bringing up go + minimal python/ts placeholders
- scripts/load_test.sh and scripts/k6_test.js available for load testing
- observability/ contains Grafana dashboard JSON and Prometheus alert rules

CI: .github/workflows includes a 'full-ci' job to build, vet, test (race), and run k6 load via Docker.
