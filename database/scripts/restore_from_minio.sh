#!/bin/bash
set -e
KEY=${1:-latest}
BUCKET=${BUCKET:-${PGUSER:-__DB_USER__}edge-backups}
if [ "$KEY" = "latest" ]; then
  KEY=$(aws --endpoint-url=${S3_ENDPOINT:-http://${PGHOST:-localhost}:${S3_ENDPOINT_PORT:-9000}} s3 ls s3://${BUCKET}/ | awk '{print $4}' | sort | tail -n1)
fi
echo "Restoring key: $KEY"
aws --endpoint-url=${S3_ENDPOINT:-http://${PGHOST:-localhost}:${S3_ENDPOINT_PORT:-9000}} s3 cp s3://${BUCKET}/${KEY} - | gunzip | psql -h ${PGHOST:-${PGHOST:-localhost}} -U ${PGUSER:-${PGUSER:-__DB_USER__}} -d ${PGUSER:-__DB_USER__}edge
echo "Restore complete."
