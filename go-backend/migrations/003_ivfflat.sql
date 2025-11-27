
-- Create ivfflat index for pgvector (requires vector extension and table with embedding)
-- Adjust lists value depending on dataset size. For example, lists = 100.
CREATE INDEX IF NOT EXISTS idx_vectors_embedding_ivfflat ON vectors USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- To create index for large datasets, you may need to CLUSTER or run REINDEX
-- Example: REINDEX INDEX idx_vectors_embedding_ivfflat;
