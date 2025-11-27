
-- 001_init.sql: NeuroEdge schema (Postgres + pgvector)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users (tenant-aware)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, email)
);

-- Engines
CREATE TABLE IF NOT EXISTS engines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  engine_type TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, name)
);

-- Partitioned agents table by tenant_id
CREATE TABLE IF NOT EXISTS agents_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idle',
  last_score DOUBLE PRECISION DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY LIST (tenant_id);

-- Partitioned vectors table by tenant_id
CREATE TABLE IF NOT EXISTS vectors_base (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL,
  key TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  usage_count BIGINT DEFAULT 0,
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
) PARTITION BY LIST (tenant_id);

-- Helper function to create per-tenant partitions
CREATE OR REPLACE FUNCTION create_tenant_partitions(t UUID) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS agents_t_%s PARTITION OF agents_base FOR VALUES IN (%%L)', replace(t::text,'-',''));
  EXECUTE format('CREATE TABLE IF NOT EXISTS vectors_t_%s PARTITION OF vectors_base FOR VALUES IN (%%L)', replace(t::text,'-',''));
END;
$$;

-- Enable RLS on core tables for multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE vectors_base ENABLE ROW LEVEL SECURITY;

-- Policy allowing tenant access based on session setting 'neuro.tenant_id'
CREATE POLICY tenant_isolation_users ON users USING ( tenant_id = current_setting('neuro.tenant_id', true)::uuid OR current_setting('neuro.role','') IN ('admin','superadmin') );
CREATE POLICY tenant_isolation_engines ON engines USING ( tenant_id = current_setting('neuro.tenant_id', true)::uuid OR current_setting('neuro.role','') IN ('admin','superadmin') );
CREATE POLICY tenant_isolation_agents ON agents_base USING ( tenant_id = current_setting('neuro.tenant_id', true)::uuid OR current_setting('neuro.role','') IN ('admin','superadmin') );
CREATE POLICY tenant_isolation_vectors ON vectors_base USING ( tenant_id = current_setting('neuro.tenant_id', true)::uuid OR current_setting('neuro.role','') IN ('admin','superadmin') );

-- Index for vectors: ivfflat for pgvector L2 ops
-- Note: After populating large number of vectors, run CREATE INDEX ... WITH (lists=100)
-- For small datasets, GIN may be fine, but ivfflat is faster for approximate NN
-- We'll create the index on the base table so partitions inherit it where supported
CREATE INDEX IF NOT EXISTS vectors_base_embedding_idx ON vectors_base USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
