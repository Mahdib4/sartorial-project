"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { PoolClient } from "pg";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dbMessage, lines, list, moneyField, slugify, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

const COLOUR_FAMILIES = ["Black", "Navy", "Blue", "Grey", "Brown", "Green", "Ivory", "Gold", "Pink", "Red", "White", "Multi"];
const OCCASIONS = ["Wedding", "Festive", "Black tie", "Business", "Casual"];

/** Web addresses the admin's own pages use (/admin/products/new is the "add" form). */
const RESERVED_SLUGS = new Set(["new"]);

/** Create or update a product. */
export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const original = text(form, "original", 120);
  const name = text(form, "name", 160);
  const typedSlug = text(form, "slug", 120);
  const slug = original || slugify(typedSlug || name);
  const category = text(form, "category", 120);
  const images = list(form, "images", 40);
  const colourFamily = text(form, "colourFamily", 20);

  if (name.length < 2) return { error: "Give the product a name." };
  if (!slug) {
    return {
      error: typedSlug
        ? "The web address needs English letters or numbers. Type one in “Web address”, for example navy-blazer."
        : "We couldn't make a web address from this name. Type one in English letters in “Web address” (under the name), for example navy-blazer.",
    };
  }
  if (!original && RESERVED_SLUGS.has(slug)) return { error: `“${slug}” can't be used as a web address on its own. Type a longer one in “Web address”, for example ${slug}-navy-blazer.` };
  if (!category) return { error: "Choose a category." };
  if (!images.length) return { error: "Add at least one photograph. The first is shown on product cards." };

  // One reading for both prices: "45,000", "৳45,000" and "45000.00" are all 45000; "45000.50" is refused, never 4500050.
  const priced = moneyField(form, "price", "price", "45000");
  if (priced.error !== undefined) return { error: priced.error };
  const sale = moneyField(form, "salePrice", "sale price", "40000");
  if (sale.error !== undefined) return { error: sale.error };
  const price = priced.value;
  // A sale price of 0 means "no sale", the same as leaving it empty.
  const salePrice = sale.value ? sale.value : null;
  if (price === 0) return { error: "A price must be more than 0. Leave it empty to show “Price on request”." };
  if (salePrice !== null && price === null) return { error: "A sale price needs a regular price. Type the price too, or leave the sale price empty." };
  if (salePrice !== null && price !== null && salePrice >= price) {
    return { error: `The sale price must be lower than the price (${formatPrice(price)}). Leave it empty for no sale.` };
  }

  const values = [
    slug,
    name,
    category,
    JSON.stringify(images),
    JSON.stringify(list(form, "videos", 20)),
    text(form, "colour", 80),
    COLOUR_FAMILIES.includes(colourFamily) ? colourFamily : "Multi",
    text(form, "fabric", 80) || null,
    text(form, "code", 40) || null,
    JSON.stringify(form.getAll("occasions").filter((o): o is string => typeof o === "string" && OCCASIONS.includes(o))),
    text(form, "summary", 300),
    text(form, "description", 4000),
    JSON.stringify(lines(form, "details")),
    text(form, "note", 500) || null,
    price,
    salePrice,
    text(form, "badge", 30) || null,
    bool(form, "featured"),
    bool(form, "visible"),
  ];

  let c: PoolClient;
  try {
    c = await pool.connect();
  } catch (error) {
    return { error: dbMessage(error) };
  }
  try {
    // The category may have been deleted in another tab since this form was opened.
    const exists = await c.query("SELECT 1 FROM categories WHERE key = $1", [category]);
    if (!exists.rowCount) return { error: "That category no longer exists. Choose another one." };

    await c.query("BEGIN");
    if (original) {
      // Moving to another category puts the piece at the end of its new category, as a new piece would be.
      const { rowCount } = await c.query(
        `UPDATE products SET name=$2, category=$3, images=$4::jsonb, videos=$5::jsonb, colour=$6, colour_family=$7, fabric=$8, code=$9,
           occasions=$10::jsonb, summary=$11, description=$12, details=$13::jsonb, note=$14, price=$15, sale_price=$16, badge=$17,
           featured=$18, visible=$19, updated_at=now(),
           position = CASE WHEN category = $3 THEN position ELSE (SELECT coalesce(max(p.position), 0) + 1 FROM products p WHERE p.category = $3) END
         WHERE slug=$1`,
        values,
      );
      if (!rowCount) {
        await c.query("ROLLBACK");
        return { error: "This product no longer exists. It may have been deleted in another tab." };
      }
    } else {
      const taken = await c.query("SELECT 1 FROM products WHERE slug = $1", [slug]);
      if (taken.rowCount) {
        await c.query("ROLLBACK");
        return { error: `Another product already uses the web address /products/${slug}. Change “Web address” (under the name) to something different.` };
      }
      await c.query(
        `INSERT INTO products (slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note,
           price, sale_price, badge, featured, visible, position)
         VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15,$16,$17,$18,$19,
           (SELECT coalesce(max(position), 0) + 1 FROM products WHERE category = $3))`,
        values,
      );
      // A piece added again under the address of one that was deleted is no longer "removed".
      await c.query("DELETE FROM removed_items WHERE kind = 'product' AND key = $1", [slug]);
    }
    await c.query("COMMIT");
  } catch (error) {
    await c.query("ROLLBACK").catch(() => {});
    const code = (error as { code?: string })?.code;
    if (code === "23505") return { error: `Another product already uses the web address /products/${slug}. Change “Web address” (under the name) to something different.` };
    if (code === "23503") return { error: "That category no longer exists. Choose another one." };
    return { error: dbMessage(error) };
  } finally {
    c.release();
  }
  updateTag(CATALOG_TAG);
  // Back to the list, filtered to the piece's category, with a notice naming it.
  redirect(`/admin/products?category=${encodeURIComponent(category)}&saved=${encodeURIComponent(slug)}`);
}

export async function deleteProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug", 120);
  const pool = db();
  let category = "";
  if (pool && slug) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query("DELETE FROM products WHERE slug = $1 RETURNING category", [slug]);
      // Remembered so that re-importing the built-in catalogue does not bring the piece back.
      if (rows.length) await client.query("INSERT INTO removed_items (kind, key) VALUES ('product', $1) ON CONFLICT DO NOTHING", [slug]);
      await client.query("COMMIT");
      category = (rows[0]?.category as string | undefined) ?? "";
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/products?${category ? `category=${encodeURIComponent(category)}&` : ""}deleted=1`);
}

/** Show or hide a product without opening it. */
export async function setProductVisible(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("UPDATE products SET visible = $2, updated_at = now() WHERE slug = $1", [text(form, "slug", 120), bool(form, "visible")]);
  updateTag(CATALOG_TAG);
}

/** Move a product up or down within its category. */
export async function moveProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const pool = db();
  if (!pool) return;
  const slug = text(form, "slug", 120);
  const direction = text(form, "direction", 4) === "up" ? -1 : 1;
  const { rows } = await pool.query("SELECT slug FROM products WHERE category = (SELECT category FROM products WHERE slug = $1) ORDER BY position, created_at", [slug]);
  const order = rows.map((r) => r.slug as string);
  const i = order.indexOf(slug);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  await pool.query("UPDATE products p SET position = o.n FROM unnest($1::text[]) WITH ORDINALITY AS o(slug, n) WHERE p.slug = o.slug", [order]);
  updateTag(CATALOG_TAG);
}
