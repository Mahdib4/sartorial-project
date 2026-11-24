import { cacheLife, cacheTag } from "next/cache";
import type { Pool, PoolClient } from "pg";
import { db } from "@/lib/db";
import { CATEGORIES, COLLECTION_ORDER } from "./categories";
import { PRODUCTS } from "./products";
import { DEFAULT_NOTICES, DEFAULT_SETTINGS, withDefaults } from "./seed";
import type { Banner, Category, ColourFamily, Curated, Offer, Product, SiteSettings, SizeScaleKey, UploadedImage } from "./types";

/**
 * Where the website's content comes from.
 *
 * With DATABASE_URL set, everything the admin manages is read from Neon: the
 * catalogue, uploaded photographs, banners and notices, offers, curated
 * collections and settings. The very first time the site meets an empty
 * database it copies in the catalogue that ships with the code, and notes in
 * settings ("catalogue_seeded") that it has done so: it never copies it again,
 * so a category or piece the house deletes stays deleted. Without a database
 * the site shows that built-in catalogue.
 *
 * The whole lot is one cached read, tagged "catalog". Every admin change calls
 * updateTag("catalog"), so pages are rebuilt with the new content on their next
 * visit. Otherwise pages refresh every five minutes and are never served more
 * than an hour old. When a banner or offer is due to start or end sooner than
 * that, the cache is cut short to its time, so the change shows on the first
 * visit after it (on a quiet page, at most one visitor in the five minutes after
 * it may still see the old version while the page is rebuilt).
 *
 * If the database cannot be reached, the read is tried once more; if that fails
 * too, the site keeps showing the last catalogue it read (the built-in one only
 * when it has none, e.g. straight after a restart) and tries the database again
 * within half a minute. A failure is never kept for long.
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

/** Normal life of the cached catalogue: refreshed every five minutes, never served more than an hour old. */
const NORMAL_LIFE = { stale: 300, revalidate: 300, expire: 3600 };
/** After a failed read: try the database again soon. (Next needs stale >= 30 s and expire >= 5 min to keep pages prerendered.) */
const RETRY_LIFE = { stale: 30, revalidate: 30, expire: 300 };

/**
 * The last catalogue read from the database in this server process, with every
 * switched-on banner and offer (not only the live ones), so it can be served
 * again if the database is briefly unreachable.
 */
let lastGood: CatalogData | null = null;

export async function loadCatalogData(): Promise<CatalogData> {
  "use cache";
  cacheTag(CATALOG_TAG);
  // Taken before the read: Next times the cache entry from when it starts, and the
  // schedule below must line up with that.
  const now = new Date();

  const pool = db();
  let failed = false;
  if (pool) {
    const fresh = await readFromDatabase(pool);
    if (fresh) lastGood = fresh;
    else failed = true;
  }
  const { data, nextChange } = liveAt(lastGood ?? staticCatalog(), now);
  // Exactly one cacheLife call per run, decided once the read has succeeded or failed.
  cacheLife(failed ? RETRY_LIFE : lifeUntil(nextChange, now));
  return data;
}

/** A first try that fails slower than this (a timeout) is not repeated: the visitor has waited long enough. */
const RETRY_WITHIN_MS = 6_000;

/** Read the catalogue, trying once more after a short pause if the first try failed quickly. Null when it cannot be read. */
async function readFromDatabase(pool: Pool): Promise<CatalogData | null> {
  const started = Date.now();
  for (let attempt = 1; ; attempt++) {
    try {
      await ensureSeeded(pool);
      return await readCatalog(pool);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt >= 2 || Date.now() - started > RETRY_WITHIN_MS) {
        console.error(`catalog: database unavailable (${message}); showing ${lastGood ? "the last catalogue read" : "the built-in catalogue"} and trying again shortly`);
        return null;
      }
      console.warn(`catalog: database read failed (${message}); trying once more`);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }
}

/** Keep only the banners and offers live at `now`, and find when the next one starts or ends. */
function liveAt(data: CatalogData, now: Date): { data: CatalogData; nextChange: number | null } {
  const t = now.getTime();
  let nextChange: number | null = null;
  for (const item of [...data.banners, ...data.offers]) {
    if (!item.active) continue;
    for (const at of [item.startsAt, item.endsAt]) {
      const when = at ? Date.parse(at) : Number.NaN;
      if (when > t && (nextChange === null || when < nextChange)) nextChange = when;
    }
  }
  return {
    data: { ...data, banners: data.banners.filter((b) => isLive(b, now)), offers: data.offers.filter((o) => isLive(o, now)) },
    nextChange,
  };
}

/**
 * The cache life for a catalogue whose next scheduled change is at `nextChange`.
 * The entry expires at that time when it can (the next visit then waits for
 * fresh content); within the last five minutes, when Next will not let it
 * expire any sooner (an expire under 5 minutes, or a stale under 30 seconds,
 * would take the catalogue out of the prerendered pages), it is marked for
 * refreshing at that time instead. Visitors' browsers re-check within a minute.
 */
