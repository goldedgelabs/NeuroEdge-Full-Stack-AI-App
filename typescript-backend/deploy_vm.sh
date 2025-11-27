#!/bin/bash
# Simple VM deploy script: build and run docker-compose on VM
set -e
docker-compose pull || true
docker-compose build --no-cache
docker-compose up -d --remove-orphans
echo "Services started via docker-compose."
