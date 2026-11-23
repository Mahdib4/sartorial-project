-- The catalogue and everything the admin panel manages. The website reads these
-- tables through src/data/store.ts; on first run they are filled from the
-- catalogue that ships with the code (src/data/products.ts and categories.ts).

-- Categories within the four fixed departments (Heritage, Classic, Accessories, Footwear)
CREATE TABLE IF NOT EXISTS categories (
  key         text        PRIMARY KEY,               -- "<collection>/<slug>", e.g. heritage/sherwanis
  slug        text        NOT NULL,
  collection  text        NOT NULL CHECK (collection IN ('heritage', 'classic', 'accessories', 'footwear')),
  name        text        NOT NULL,
  blurb       text        NOT NULL DEFAULT '',
  intro       text        NOT NULL DEFAULT '',
  preview     jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- media ids shown on hover
  film        text,
  sizes       text        NOT NULL DEFAULT 'tailoring',
  edit        jsonb,                                     -- photographs shown while the category has no products
  position    integer     NOT NULL DEFAULT 0,
  visible     boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection, slug)
);

CREATE TABLE IF NOT EXISTS products (
  slug           text        PRIMARY KEY,
  name           text        NOT NULL,
  category       text        NOT NULL REFERENCES categories (key) ON UPDATE CASCADE ON DELETE RESTRICT,
  images         jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- media ids, first = card image
  videos         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  colour         text        NOT NULL DEFAULT '',
  colour_family  text        NOT NULL DEFAULT 'Multi',
  fabric         text,
  code           text,
  occasions      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  summary        text        NOT NULL DEFAULT '',
  description    text        NOT NULL DEFAULT '',
  details        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  note           text,
  price          integer,                                    -- whole taka; null = price on request
  sale_price     integer,                                    -- a reduced price for this piece
  badge          text,                                       -- e.g. "New", "Limited"
  featured       boolean     NOT NULL DEFAULT false,
  visible        boolean     NOT NULL DEFAULT true,
  position       integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category, position);

-- Photographs uploaded through the admin (stored in Cloudflare R2)
CREATE TABLE IF NOT EXISTS media (
  id          text        PRIMARY KEY,                   -- "uploads/<random>"
  w           integer     NOT NULL,
  h           integer     NOT NULL,
  widths      jsonb       NOT NULL,
  blur        text        NOT NULL,
  bg          text        NOT NULL,
  name        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Promotional banners (home page slot) and notices (announcement bar)
CREATE TABLE IF NOT EXISTS banners (
  id           bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  placement    text        NOT NULL CHECK (placement IN ('home', 'bar')),
  title        text        NOT NULL,
  eyebrow      text        NOT NULL DEFAULT '',
  body         text        NOT NULL DEFAULT '',
  cta          text        NOT NULL DEFAULT '',
  image        text,                                     -- media id
  link_type    text        NOT NULL DEFAULT 'none' CHECK (link_type IN ('none', 'product', 'category', 'collection', 'curated', 'url')),
  link_target  text        NOT NULL DEFAULT '',
  starts_at    timestamptz,
  ends_at      timestamptz,
  active       boolean     NOT NULL DEFAULT true,
  position     integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Discounts and special offers
CREATE TABLE IF NOT EXISTS offers (
  id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        text        NOT NULL,
  kind        text        NOT NULL DEFAULT 'percent' CHECK (kind IN ('percent', 'amount', 'note')),
  value       integer     NOT NULL DEFAULT 0,             -- percent, or taka off
  scope       text        NOT NULL DEFAULT 'products' CHECK (scope IN ('all', 'collection', 'category', 'products')),
  targets     jsonb       NOT NULL DEFAULT '[]'::jsonb,   -- collection keys, category keys or product slugs
  badge       text        NOT NULL DEFAULT '',            -- short label on cards, e.g. "Eid −15%"
  starts_at   timestamptz,
  ends_at     timestamptz,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Curated collections and launches, each with its own page (/collections/<slug>)
CREATE TABLE IF NOT EXISTS curated (
  slug        text        PRIMARY KEY,
  title       text        NOT NULL,
  eyebrow     text        NOT NULL DEFAULT '',
  intro       text        NOT NULL DEFAULT '',
  cover       text,                                       -- media id
  products    jsonb       NOT NULL DEFAULT '[]'::jsonb,   -- product slugs, in order
  is_launch   boolean     NOT NULL DEFAULT false,
  visible     boolean     NOT NULL DEFAULT true,
  position    integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Site settings edited in the admin: contact details, home page sections, admin password
CREATE TABLE IF NOT EXISTS settings (
  key         text        PRIMARY KEY,
  value       jsonb       NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