function lifeUntil(nextChange: number | null, now: Date): { stale: number; revalidate: number; expire: number } {
  if (nextChange === null) return NORMAL_LIFE;
  // One second over, so the refresh always lands just after the change, never just before it.
  const seconds = Math.max(1, Math.ceil((nextChange - now.getTime()) / 1000)) + 1;
  if (seconds >= NORMAL_LIFE.expire) return NORMAL_LIFE;
  if (seconds > NORMAL_LIFE.revalidate) return { stale: 60, revalidate: NORMAL_LIFE.revalidate, expire: seconds };
  return { stale: 30, revalidate: seconds, expire: 300 };
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

/**
 * Everything the website shows, in the order the admin sets: products by
 * department (Heritage, Classic, Accessories, Footwear), then by their
 * category's place in it, then by their own place in the category. Positions
 * are numbered within each category, so they are never compared across
 * categories. Banners and offers come back whether or not they are live yet
 * (only those switched on); liveAt() picks the live ones.
 */
async function readCatalog(pool: Pool): Promise<CatalogData> {
  const departments = COLLECTION_ORDER as string[];
  const [categories, products, uploads, banners, offers, curated, settings] = await Promise.all([
    pool.query(
      "SELECT key, slug, collection, name, blurb, intro, preview, film, sizes, edit, visible FROM categories ORDER BY array_position($1::text[], collection), position, name",
      [departments],
    ),
    pool.query(
      `SELECT p.slug, p.name, p.category, p.images, p.videos, p.colour, p.colour_family, p.fabric, p.code, p.occasions, p.summary, p.description,
              p.details, p.note, p.price, p.sale_price, p.badge, p.featured, p.visible
       FROM products p JOIN categories c ON c.key = p.category
       ORDER BY array_position($1::text[], c.collection), c.position, c.name, p.position, p.created_at, p.slug`,
      [departments],
    ),
    pool.query("SELECT id, w, h, widths, blur, bg FROM media"),
    pool.query("SELECT * FROM banners WHERE active ORDER BY position, id"),
    pool.query("SELECT * FROM offers WHERE active ORDER BY id"),
    pool.query("SELECT * FROM curated WHERE visible ORDER BY position, created_at DESC"),
    // Only the settings the website uses (not the admin password, nor the note that the catalogue was copied in).
    pool.query("SELECT key, value FROM settings WHERE key = ANY($1::text[])", [Object.keys(DEFAULT_SETTINGS)]),
  ]);
  return {
    source: "database",
    categories: categories.rows.map(rowToCategory),
    products: products.rows.map(rowToProduct),
    uploads: uploads.rows.map((r) => ({ id: r.id, w: r.w, h: r.h, widths: r.widths, blur: r.blur, bg: r.bg })),
    banners: banners.rows.map(rowToBanner),
    offers: offers.rows.map(rowToOffer),
    curated: curated.rows.map(rowToCurated),
    settings: withDefaults(Object.fromEntries(settings.rows.map((r) => [r.key, r.value]))),
  };
}

// ── First run: copy the built-in catalogue into the database, once ──

/** The settings row that records the built-in catalogue has been copied in (or was not needed). */
export const SEEDED_SETTING = "catalogue_seeded";

let seeded = false;

/**
 * Copy the built-in catalogue into a new, empty database, once ever. The
 * "catalogue_seeded" setting records it, so a house that later deletes every
 * category never sees the built-in ones come back. A database that already has
 * categories but no record (filled before the record existed, or by
 * `npm run db:import-catalogue`) is only given the record.
 */
async function ensureSeeded(pool: Pool): Promise<void> {
  if (seeded) return;
  const { rows } = await pool.query("SELECT EXISTS (SELECT 1 FROM settings WHERE key = $1) AS done", [SEEDED_SETTING]);
  if (rows[0].done) {
    seeded = true;
    return;
  }
  const client = await pool.connect();
  let failure: Error | undefined;
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('sartorial:seed'))");
    const again = await client.query("SELECT EXISTS (SELECT 1 FROM settings WHERE key = $1) AS done, EXISTS (SELECT 1 FROM categories) AS has_categories", [
      SEEDED_SETTING,
    ]);
    if (!again.rows[0].done) {
      const copy = !again.rows[0].has_categories;
      if (copy) await seed(client);
      await client.query("INSERT INTO settings (key, value) VALUES ($1, jsonb_build_object('at', now(), 'copied', $2::boolean)) ON CONFLICT (key) DO NOTHING", [
        SEEDED_SETTING,
        copy,
      ]);
    }
    await client.query("COMMIT");
    seeded = true;
  } catch (error) {
    failure = error instanceof Error ? error : new Error(String(error));
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    // A connection that failed (a timeout, say) is closed rather than reused.
    client.release(failure);
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
