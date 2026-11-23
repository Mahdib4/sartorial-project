import { cacheLife, cacheTag } from "next/cache";
import type { Pool, PoolClient } from "pg";
import { db } from "@/lib/db";
import { CATEGORIES } from "./categories";
import { PRODUCTS } from "./products";
import { DEFAULT_NOTICES, DEFAULT_SETTINGS, withDefaults } from "./seed";
import type { Banner, Category, ColourFamily, Curated, Offer, Product, SiteSettings, SizeScaleKey, UploadedImage } from "./types";

/**
 * Where the website's content comes from.
 *
 * With DATABASE_URL set, everything the admin manages is read from Neon: the
 * catalogue, uploaded photographs, banners and notices, offers, curated
 * collections and settings. The first time the site meets an empty database it
 * copies in the catalogue that ships with the code. Without a database (or if
 * it cannot be reached) the site falls back to that built-in catalogue, so it
 * never goes down with the database.
 *
 * The whole lot is one cached read, tagged "catalog". Every admin change calls
 * updateTag("catalog"), so pages are rebuilt with the new content on their next
 * visit; otherwise they refresh every few minutes (which is also when scheduled
 * banners and offers start and stop).
 */

export const CATALOG_TAG = "catalog";

export type CatalogData = {
  source: "database" | "static";
  /** Every category and product, hidden ones included (the Catalog class filters them). */
  categories: Category[];
  products: Product[];
  uploads: UploadedImage[];
  /** Only those live right now. */
  banners: Banner[];
  offers: Offer[];
  curated: Curated[];
  settings: SiteSettings;
};

export async function loadCatalogData(): Promise<CatalogData> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife({ stale: 300, revalidate: 300, expire: 7 * 86400 });

  const pool = db();
  if (!pool) return staticCatalog();
  try {
    await ensureSeeded(pool);
    return await readCatalog(pool);
  } catch (error) {
    console.error("catalog: database unavailable, using the built-in catalogue:", error instanceof Error ? error.message : error);
    return staticCatalog();
  }
}

// ── Built-in catalogue ─────────────────────────────────────────

export function staticCatalog(): CatalogData {
  return {
    source: "static",
    categories: CATEGORIES.map((c) => ({ ...c, visible: true })),
    products: PRODUCTS.map((p) => ({ ...p, visible: true })),
    uploads: [],
    banners: DEFAULT_NOTICES,
    offers: [],
    curated: [],
    settings: DEFAULT_SETTINGS,
  };
}

// ── Reading ────────────────────────────────────────────────────

type Row = Record<string, unknown>;
const opt = <T>(v: T | null | undefined) => (v === null || v === undefined || v === "" ? undefined : v);
const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : typeof v === "string" ? v : null);

export function rowToCategory(r: Row): Category {
  return {
    key: r.key as string,
    slug: r.slug as string,
    collection: r.collection as Category["collection"],
    name: r.name as string,
    blurb: r.blurb as string,
    intro: r.intro as string,
    preview: r.preview as string[],
    ...(opt(r.film) ? { film: r.film as string } : {}),
    sizes: r.sizes as SizeScaleKey,
    ...(Array.isArray(r.edit) && r.edit.length ? { edit: r.edit as Category["edit"] } : {}),
    visible: r.visible as boolean,
  };
}

export function rowToProduct(r: Row): Product {
  return {
    slug: r.slug as string,
    name: r.name as string,
    category: r.category as string,
    images: r.images as string[],
    ...((r.videos as string[]).length ? { videos: r.videos as string[] } : {}),
    colour: r.colour as string,
    colourFamily: r.colour_family as ColourFamily,
    ...(opt(r.fabric) ? { fabric: r.fabric as string } : {}),
    ...(opt(r.code) ? { code: r.code as string } : {}),
    occasions: r.occasions as string[],
    summary: r.summary as string,
    description: r.description as string,
    details: r.details as string[],
    ...(opt(r.note) ? { note: r.note as string } : {}),
    ...(typeof r.price === "number" ? { price: r.price } : {}),
    ...(typeof r.sale_price === "number" ? { salePrice: r.sale_price } : {}),
    ...(opt(r.badge) ? { badge: r.badge as string } : {}),
    visible: r.visible as boolean,
    featured: r.featured as boolean,
  };
}

export function rowToBanner(r: Row): Banner {
  return {
    id: Number(r.id),
    placement: r.placement as Banner["placement"],
    title: r.title as string,
    eyebrow: r.eyebrow as string,
    body: r.body as string,
    cta: r.cta as string,
    image: (r.image as string | null) ?? null,
    linkType: r.link_type as Banner["linkType"],
    linkTarget: r.link_target as string,
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
    active: r.active as boolean,
    position: r.position as number,
  };
}

