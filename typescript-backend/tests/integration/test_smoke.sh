#!/bin/bash
set -e
ROOT=$(pwd)
echo "Starting docker compose..."
docker-compose up -d --build
echo "Waiting for services..."
sleep 8
echo "Running smoke tests..."
# Test Next.js health (proxied to Python)
curl -f http://localhost:3000/api/agents || (echo "agents failed" && exit 1)
curl -f http://localhost:3000/api/metrics || (echo "metrics failed" && exit 1)
curl -f http://localhost:3000/api/memory || (echo "memory failed" && exit 1)
curl -f http://localhost:3000/api/recommendations || (echo "recs failed" && exit 1)
echo "Smoke tests passed."
docker-compose down -v
