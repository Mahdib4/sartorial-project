"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATALOG_TAG } from "@/data/store";
import { requireAdmin } from "@/lib/admin/auth";
import { bool, dbMessage, int, lines, list, slugify, text, type FormState } from "@/lib/admin/form";
import { db } from "@/lib/db";

const COLOUR_FAMILIES = ["Black", "Navy", "Blue", "Grey", "Brown", "Green", "Ivory", "Gold", "Pink", "Red", "White", "Multi"];
const OCCASIONS = ["Wedding", "Festive", "Black tie", "Business", "Casual"];

/** Create or update a product. */
export async function saveProduct(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const pool = db();
  if (!pool) return { error: "The database is not connected." };

  const original = text(form, "original", 120);
  const name = text(form, "name", 160);
  const slug = original || slugify(text(form, "slug", 120) || name);
  const category = text(form, "category", 120);
  const images = list(form, "images", 40);
  const price = int(form, "price");
  const salePrice = int(form, "salePrice");
  const colourFamily = text(form, "colourFamily", 20);

  if (name.length < 2) return { error: "Give the product a name." };
  if (!slug) return { error: "The web address (slug) is empty." };
  if (!category) return { error: "Choose a category." };
  if (!images.length) return { error: "Add at least one photograph. The first is shown on product cards." };
  if (price !== null && price < 0) return { error: "The price cannot be negative." };
  if (salePrice !== null && (price === null || salePrice >= price)) return { error: "A sale price needs a regular price, and must be lower than it." };

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

  try {
    if (original) {
      const { rowCount } = await pool.query(
        `UPDATE products SET name=$2, category=$3, images=$4::jsonb, videos=$5::jsonb, colour=$6, colour_family=$7, fabric=$8, code=$9,
           occasions=$10::jsonb, summary=$11, description=$12, details=$13::jsonb, note=$14, price=$15, sale_price=$16, badge=$17,
           featured=$18, visible=$19, updated_at=now() WHERE slug=$1`,
        values,
      );
      if (!rowCount) return { error: "This product no longer exists." };
    } else {
      await pool.query(
        `INSERT INTO products (slug, name, category, images, videos, colour, colour_family, fabric, code, occasions, summary, description, details, note,
           price, sale_price, badge, featured, visible, position)
         VALUES ($1,$2,$3,$4::jsonb,$5::jsonb,$6,$7,$8,$9,$10::jsonb,$11,$12,$13::jsonb,$14,$15,$16,$17,$18,$19,
           (SELECT coalesce(max(position), 0) + 1 FROM products WHERE category = $3))`,
        values,
      );
    }
  } catch (error) {
    return { error: dbMessage(error) };
  }
  updateTag(CATALOG_TAG);
  redirect(`/admin/products?saved=${encodeURIComponent(slug)}`);
}

export async function deleteProduct(form: FormData): Promise<void> {
  await requireAdmin();
  const slug = text(form, "slug", 120);
  await db()?.query("DELETE FROM products WHERE slug = $1", [slug]);
  updateTag(CATALOG_TAG);
  redirect("/admin/products?deleted=1");
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
