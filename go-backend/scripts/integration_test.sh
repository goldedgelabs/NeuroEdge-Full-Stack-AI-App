
#!/bin/bash
set -e
DIR=$(cd $(dirname $0); pwd)
cd "$DIR/.."
echo "Bringing up postgres and redis via docker-compose..."
docker-compose up -d postgres redis
echo "Waiting for Postgres to be ready..."
sleep 5
export POSTGRES_URL=postgres://neuro:neuro@localhost:5432/neuroedge
export REDIS_URL=redis://localhost:6379
echo "Running migrations..."
# attempt to run migrations via psql
docker-compose exec -T postgres psql -U neuro -d neuroedge -c "CREATE TABLE IF NOT EXISTS vectors (id TEXT PRIMARY KEY, vector DOUBLE PRECISION[], created_at TIMESTAMP WITH TIME ZONE DEFAULT now());"
echo "Building and running the service..."
make build
./neuroedge &
PID=$!
sleep 2
echo "Running smoke tests..."
curl -sS http://localhost:9000/health || (echo "health failed" && exit 1)
TOKEN=$(curl -s -X POST http://localhost:9000/api/auth/login -d '{"username":"test","role":"operator"}' -H "Content-Type: application/json" | jq -r .access)
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then echo "auth failed" && kill $PID && exit 1; fi
echo "Auth OK"
# upsert vector
curl -s -X POST "http://localhost:9000/runEngine?name=StorageEngine" -d '{"action":"upsert","id":"t1","vector":[0.1,0.2,0.3]}' -H "Content-Type: application/json"
# query vector
curl -s -X POST "http://localhost:9000/runEngine?name=StorageEngine" -d '{"action":"query","vector":[0.1,0.2,0.3]}' -H "Content-Type: application/json"
# call admin restart (requires JWT)
curl -s -X POST http://localhost:9000/admin/agents/restart -H "Authorization: Bearer $TOKEN"
echo "Smoke tests completed."
kill $PID
docker-compose down -v