export function rowToOffer(r: Row): Offer {
  return {
    id: Number(r.id),
    name: r.name as string,
    kind: r.kind as Offer["kind"],
    value: r.value as number,
    scope: r.scope as Offer["scope"],
    targets: r.targets as string[],
    badge: r.badge as string,
    startsAt: iso(r.starts_at),
    endsAt: iso(r.ends_at),
    active: r.active as boolean,
  };
}

export function rowToCurated(r: Row): Curated {
  return {
    slug: r.slug as string,
    title: r.title as string,
    eyebrow: r.eyebrow as string,
    intro: r.intro as string,
    cover: (r.cover as string | null) ?? null,
    products: r.products as string[],
    isLaunch: r.is_launch as boolean,
    visible: r.visible as boolean,
    position: r.position as number,
  };
}

/** True when a scheduled item is switched on and inside its dates. */
export function isLive(item: { active: boolean; startsAt: string | null; endsAt: string | null }, now = new Date()): boolean {
  if (!item.active) return false;
  if (item.startsAt && new Date(item.startsAt) > now) return false;
  if (item.endsAt && new Date(item.endsAt) <= now) return false;
  return true;
}

async function readCatalog(pool: Pool): Promise<CatalogData> {
  const [categories, products, uploads, banners, offers, curated, settings] = await Promise.all([
    pool.query("SELECT key, slug, collection, name, blurb, intro, preview, film, sizes, edit, visible FROM categories ORDER BY position, name"),
    pool.query(
      "SELECT slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note, price, sale_price, badge, featured, visible FROM products ORDER BY position, created_at",
    ),
    pool.query("SELECT id, w, h, widths, blur, bg FROM media"),
    pool.query("SELECT * FROM banners ORDER BY position, id"),
    pool.query("SELECT * FROM offers ORDER BY id"),
    pool.query("SELECT * FROM curated WHERE visible ORDER BY position, created_at DESC"),
    pool.query("SELECT key, value FROM settings"),
  ]);
  const now = new Date();
  return {
    source: "database",
    categories: categories.rows.map(rowToCategory),
    products: products.rows.map(rowToProduct),
    uploads: uploads.rows.map((r) => ({ id: r.id, w: r.w, h: r.h, widths: r.widths, blur: r.blur, bg: r.bg })),
    banners: banners.rows.map(rowToBanner).filter((b) => isLive(b, now)),
    offers: offers.rows.map(rowToOffer).filter((o) => isLive(o, now)),
    curated: curated.rows.map(rowToCurated),
    settings: withDefaults(Object.fromEntries(settings.rows.map((r) => [r.key, r.value]))),
  };
}

// ── First run: copy the built-in catalogue into the database ───

let seeded = false;

async function ensureSeeded(pool: Pool): Promise<void> {
  if (seeded) return;
  const { rows } = await pool.query("SELECT EXISTS (SELECT 1 FROM categories) AS has");
  if (rows[0].has) {
    seeded = true;
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('sartorial:seed'))");
    const again = await client.query("SELECT EXISTS (SELECT 1 FROM categories) AS has");
    if (!again.rows[0].has) await seed(client);
    await client.query("COMMIT");
    seeded = true;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function seed(client: PoolClient): Promise<void> {
  for (const [i, c] of CATEGORIES.entries()) {
    await client.query(
      `INSERT INTO categories (key, slug, collection, name, blurb, intro, preview, film, sizes, edit, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::jsonb, $11) ON CONFLICT (key) DO NOTHING`,
      [c.key, c.slug, c.collection, c.name, c.blurb, c.intro, JSON.stringify(c.preview), c.film ?? null, c.sizes, c.edit ? JSON.stringify(c.edit) : null, i],
    );
  }
  for (const [i, p] of PRODUCTS.entries()) {
    await client.query(
      `INSERT INTO products (slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note, price, position)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10::jsonb, $11, $12, $13::jsonb, $14, $15, $16) ON CONFLICT (slug) DO NOTHING`,
      [
        p.slug, p.name, p.category, JSON.stringify(p.images), JSON.stringify(p.videos ?? []), p.colour, p.colourFamily, p.fabric ?? null, p.code ?? null,
        JSON.stringify(p.occasions), p.summary, p.description, JSON.stringify(p.details), p.note ?? null, p.price ?? null, i,
      ],
    );
  }
  for (const n of DEFAULT_NOTICES) {
    await client.query(
      `INSERT INTO banners (placement, title, cta, link_type, link_target, position) VALUES ('bar', $1, $2, $3, $4, $5)`,
      [n.title, n.cta, n.linkType, n.linkTarget, n.position],
    );
  }
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.query("INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO NOTHING", [key, JSON.stringify(value)]);
  }
}
