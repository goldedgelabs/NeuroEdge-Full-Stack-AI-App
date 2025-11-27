
#!/bin/bash
# Simple load test: spawn N concurrent loops calling StorageEngine upsert/query and trigger reload
SET -e
BASE=http://localhost:9000
CONCURRENCY=20
DURATION=30
echo "Starting load test: concurrency=$CONCURRENCY duration=$DURATION"
for i in $(seq 1 $CONCURRENCY); do
  ( while :; do
      id=$(printf "item-%d-%s" "$i" "$(date +%s%N)")
      curl -s -X POST "$BASE/runEngine?name=StorageEngine" -d "{"action":"upsert","id":"$id","vector":[0.1,0.2,0.3]}" -H "Content-Type: application/json" > /dev/null
      curl -s -X POST "$BASE/runEngine?name=StorageEngine" -d "{"action":"query","vector":[0.1,0.2,0.3]}" -H "Content-Type: application/json" > /dev/null
      sleep 0.1
    done ) &
done
# run for DURATION seconds, then trigger reload
sleep $DURATION
echo "Triggering engine reload..."
curl -s -X POST "$BASE/admin/engine/reload?name=StorageEngine" -H "Authorization: Bearer $(curl -s -X POST $BASE/api/auth/login -d '{"username":"test","role":"operator"}' -H "Content-Type: application/json" | jq -r .access)"
echo "Reload triggered. Waiting a bit..."
sleep 5
echo "Killing background workers..."
pkill -P $$
echo "Load test complete."
