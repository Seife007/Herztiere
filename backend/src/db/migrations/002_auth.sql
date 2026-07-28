-- Issue #2: Registrierung, Login & Rollen

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

-- deleted_at aus Issue #1 wird nicht gebraucht: Selbstlöschung (dieses Issue) und
-- Admin-Löschung (Issue #5) entfernen den User-Datensatz vollständig (siehe
-- DSGVO-Löschungsrecht, Issue #7), statt ihn nur zu markieren.
ALTER TABLE users DROP COLUMN deleted_at;
