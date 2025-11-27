
#!/bin/bash
# Simple heuristic: lists = max(10, sqrt(N))
# Usage: ./scripts/tune_ivfflat.sh POSTGRES_URL
set -e
if [ -z "$1" ]; then echo "Usage: $0 POSTGRES_URL"; exit 1; fi
PSQL="$1"
N=$(psql "$PSQL" -t -c "SELECT count(1) FROM vectors;" | tr -d '[:space:]')
if [ -z "$N" ]; then echo "Failed to get count"; exit 1; fi
lists=$(python3 - <<PY
import math,sys
n=int(sys.argv[1])
val=int(max(10, math.sqrt(n)))
print(val)
PY $N)
echo "Row count: $N, choosing lists=$lists"
cat <<SQL > /tmp/create_ivf.sql
DROP INDEX IF EXISTS idx_vectors_embedding_ivfflat;
CREATE INDEX idx_vectors_embedding_ivfflat ON vectors USING ivfflat (embedding vector_l2_ops) WITH (lists = $lists);
SQL
echo "Run: psql "$PSQL" -f /tmp/create_ivf.sql"
