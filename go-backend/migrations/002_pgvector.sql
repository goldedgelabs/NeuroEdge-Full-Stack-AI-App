
-- Enable pgvector extension and create vectors table with vector column
CREATE EXTENSION IF NOT EXISTS vector;
-- Set dimension as needed (default 1536). If you use a different dim, recreate the table.
CREATE TABLE IF NOT EXISTS vectors (
    id TEXT PRIMARY KEY,
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create index for ivfflat (optional, requires REINDEX after insert)
-- CREATE INDEX IF NOT EXISTS idx_vectors_embedding ON vectors USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
