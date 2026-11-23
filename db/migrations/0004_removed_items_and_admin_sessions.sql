-- Pieces and categories deleted in the admin. `npm run db:import-catalogue` skips
-- these, so a piece the house removed is not brought back from the built-in catalogue.
CREATE TABLE IF NOT EXISTS removed_items (
  kind text NOT NULL CHECK (kind IN ('product', 'category')),
  key text NOT NULL,
  removed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, key)
);

-- Admin sign-ins. The browser holds a signed cookie naming one of these rows:
-- signing out deletes it (so a copied cookie stops working), changing the
-- password deletes them all.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  user_agent text
);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at);
