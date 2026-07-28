-- Initial schema for herztiere (Issue #1)
-- Datenquelle: Stadt Wien, Fundtiere Wien, data.gv.at, Lizenz CC BY 4.0
-- siehe docs/data-source.md

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  breed TEXT,
  gender TEXT,
  color TEXT,
  birth_year INTEGER,
  is_mixed BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  location TEXT,
  found_date DATE,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'adopted', 'removed')),
  source_url TEXT NOT NULL,
  manually_edited BOOLEAN NOT NULL DEFAULT false,
  overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_animals_status ON animals (status);
CREATE INDEX idx_animals_category ON animals (category);

CREATE TABLE likes (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES animals (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, animal_id)
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users (id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'error')),
  created_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  removed_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'schedule'
);
