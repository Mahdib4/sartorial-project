-- Order enquiries and fitting requests sent from the website, and newsletter sign-ups.
-- Applied by `npm run db:migrate` (scripts/db-migrate.mjs). Never edit an applied
-- migration: add a new numbered file instead.

CREATE TABLE IF NOT EXISTS enquiries (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- The reference quoted in the visitor's WhatsApp message, e.g. SRT-261122-7KQ3
  reference       text        NOT NULL UNIQUE,
  kind            text        NOT NULL CHECK (kind IN ('order', 'appointment')),
  status          text        NOT NULL DEFAULT 'new',
  channel         text        NOT NULL DEFAULT 'whatsapp',
  customer_name   text        NOT NULL,
  phone           text,
  email           text,
  interest        text,
  occasion        text,
  preferred_time  text,
  notes           text,
  -- [{ slug, name, reference, category, size, qty, url }], checked against the catalogue
  items           jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- The exact text handed to WhatsApp
  message         text        NOT NULL,
  page_url        text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries (status);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email       text        PRIMARY KEY,
  source      text        NOT NULL DEFAULT 'website',
  created_at  timestamptz NOT NULL DEFAULT now()
);
