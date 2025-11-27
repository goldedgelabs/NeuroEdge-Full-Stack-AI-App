
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






Kubernetes Deployment 
**Purpose:** Deploy the full NeuroEdge database stack on Kubernetes with a single Helm command.  
This README explains architecture, deployment steps, required secrets, configuration, verification, backups, scaling, security hardening, and troubleshooting.

> **Note:** This bundle contains templates and scripts only — **no real credentials**. Replace placeholders before deploying to production.

---
## Table of Contents
1. Architecture Overview
2. Components Deployed
3. Prerequisites
4. Folder / Helm Chart Structure
5. Secrets & Vault Integration
6. Configure values.yaml (example)
7. One-shot Deploy (Helm)
8. Post-deploy Steps & Verification
9. Migrations & Flyway (CI integration)
10. Backups & Restore
11. Scaling & Autoscaling (KEDA + HPA)
12. Observability (Prometheus, Grafana, Alertmanager)
13. Security Hardening Checklist
14. Disaster Recovery & Rollback
15. CI/CD & GitOps Suggestions
16. Troubleshooting
17. Appendix: SQL Schema Overview / Key Queries

---
## 1) Architecture Overview
NeuroEdge is a hybrid database architecture combining transactional, vector, and analytics stores for AI workloads. The one-shot Helm chart deploys everything into your Kubernetes cluster and wires components together via services and secrets.

Core idea:
- Transactional, multi-tenant metadata and control — **PostgreSQL** (pgvector for embeddings metadata)
- High-performance vector search — **Qdrant** (dedicated vector DB)
- Analytics & telemetry — **ClickHouse**
- Short-term caching/queue — **Redis**
- Connection pooling — **pgBouncer**
- Secrets management — **HashiCorp Vault**
- Object storage for backups — **S3 / MinIO**
- Orchestration & scaling — **Kubernetes (Helm + KEDA)**
- Monitoring — **Prometheus + Grafana + Alertmanager**

This combination supports secure multi-tenancy, row-level security (RLS), sharding via partitioning, autoscaling, and full observability.

---
## 2) Components Deployed (by Helm)
- PostgreSQL 15 (StatefulSet, PVCs) with **pgvector** extension and partitioned tables
- pgBouncer (Deployment) for pooling
- Qdrant (StatefulSet) configured with vector collection(s)
- ClickHouse (StatefulSet) for analytics
- Redis (StatefulSet/Deployment) for queues/caching
- Vault (Helm or ephemeral dev-mode in staging) for secrets
- MinIO or external S3-compatible endpoint for backups
- Prometheus (scraping exporters) + Grafana dashboards + Alertmanager
- Flyway job / init container to run SQL migrations (locking-aware)
- KEDA ScaledObjects + HPA for worker autoscaling
- Ingest workers (Deployment) for batch ingestion and Qdrant syncing

---
## 3) Prerequisites
- Kubernetes cluster (EKS / GKE / AKS / DOKS / k3s) with >= 8 CPUs and 32GB RAM for a non-trivial staging environment. Production requires larger nodes and multi-AZ setup.
- Helm 3 installed (`helm` CLI)
- kubectl configured to point at the cluster
- Docker registry access (for pushing images) or use public images where appropriate
- Vault provisioned (recommended: Vault HA with Kubernetes auth) or use the provided Vault Helm chart in the chart
- S3 bucket (or MinIO) for backups, with KMS for encryption recommended
- TLS ingress (cert-manager) for production HTTPS
- Optional: Terraform for infra provisioning (VPC, IAM, EKS, RDS if using managed Postgres)

---
## 4) Folder / Helm Chart Structure (recommended)
```
helm-chart/
  charts/
  templates/
  values.yaml
  Chart.yaml
  README.md
  templates/postgres-statefulset.yaml
  templates/pgbouncer-deployment.yaml
  templates/qdrant-statefulset.yaml
  templates/clickhouse-statefulset.yaml
  templates/redis-deployment.yaml
  templates/vault.yaml
  templates/minio.yaml
  templates/prometheus.yaml
  templates/grafana.yaml
  templates/secret-templates.yaml  # references to vault occupancy or k8s secrets
  templates/migration-job.yaml    # Flyway init job with preconditions and lock
  templates/keda-scaledobject.yaml
  templates/hpa.yaml
  templates/backup-cronjob.yaml
```
`values.yaml` contains environment-specific settings (replicas, resources, storage classes, image tags, secrets paths). Keep secrets out of values.yaml; use Vault or Kubernetes Secrets for credentials.

