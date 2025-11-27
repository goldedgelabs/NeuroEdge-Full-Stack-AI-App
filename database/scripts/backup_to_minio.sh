#!/bin/bash
set -e
BUCKET=${BUCKET:-${PGUSER:-__DB_USER__}edge-backups}
FNAME=${PGUSER:-__DB_USER__}edge-$(date +%F-%H%M%S).sql.gz
PGPASSWORD=${PGPASSWORD:-${PGPASSWORD:-__POSTGRES_PASSWORD__}}
pg_dump -h ${PGHOST:-${PGHOST:-localhost}} -U ${PGUSER:-${PGUSER:-__DB_USER__}} -d ${PGUSER:-__DB_USER__}edge | gzip > /tmp/${FNAME}
# upload to minio (mc) or aws cli if configured; using aws s3 here with MINIO endpoint override optional
aws --endpoint-url=${S3_ENDPOINT:-http://${PGHOST:-localhost}:${S3_ENDPOINT_PORT:-9000}} s3 cp /tmp/${FNAME} s3://${BUCKET}/${FNAME}
echo "Backup uploaded to s3://${BUCKET}/${FNAME}"
