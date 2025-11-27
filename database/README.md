
NeuroEdge Database Full Stack (dev / staging)
============================================

This bundle boots a development/staging database stack including:
- PostgreSQL 15 with pgvector extension
- pgBouncer for pooling
- Qdrant vector DB
- ClickHouse (analytics)
- Redis (queueing)
- Vault (dev mode) for secrets
- MinIO (S3-compatible) for backups
- Prometheus + Grafana for monitoring

Start (requires Docker & docker-compose):
1. docker compose up -d
2. Wait for postgres to be healthy, then initialize extensions and migrations:
   ./scripts/run_migrations.sh
3. Create the qdrant collection:
   ./qdrant_init.sh
4. Start the ingestion worker to process vector_ingest queue:
   python3 workers/ingest_worker.py

Notes:
- Vault is running in dev mode (not secure). Use real Vault in production.
- Flyway config is provided; use Flyway or psql to run migrations.
- Update DATABASE_URL, PGHOST, PGUSER, PGPASSWORD env vars as needed.
- pgbouncer userlist.txt must be generated securely in production.

Security:
- No real credentials are included. Replace default passwords and configure Vault for production secrets.
