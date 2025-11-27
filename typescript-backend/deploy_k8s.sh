#!/bin/bash
# Simple Kubernetes deployment using docker images built locally and kind/cluster assumed
set -e
IMAGE_NAME=neuroedge-next:latest
docker build -t $IMAGE_NAME .
kubectl apply -f k8s/namespace.yaml
kubectl set image deployment/neuroedge-next neuroedge-next=$IMAGE_NAME -n neuroedge || kubectl apply -f k8s/deployment.yaml -n neuroedge
echo "Deployed to Kubernetes (ensure cluster and manifests exist under k8s/)"