---
## 5) Secrets & Vault Integration
**Recommended:** store all credentials in Vault and let the Helm chart reference them using the Vault Agent Injector or Kubernetes External Secrets (KES).

Secrets to provide:
- PostgreSQL root credentials / superuser
- pgbouncer user credentials
- Qdrant admin token if configured
- MinIO (S3) access key & secret
- Vault AppRole ID & Secret or ServiceAccount (Kubernetes auth)
- Grafana admin password
- TLS certs (via cert-manager or mounted secrets)

**Example approach:** Use Kubernetes External Secrets or HashiCorp Vault Agent Injector to create k8s secrets with short-lived lease rotation. Ensure the Helm chart uses k8s secrets names rather than plaintext values.

---
## 6) Configure `values.yaml` (example snippets)
```yaml
postgres:
  enabled: true
  image: postgres:15
  storageClass: gp2
  storageSize: 100Gi
  resources:
    requests:
      cpu: "1000m"
      memory: "2Gi"
qdrant:
  image: qdrant/qdrant:v1.2.1
  storageClass: gp2
  storageSize: 200Gi
pgbouncer:
  poolSize: 50
vault:
  enabled: true
  # Use Vault Helm chart values to enable k8s auth and setup initial policy
monitoring:
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPasswordSecret: grafana-admin-secret
backup:
  s3Bucket: neuroedge-backups
  s3Endpoint: https://s3.amazonaws.com
```
**Important:** Replace resource values and storage classes with ones appropriate for your cloud provider.

---
## 7) One-shot Deploy (Helm)
**Step 0 — Prepare secrets**
1. Populate Vault KV or create Kubernetes Secrets for required credentials.
2. Ensure CSI driver / secrets provider for Vault is installed (if using Vault).

**Step 1 — Add Helm repos (if chart dependencies)**
```bash
helm repo add qdrant https://qdrant.github.io/qdrant-helm/
helm repo update
```

**Step 2 — Install the NeuroEdge chart**
```bash
kubectl create ns neuroedge
helm install neuroedge ./helm-chart -n neuroedge --values ./helm-chart/values.yaml
```

**Step 3 — Verify**
```bash
kubectl get pods -n neuroedge
kubectl get svc -n neuroedge
kubectl logs deployment/neuroedge-pgbouncer -n neuroedge
```
If migrations are configured as a Job, ensure the migration Job completed successfully:
```bash
kubectl get jobs -n neuroedge
kubectl logs job/neuroedge-flyway -n neuroedge
```

---
## 8) Post-deploy Steps & Verification
- Run DB smoke tests: connect via pgbouncer and run example queries.
- Check RLS is active: use admin session to `SET neuro.tenant_id` and query `agents_base`.
- Qdrant: verify collection exists (`curl /collections`).
- Ingestion: enqueue a sample vector to Redis and check worker processes it and Qdrant returns a K-NN query.
- Monitoring: open Grafana (port-forward or ingress) and import dashboards.
- Backups: run `kubectl create job` or cron to take a backup and confirm upload to S3/MinIO.

Commands:
```bash
# Port-forward Grafana for quick check
kubectl port-forward svc/neuroedge-grafana 3000:3000 -n neuroedge
# check qdrant collections
curl http://$(kubectl get svc -n neuroedge qdrant -o jsonpath='{.spec.clusterIP}'):6333/collections
```

---
## 9) Migrations & Flyway (CI integration)
**CI Pipeline:** Use GitHub Actions to run Flyway with DB creds retrieved from Vault (see `flyway_run_with_vault.sh` example). Use a job/pod-level lock if applying migrations in-cluster to prevent concurrency.

Example GitHub Action step snippet:
```yaml
- name: Run Flyway
  run: ./scripts/flyway_run_with_vault.sh kv/data/neuroedge/database/root
  env:
    VAULT_ADDR: ${{ secrets.VAULT_ADDR }}
    VAULT_TOKEN: ${{ secrets.VAULT_TOKEN }}
```

---
## 10) Backups & Restore
- **Postgres:** pg_dump → gzip → upload to S3 (KMS SSE recommended).
- **Qdrant:** use Qdrant snapshot API or export points to S3.
- **ClickHouse:** use `BACKUP`/`S3` integration.
- Store backups in lifecycle-managed S3 bucket with versioning and lifecycle rules.
- Test restores in a staging environment regularly.

