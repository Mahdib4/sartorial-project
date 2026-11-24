"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dbMessage, int, list, slugify, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";

/** Web addresses the admin's own pages use (/admin/collections/new is the "add" form), so no collection can have them. */
const RESERVED_SLUGS = new Set(["new"]);

/** Create or update a curated collection or launch (its page is /collections/<slug>). */
export async function saveCurated(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const original = text(form, "original", 120);
  const title = text(form, "title", 160);
  const typed = text(form, "slug", 120);
  const slug = original || slugify(typed || title);
  const cover = list(form, "cover", 1)[0] ?? null;
  const products = [...new Set(list(form, "products", 120))];
  const position = int(form, "position") ?? 0;

  if (title.length < 2) return { error: "Give the collection a title." };
  if (!slug) {
    return {
      error: typed
        ? "Type the web address in English letters or numbers, for example “eid-edit”."
        : `A web address can't be made from the title “${title}”, because it has no English letters. Type one in English letters in the “Web address” field, for example “eid-edit”.`,
    };
  }
  if (!original && RESERVED_SLUGS.has(slug)) {
    return { error: `“${slug}” can't be used as a web address on its own. Type a longer one in the “Web address” field, for example “new-arrivals”.` };
  }
  if (Math.abs(position) > 100_000) return { error: "The position should be a small number, such as 1, 2 or 3." };

  const values = [slug, title, text(form, "eyebrow", 60), text(form, "intro", 2000), cover, JSON.stringify(products), bool(form, "isLaunch"), bool(form, "visible"), position];

  try {
    if (original) {
      const { rowCount } = await pool.query(
        `UPDATE curated SET title=$2, eyebrow=$3, intro=$4, cover=$5, products=$6::jsonb, is_launch=$7, visible=$8, position=$9, updated_at=now() WHERE slug=$1`,
        values,
      );
      if (!rowCount) return { error: "This collection no longer exists." };
    } else {
      const { rows } = await pool.query("SELECT title FROM curated WHERE slug = $1", [slug]);
      if (rows[0]) return { error: `Another collection (“${rows[0].title}”) already uses the web address /collections/${slug}. Choose a different one.` };
      await pool.query(
        `INSERT INTO curated (slug, title, eyebrow, intro, cover, products, is_launch, visible, position)
         VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9)`,
        values,
      );
    }
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/collections?saved=${encodeURIComponent(slug)}`);
}

/** Delete a collection. Banners leading to it simply show without a link afterwards. */
export async function deleteCurated(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("DELETE FROM curated WHERE slug = $1", [text(form, "slug", 120)]);
  updateTag(CATALOG_TAG);
  redirect("/admin/collections?deleted=1");
}

/** Show or hide a collection without opening it. */
export async function setCuratedVisible(form: FormData): Promise<void> {
  await requireAdmin();
  await db()?.query("UPDATE curated SET visible = $2, updated_at = now() WHERE slug = $1", [text(form, "slug", 120), bool(form, "visible")]);
  updateTag(CATALOG_TAG);
}
