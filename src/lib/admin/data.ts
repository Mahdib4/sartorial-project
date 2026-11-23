import { connection } from "next/server";
import { rowToBanner, rowToCategory, rowToCurated, rowToOffer, rowToProduct } from "@/data/store";
import { withDefaults } from "@/data/seed";
import type { Banner, Category, Curated, Offer, Product, SiteSettings } from "@/data/types";
import { db } from "@/lib/db";
import { builtInImageIds, hasImage, registerUploads, thumb, uploadUrl } from "@/lib/media";

/**
 * Reads for the admin panel: always fresh from the database (never cached),
 * hidden items included. Every function needs a connected database.
 */

async function pool() {
  await connection(); // request-time data: never prerendered
  const p = db();
  if (!p) throw new Error("NO_DATABASE");
  return p;
}

export async function listProducts(): Promise<Array<Product & { updatedAt: string }>> {
  const { rows } = await (await pool()).query(
    `SELECT p.*, p.updated_at FROM products p LEFT JOIN categories c ON c.key = p.category
     ORDER BY array_position(ARRAY['heritage','classic','accessories','footwear'], c.collection), c.position, p.position, p.created_at`,
  );
  return rows.map((r) => ({ ...rowToProduct(r), updatedAt: (r.updated_at as Date).toISOString() }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const { rows } = await (await pool()).query("SELECT * FROM products WHERE slug = $1", [slug]);
  return rows[0] ? rowToProduct(rows[0]) : null;
}

export async function listCategories(): Promise<Array<Category & { position: number; productCount: number }>> {
  const { rows } = await (await pool()).query(
    `SELECT c.*, (SELECT count(*)::int FROM products p WHERE p.category = c.key) AS product_count
     FROM categories c ORDER BY array_position(ARRAY['heritage','classic','accessories','footwear'], c.collection), c.position, c.name`,
  );
  return rows.map((r) => ({ ...rowToCategory(r), position: r.position as number, productCount: r.product_count as number }));
}

export async function getCategory(key: string): Promise<(Category & { position: number }) | null> {
  const { rows } = await (await pool()).query("SELECT * FROM categories WHERE key = $1", [key]);
  return rows[0] ? { ...rowToCategory(rows[0]), position: rows[0].position as number } : null;
}

export async function listBanners(): Promise<Banner[]> {
  const { rows } = await (await pool()).query("SELECT * FROM banners ORDER BY placement, position, id");
  return rows.map(rowToBanner);
}

export async function getBanner(id: number): Promise<Banner | null> {
  const { rows } = await (await pool()).query("SELECT * FROM banners WHERE id = $1", [id]);
  return rows[0] ? rowToBanner(rows[0]) : null;
}

export async function listOffers(): Promise<Offer[]> {
  const { rows } = await (await pool()).query("SELECT * FROM offers ORDER BY active DESC, id DESC");
  return rows.map(rowToOffer);
}

export async function getOffer(id: number): Promise<Offer | null> {
  const { rows } = await (await pool()).query("SELECT * FROM offers WHERE id = $1", [id]);
  return rows[0] ? rowToOffer(rows[0]) : null;
}

export async function listCurated(): Promise<Curated[]> {
  const { rows } = await (await pool()).query("SELECT * FROM curated ORDER BY position, created_at DESC");
  return rows.map(rowToCurated);
}

export async function getCurated(slug: string): Promise<Curated | null> {
  const { rows } = await (await pool()).query("SELECT * FROM curated WHERE slug = $1", [slug]);
  return rows[0] ? rowToCurated(rows[0]) : null;
}

export async function getSettings(): Promise<SiteSettings> {
  const { rows } = await (await pool()).query("SELECT key, value FROM settings WHERE key <> 'admin'");
  return withDefaults(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export type Enquiry = {
  id: number;
  reference: string;
  kind: "order" | "appointment";
  status: string;
  name: string;
  phone: string | null;
  email: string | null;
  interest: string | null;
  occasion: string | null;
  preferredTime: string | null;
  notes: string | null;
  items: Array<{ slug: string; name: string; reference: string; category: string; size: string; qty: number; url: string }>;
  createdAt: string;
};

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export async function listEnquiries(status?: string, limit = 200): Promise<Enquiry[]> {
  const p = await pool();
  const { rows } = status
    ? await p.query("SELECT * FROM enquiries WHERE status = $1 ORDER BY created_at DESC LIMIT $2", [status, limit])
    : await p.query("SELECT * FROM enquiries ORDER BY created_at DESC LIMIT $1", [limit]);
  return rows.map((r) => ({
    id: Number(r.id),
    reference: r.reference,
    kind: r.kind,
    status: r.status,
    name: r.customer_name,
    phone: r.phone,
    email: r.email,
    interest: r.interest,
    occasion: r.occasion,
    preferredTime: r.preferred_time,
    notes: r.notes,
    items: r.items,
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

export async function dashboardCounts() {
  const { rows } = await (await pool()).query(`SELECT
    (SELECT count(*)::int FROM products WHERE visible) AS products_live,
    (SELECT count(*)::int FROM products WHERE NOT visible) AS products_hidden,
    (SELECT count(*)::int FROM categories) AS categories,
    (SELECT count(*)::int FROM banners WHERE active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())) AS banners_live,
    (SELECT count(*)::int FROM offers WHERE active AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())) AS offers_live,
    (SELECT count(*)::int FROM curated WHERE visible) AS collections,
    (SELECT count(*)::int FROM enquiries WHERE status = 'new') AS enquiries_new,
    (SELECT count(*)::int FROM enquiries WHERE created_at > now() - interval '30 days') AS enquiries_30d`);
  return rows[0] as Record<string, number>;
}

export type LibraryImage = { id: string; src: string; label: string };

/** Every photograph the admin can choose from: uploads first (newest), then the built-in library. */
export async function mediaLibrary(): Promise<LibraryImage[]> {
  const { rows } = await (await pool()).query("SELECT id, w, h, widths, blur, bg, name FROM media ORDER BY created_at DESC");
  registerUploads(rows);
  const uploads = rows.map((r) => ({ id: r.id as string, src: uploadUrl(r.id, (r.widths as number[])[0]), label: (r.name as string) || "Uploaded photograph" }));
  const builtIn = builtInImageIds().map((id) => ({ id, src: thumb(id).src, label: id.split("/").pop()!.replace(/-/g, " ") }));
  return [...uploads, ...builtIn];
}

/** Thumbnails for a list of media ids (skipping any that no longer exist). */
export async function thumbsFor(ids: string[]): Promise<LibraryImage[]> {
  const uploads = ids.filter((id) => id.startsWith("uploads/"));
  if (uploads.length) {
    const { rows } = await (await pool()).query("SELECT id, w, h, widths, blur, bg FROM media WHERE id = ANY($1)", [uploads]);
    registerUploads(rows);
  }
  return ids.filter(hasImage).map((id) => ({ id, src: thumb(id).src, label: id.split("/").pop()!.replace(/-/g, " ") }));
}