Example backup job (CronJob template included in Helm chart):
```yaml
apiVersion: batch/v1
kind: CronJob
metadata: { name: neuroedge-backup }
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: appropriate/curl
              command: ["/bin/sh","-c","pg_dump ... | aws s3 cp - s3://..."]
```

---
## 11) Scaling & Autoscaling
- Use **KEDA** to scale ingestion workers by Redis queue length.
- Use **HPA** for CPU-based autoscaling of services (pgBouncer, workers).
- For PostgreSQL, use **Patroni + ReplicaSets** and a read-replica topology: do not scale writes horizontally; scale read replicas for analytics.
- For Qdrant, use cluster mode (if necessary) and scale replicas according to QPS and memory requirements.

---
## 12) Observability
- Ensure `pg_stat_statements` is enabled for Postgres to monitor slow queries.
- Scrape metrics from Postgres exporter, Qdrant, ClickHouse, and Workers.
- Grafana dashboards included in Helm chart (provisioning) for quick visualization.
- Configure Alertmanager rules for:
  - Postgres high query latency
  - Qdrant error rates
  - Backup failures
  - High Redis queue length

---
## 13) Security Hardening Checklist
- Enable TLS for all internal and external traffic (Ingress + service mesh if used).
- Use Vault with Kubernetes auth for secrets; do not store secrets in Helm values.yaml.
- Enable network policies to restrict cross-namespace communication.
- Run vulnerability scanning on images (Trivy), and enforce image policies.
- Limit RBAC in Kubernetes to least-privilege.
- Rotate credentials regularly and enforce short TTLs for dynamic DB creds via Vault.
- Use Pod Security Policies / Pod Security Admission / OPA Gatekeeper policies.

---
## 14) Disaster Recovery & Rollback
**Zero-downtime upgrade strategy:**
- Use blue/green switch for frontend/backends.
- For DB migrations, favor non-destructive migrations or use `pg_repack` / `online schema change` patterns.
- Keep automatic rollback steps in CI: on failed health checks after deploy, rollback Helm release:
```bash
helm rollback neuroedge 1 -n neuroedge
```

**PostSwap tests for engines:** run health checks and smoke tests after swap; if failures, revert.

---
## 15) CI/CD & GitOps Suggestions
- Use ArgoCD / Flux for GitOps to keep deployments declarative.
- Use GitHub Actions + HashiCorp Vault Action to inject dynamic secrets in CI.
- Use image scanning & SCA in pipeline; require approvals for production deploys.

---
## 16) Troubleshooting
- Common issues & checks:
  - Pod CrashLoopBackOff: `kubectl logs -n neuroedge <pod>`
  - Postgres connection refused: check pgbouncer logs & secrets
  - Qdrant failure: inspect `/qdrant/storage` and memory
  - Migration stuck: check Flyway logs and DB locks
- If all else fails, restore from the latest backup to a staging environment and retry migration steps.

---
## 17) Appendix: SQL Schema Overview / Key Queries
**Key tables:**
- `tenants` — tenant registry
- `users` — tenant-scoped users (tenant_id nullable for global admins)
- `engines` — registered engines per-tenant
- `agents_base` — partitioned agent metadata (tenant partitioned)
- `vectors_base` — partitioned vector metadata and pointer to Qdrant

**Sample: create tenant and partitions**
```sql
INSERT INTO tenants (name) VALUES ('tenant-a') RETURNING id;
SELECT create_tenant_partitions('<tenant-id>');
```
**Set tenant for session (RLS context):**
```sql
SELECT set_config('neuro.tenant_id', '<tenant-id>', true);
SELECT set_config('neuro.role', 'user', true);
-- Then queries on agents_base will be scoped to tenant
SELECT * FROM agents_base;
```

---
## Final notes
This README is a full guide for deploying the NeuroEdge database stack on Kubernetes using a one-shot Helm installation. The Helm chart included in the package is opinionated but extensible. Always test in staging before promoting to production. Replace placeholders in secrets and values files with secure values or integrate Vault/Kubernetes External Secrets.

If you want, I can now:
- Generate the actual Helm chart (templates + values.yaml) zipped for download
- Generate Terraform + Helm deployment scripts specific to AWS, Azure, or DigitalOcean
- Or produce a step-by-step video script you can follow while deploying

Reply **"Helm chart"** to get the chart bundle, or **"Terraform"** to get Terraform + Helm manifests for a cloud provider.
