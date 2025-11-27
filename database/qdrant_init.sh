#!/bin/bash
# Create Qdrant collection for NeuroEdge vectors
QDRANT=${QDRANT_URL:-${QDRANT_URL:-http://localhost:6333}}
curl -s -X PUT "$QDRANT/collections/neuroedge_vectors" -H "Content-Type: application/json" -d '{
  "vectors": { "size": 1536, "distance": "Cosine" },
  "optimizers_config": { "deleted_threshold": 0.2 }
}'
echo "Created qdrant collection neuroedge_vectors"
