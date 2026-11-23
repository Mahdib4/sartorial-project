"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dbMessage, list, slugify, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";

const DEPARTMENTS: Record<string, string> = { heritage: "Heritage", classic: "Classic", accessories: "Accessories", footwear: "Footwear" };
const SIZE_SCALES = ["tailoring", "shirts", "trousers", "footwear", "one"];

/** Create or update a category. Its department and web address (and so its key) are fixed once created. */
export async function saveCategory(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const original = text(form, "original", 200);
  const name = text(form, "name", 120);
  const preview = list(form, "preview", 6);
  const sizes = text(form, "sizes", 20);
  const blurb = text(form, "blurb", 200);
  const intro = text(form, "intro", 2000);
  const visible = bool(form, "visible");

  if (name.length < 2) return { error: "Give the category a name." };
  if (!preview.length) return { error: "Add at least one hover photograph. The first is also the category page photograph." };
  if (!SIZE_SCALES.includes(sizes)) return { error: "Choose which sizes its products come in." };

  let key = original;
  try {
    if (original) {
      const { rowCount } = await pool.query(
        "UPDATE categories SET name=$2, blurb=$3, intro=$4, preview=$5::jsonb, sizes=$6, visible=$7, updated_at=now() WHERE key=$1",
        [original, name, blurb, intro, JSON.stringify(preview), sizes, visible],
      );
      if (!rowCount) return { error: "This category no longer exists." };
    } else {
      const collection = text(form, "collection", 20);
      const slug = slugify(text(form, "slug", 120) || name);
      if (!DEPARTMENTS[collection]) return { error: "Choose a department." };
      if (!slug) return { error: "The web address is empty. Use letters or numbers." };
      key = `${collection}/${slug}`;
      const { rows } = await pool.query("SELECT name FROM categories WHERE key = $1", [key]);
      if (rows[0]) return { error: `${DEPARTMENTS[collection]} already has a category at this web address (“${rows[0].name}”). Choose a different web address.` };
      await pool.query(
        `INSERT INTO categories (key, slug, collection, name, blurb, intro, preview, sizes, visible, position)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9, (SELECT coalesce(max(position), 0) + 1 FROM categories WHERE collection = $3))`,
        [key, slug, collection, name, blurb, intro, JSON.stringify(preview), sizes, visible],
      );
    }
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/categories?saved=${encodeURIComponent(key)}`);
}

/** Delete an empty category. One that still has products is refused, so no product is left without a home. */
export async function deleteCategory(form: FormData): Promise<void> {
  await requireAdmin();
  const pool = db();
  if (!pool) return;
  const key = text(form, "key", 200);
  let inUse = false;
  try {
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM products WHERE category = $1", [key]);
    inUse = rows[0].n > 0;
    if (!inUse) await pool.query("DELETE FROM categories WHERE key = $1", [key]);
  } catch (error) {
    // A product was added to it in the meantime (the database refuses the delete): show the explanation instead.
    if ((error as { code?: string })?.code !== "23503") throw error;
    inUse = true;
  }
  if (inUse) redirect(`/admin/categories/${key}?delete=1`);
  updateTag(CATALOG_TAG);
  redirect("/admin/categories?deleted=1");
}

/** Show or hide a category (and so every product in it) without opening it. */
export async function setCategoryVisible(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("UPDATE categories SET visible = $2, updated_at = now() WHERE key = $1", [text(form, "key", 200), bool(form, "visible")]);
  updateTag(CATALOG_TAG);
}

/** Move a category up or down within its department (the order of the menus and department pages). */
export async function moveCategory(form: FormData): Promise<void> {
  await requireAdmin();
  const pool = db();
  if (!pool) return;
  const key = text(form, "key", 200);
  const direction = text(form, "direction", 4) === "up" ? -1 : 1;
  const { rows } = await pool.query("SELECT key FROM categories WHERE collection = (SELECT collection FROM categories WHERE key = $1) ORDER BY position, name", [key]);
  const order = rows.map((r) => r.key as string);
  const i = order.indexOf(key);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  await pool.query("UPDATE categories c SET position = o.n FROM unnest($1::text[]) WITH ORDINALITY AS o(key, n) WHERE c.key = o.key", [order]);
  updateTag(CATALOG_TAG);
}
