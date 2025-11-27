#!/bin/bash
# Run SQL migrations using psql (simple runner)
set -e
PGHOST=${PGHOST:-${PGHOST:-localhost}}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-${PGUSER:-__DB_USER__}}
PGPASSWORD=${PGPASSWORD:-${PGPASSWORD:-__POSTGRES_PASSWORD__}}
export PGPASSWORD
for f in ./migrations/*.sql; do
  echo "Applying $f"
  psql -h $PGHOST -U $PGUSER -d ${PGUSER:-__DB_USER__}edge -f "$f"
done
echo "Migrations applied."
