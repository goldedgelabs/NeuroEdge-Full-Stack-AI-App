
# NeuroEdge Helm Chart Guide (production)

## Prerequisites
- Kubernetes cluster (1.20+)
- cert-manager installed and a ClusterIssuer (e.g., letsencrypt-prod) configured
- PostgreSQL (or managed PG) reachable from the cluster
- Redis available

## Install
1. Customize `helm/values.production.yaml` with your production secrets and hostnames.
2. Create a TLS secret or let cert-manager provision certificates:
   - Ensure `certManager.enabled` is true and `certManager.issuerName` points to a valid ClusterIssuer.
3. Install the chart:
   ```bash
   helm upgrade --install neuroedge ./helm/neuroedge-go -f ./helm/values.production.yaml
   ```

## Secrets
The chart creates a Secret named `<release>-neuroedge-go-secrets` (see `templates/secrets.yaml`). Use Kubernetes Secret management best practices (sealed-secrets, external secrets, or HashiCorp Vault) in production.

## Ingress & TLS
Set `ingress.enabled=true` and configure `hosts` and `tls`. cert-manager will issue certificates for the `host` using the configured ClusterIssuer.

## Readiness & Liveness
- Readiness probe is `/health/engine?name=StorageEngine`
- Liveness probe is `/healthz`
Ensure StorageEngine SelfTest is fast and side-effect free for probes.
